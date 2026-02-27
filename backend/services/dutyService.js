/**
 * Duty Service - Core Automation Pipeline
 * Handles automatic substitute assignment when duties are assigned
 */

const { getMultipleRows, getSingleRow, executeQuery } = require('../db');
const { selectBestSubstitute } = require('../ai/substituteSelector');

/**
 * Main pipeline function - triggered when a duty is assigned
 * 1. Mark faculty as unavailable
 * 2. Find affected classes
 * 3. Find eligible substitutes
 * 4. Use AI to rank candidates
 * 5. Assign best substitute automatically
 * 6. Update timetable
 * 7. Create notifications
 */
const assignDutyPipeline = async (duty, io) => {
  console.log(`🎯 Starting duty assignment pipeline for duty ID: ${duty.id}`);
  
  const results = {
    success: true,
    dutyId: duty.id,
    affectedClasses: [],
    substitutions: [],
    errors: []
  };

  try {
    // Step 1: Mark faculty as unavailable
    console.log('📌 Step 1: Marking faculty as unavailable...');
    await markFacultyUnavailable(duty);
    
    // Step 2: Find affected classes (classes the faculty was supposed to teach)
    console.log('🔍 Step 2: Finding affected classes...');
    const affectedClasses = await findAffectedClasses(duty);
    results.affectedClasses = affectedClasses;
    console.log(`   Found ${affectedClasses.length} affected classes`);

    // Step 3: For each affected class, find eligible substitutes and assign
    for (const timetableEntry of affectedClasses) {
      try {
        console.log(`\n📚 Processing class: ${timetableEntry.subject} for ${timetableEntry.year} ${timetableEntry.section}`);
        
        // Step 4: Find eligible substitutes
        const candidates = await findEligibleSubstitutes(duty, timetableEntry);
        console.log(`   Found ${candidates.length} eligible candidates`);

        if (candidates.length === 0) {
          console.log('   ⚠️ No eligible substitutes found!');
          results.errors.push({
            timetableId: timetableEntry.id,
            message: 'No eligible substitutes found'
          });
          continue;
        }

        // Step 5: Use AI to select best substitute
        console.log('🤖 Step 5: Using AI to select best substitute...');
        const selectedSubstitute = await selectBestSubstitute(timetableEntry, candidates);
        
        if (!selectedSubstitute) {
          console.log('   ⚠️ AI selection failed, using fallback...');
          // Fallback to first available candidate
          selectedSubstitute = candidates[0];
        }

        console.log(`   ✅ Selected: ${selectedSubstitute.name}`);

        // Step 6: Assign substitute
        const substitution = await createSubstitution(duty, timetableEntry, selectedSubstitute);
        results.substitutions.push(substitution);

        // Step 7: Send notifications
        await sendNotifications(duty, timetableEntry, selectedSubstitute, io);

      } catch (classError) {
        console.error(`   ❌ Error processing class: ${classError.message}`);
        results.errors.push({
          timetableId: timetableEntry.id,
          message: classError.message
        });
      }
    }

    // Notify admin room about completion
    if (io) {
      io.to('admin_room').emit('duty_processed', {
        dutyId: duty.id,
        substitutionsCount: results.substitutions.length,
        errorsCount: results.errors.length
      });
    }

    console.log('\n✅ Duty assignment pipeline completed');
    return results;

  } catch (error) {
    console.error('❌ Pipeline error:', error);
    results.success = false;
    results.errors.push({ message: error.message });
    return results;
  }
};

/**
 * Mark faculty as unavailable for the duty duration
 */
const markFacultyUnavailable = async (duty) => {
  await executeQuery(
    `INSERT INTO unavailability (faculty_id, start_datetime, end_datetime, reason) 
     VALUES (?, ?, ?, ?)`,
    [
      duty.faculty_id,
      `${duty.duty_date} ${duty.start_time}`,
      `${duty.duty_date} ${duty.end_time}`,
      `Duty: ${duty.duty_type}`
    ]
  );
};

/**
 * Find classes affected by the duty
 */
const findAffectedClasses = async (duty) => {
  const dayOfWeek = new Date(duty.duty_date).toLocaleDateString('en-US', { weekday: 'long' });
  
  return await getMultipleRows(`
    SELECT t.*, f.name as faculty_name, f.department
    FROM timetable t
    JOIN faculty f ON t.faculty_id = f.id
    WHERE t.faculty_id = ?
      AND t.day_of_week = ?
      AND t.start_time < ?
      AND t.end_time > ?
  `, [duty.faculty_id, dayOfWeek, duty.end_time, duty.start_time]);
};

/**
 * Find eligible substitutes for a class
 * Returns faculty who are NOT already assigned any duty or substitution during the time slot
 */
