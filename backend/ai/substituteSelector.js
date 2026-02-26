/**
 * AI Substitute Selector
 * Uses Cerebras GPT-OSS-120B to intelligently rank and select the best substitute
 */

const axios = require('axios');
require('dotenv').config();

/**
 * Select the best substitute using AI
 * @param {Object} classDetails - Details of the class that needs a substitute
 * @param {Array} candidates - Array of eligible substitute candidates
 * @returns {Object|null} - Selected substitute or null if AI fails
 */
const selectBestSubstitute = async (classDetails, candidates) => {
  console.log('🤖 AI Substitute Selection started...');
  
  // If no candidates, return null
  if (!candidates || candidates.length === 0) {
    console.log('   No candidates provided');
    return null;
  }

  // If only one candidate, return directly
  if (candidates.length === 1) {
    console.log('   Only one candidate available, selecting directly');
    return candidates[0];
  }

  // Prepare the prompt for AI
  const prompt = buildPrompt(classDetails, candidates);

  try {
    // Try to use Cerebras AI
    const apiKey = process.env.CEREBRAS_API_KEY;
    
    if (!apiKey || apiKey === 'your_cerebras_api_key_here') {
      console.log('   ⚠️ No Cerebras API key configured, using fallback selection');
      return selectFallback(candidates, classDetails);
    }

    const response = await axios.post(
      process.env.CEREBRAS_ENDPOINT || 'https://api.cerebras.ai/v1/chat/completions',
      {
        model: 'gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are an academic scheduler helping to select the best substitute teacher. You must respond with ONLY the ID number of the selected candidate and nothing else.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content?.trim();
    console.log(`   AI Response: ${aiResponse}`);

    // Parse the AI response to get the selected ID
    const selectedId = parseInt(aiResponse);
    
    if (isNaN(selectedId)) {
      console.log('   ⚠️ AI response invalid, using fallback');
      return selectFallback(candidates, classDetails);
    }

    const selectedCandidate = candidates.find(c => c.id === selectedId);
    
    if (selectedCandidate) {
      console.log(`   ✅ AI selected: ${selectedCandidate.name}`);
      return selectedCandidate;
    } else {
      console.log('   ⚠️ Selected ID not found in candidates, using fallback');
      return selectFallback(candidates, classDetails);
    }

  } catch (error) {
    console.error('   ❌ AI API Error:', error.message);
    console.log('   🔄 Falling back to rule-based selection');
    return selectFallback(candidates, classDetails);
  }
};

/**
 * Build the prompt for AI
 */
const buildPrompt = (classDetails, candidates) => {
  const candidatesList = candidates.map((c, index) => {
    return `${index + 1}. ID: ${c.id}, Name: ${c.name}, Department: ${c.department}, Workload: ${c.workload_hours} hours, Current Substitutions: ${c.current_substitutions || 0}, Designation: ${c.designation || 'N/A'}`;
  }).join('\n');

  return `
Class Details:
- Subject: ${classDetails.subject}
- Year/Section: ${classDetails.year} ${classDetails.section || ''}
- Scheduled Time: ${classDetails.start_time} to ${classDetails.end_time}
- Room: ${classDetails.room || 'TBA'}
- Original Faculty Department: ${classDetails.department}

Available Candidates for Substitution:
${candidatesList}

Selection Criteria (in order of priority):
1. Same department as original faculty (preferred)
2. Lower current workload (prefer less busy faculty)
3. Fewer current substitutions (fair workload distribution)
4. Appropriate subject expertise

Based on these criteria, which candidate (provide ONLY the ID number) would be the best substitute for this class? Respond with ONLY the ID number.
`;
};

/**
 * Fallback selection using rules
 * Used when AI is unavailable or fails
 */
const selectFallback = (candidates, classDetails) => {
  console.log('   🔧 Using rule-based fallback selection...');
  
  // Score each candidate based on rules
  const scoredCandidates = candidates.map(candidate => {
    let score = 0;
    
    // Priority 1: Same department (most important)
    if (candidate.department === classDetails.department) {
      score += 100;
    }
    
    // Priority 2: Lower workload
    score += (20 - (candidate.workload_hours || 0));
    
    // Priority 3: Fewer substitutions
    score -= (candidate.current_substitutions || 0) * 5;
    
    return { ...candidate, score };
  });

  // Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);
  
  const selected = scoredCandidates[0];
  console.log(`   ✅ Fallback selected: ${selected.name} (score: ${selected.score})`);
  
  return selected;
};

module.exports = {
  selectBestSubstitute
};