const findEligibleSubstitutes = async (duty, timetableEntry) => {
  const dayOfWeek = new Date(duty.duty_date).toLocaleDateString('en-US', { weekday: 'long' });
  
  // Get available faculty who:
  // 1. Are available
  // 2. Don't have a class at this time
  // 3. Don't have a break at this time
  // 4. Don't have another duty at this time (EXCLUDED)
  // 5. Don't already have a substitution at this time (EXCLUDED)
  return await getMultipleRows(`
    SELECT 
      f.id,
      f.name,
      f.email,
      f.department,
      f.workload_hours,
      f.designation,
      (SELECT COUNT(*) FROM substitutions sub 
       WHERE sub.substitute_faculty_id = f.id 
       AND sub.substitution_date = ?
       AND sub.status = 'confirmed') as current_substitutions
    FROM faculty f
    WHERE f.id != ?
      AND f.is_available = TRUE
      -- Exclude faculty who have their own class at this time
      AND f.id NOT IN (
        SELECT t2.faculty_id FROM timetable t2
        WHERE t2.day_of_week = ?
        AND t2.start_time < ?
        AND t2.end_time > ?
      )
      -- Exclude faculty who are on break at this time
      AND f.id NOT IN (
        SELECT b.faculty_id FROM breaks b
        WHERE b.day_of_week = ?
        AND b.start_time < ?
        AND b.end_time > ?
      )
      -- Exclude faculty who have ANOTHER duty at this time
      AND f.id NOT IN (
        SELECT d2.faculty_id FROM duties d2
        WHERE d2.duty_date = ?
        AND d2.status = 'assigned'
        AND d2.id != ?
        AND d2.start_time < ?
        AND d2.end_time > ?
      )
      -- Exclude faculty who are ALREADY assigned as substitute at this time
      AND f.id NOT IN (
        SELECT s2.substitute_faculty_id FROM substitutions s2
        WHERE s2.substitution_date = ?
        AND s2.status = 'confirmed'
        AND s2.start_time < ?
        AND s2.end_time > ?
      )
    ORDER BY 
      (f.department = ?) DESC,
      current_substitutions ASC,
      f.workload_hours ASC
  `, [
    duty.duty_date,
    duty.faculty_id,
    dayOfWeek, duty.end_time, duty.start_time,
    dayOfWeek, duty.end_time, duty.start_time,
    duty.duty_date, duty.id, duty.end_time, duty.start_time,
    duty.duty_date, duty.end_time, duty.start_time,
    timetableEntry.department
  ]);
};

/**
 * Create a substitution record
 */
const createSubstitution = async (duty, timetableEntry, substitute) => {
  const result = await executeQuery(
    `INSERT INTO substitutions 
     (original_faculty_id, substitute_faculty_id, timetable_id, duty_id, substitution_date, start_time, end_time, status, ai_selected)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', TRUE)`,
    [
      duty.faculty_id,
      substitute.id,
      timetableEntry.id,
      duty.id,
      duty.duty_date,
      timetableEntry.start_time,
      timetableEntry.end_time
    ]
  );

  return await getSingleRow(`
    SELECT s.*, 
      sf.name as substitute_name,
      t.subject, t.year, t.section, t.room
    FROM substitutions s
    JOIN faculty sf ON s.substitute_faculty_id = sf.id
    JOIN timetable t ON s.timetable_id = t.id
    WHERE s.id = ?
  `, [result.insertId]);
};

/**
 * Send notifications to affected faculty
 */
const sendNotifications = async (duty, timetableEntry, substitute, io) => {
  const ioRoom = io;

  // Notify the substitute
  await executeQuery(
    `INSERT INTO notifications (faculty_id, title, message, type) VALUES (?, ?, ?, ?)`,
    [
      substitute.id,
      'Substitute Class Assigned',
      `You have been assigned to take class for ${timetableEntry.subject} (${timetableEntry.year} ${timetableEntry.section}) on ${duty.duty_date} from ${timetableEntry.start_time} to ${timetableEntry.end_time} in ${timetableEntry.room}. Original faculty has a ${duty.duty_type} duty.`,
      'substitution'
    ]
  );

  // Send real-time notification if io is available
  if (ioRoom) {
    ioRoom.to(`faculty_${substitute.id}`).emit('notification', {
      title: 'Substitute Class Assigned',
      message: `You have been assigned to take class for ${timetableEntry.subject}`,
      type: 'substitution'
    });
  }

  // Notify admin
  if (ioRoom) {
    ioRoom.to('admin_room').emit('substitution_created', {
      substituteName: substitute.name,
      subject: timetableEntry.subject,
      date: duty.duty_date
    });
  }
};

module.exports = {
  assignDutyPipeline,
  markFacultyUnavailable,
  findAffectedClasses,
  findEligibleSubstitutes
};
