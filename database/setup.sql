-- =====================================================
-- AI-Powered Faculty Duty & Substitution Management Portal
-- Database Setup Script
-- =====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS faculty_portal;
USE faculty_portal;

-- =====================================================
-- FACULTY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS faculty (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(50),
    phone VARCHAR(20),
    is_available BOOLEAN DEFAULT TRUE,
    workload_hours DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_department (department),
    INDEX idx_availability (is_available)
);

-- =====================================================
-- ADMINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TIMETABLE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    section VARCHAR(20),
    room VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    INDEX idx_faculty_day (faculty_id, day_of_week),
    INDEX idx_day_time (day_of_week, start_time)
);

-- =====================================================
-- DUTIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS duties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    duty_type ENUM('exam', 'placement', 'invigilation', 'event', 'meeting', 'other') NOT NULL,
    duty_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(100),
    description TEXT,
    status ENUM('assigned', 'completed', 'cancelled') DEFAULT 'assigned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    INDEX idx_faculty_duty (faculty_id, duty_date),
    INDEX idx_date (duty_date)
);

-- =====================================================
-- UNAVAILABILITY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS unavailability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    INDEX idx_faculty_unavailable (faculty_id, start_datetime, end_datetime)
);

-- =====================================================
-- BREAKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS breaks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    INDEX idx_faculty_break (faculty_id, day_of_week)
);

-- =====================================================
-- SUBSTITUTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS substitutions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    original_faculty_id INT NOT NULL,
    substitute_faculty_id INT NOT NULL,
    timetable_id INT NOT NULL,
    duty_id INT,
    substitution_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    ai_selected BOOLEAN DEFAULT TRUE,
    admin_override BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (original_faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    FOREIGN KEY (substitute_faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    FOREIGN KEY (timetable_id) REFERENCES timetable(id) ON DELETE CASCADE,
    FOREIGN KEY (duty_id) REFERENCES duties(id) ON DELETE SET NULL,
    INDEX idx_substitute (substitute_faculty_id, substitution_date),
    INDEX idx_date_status (substitution_date, status)
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('duty', 'substitution', 'schedule', 'alert', 'info') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    INDEX idx_faculty_notify (faculty_id, is_read),
    INDEX idx_created (created_at)
);

-- =====================================================
-- SAMPLE DATA - FACULTY
-- =====================================================
INSERT INTO faculty (name, email, department, designation, phone, workload_hours) VALUES
('Dr. Rajesh Kumar', 'rajesh.kumar@college.edu', 'Computer Science', 'Professor', '9876543210', 12.0),
('Prof. Priya Sharma', 'priya.sharma@college.edu', 'Computer Science', 'Associate Professor', '9876543211', 10.0),
('Dr. Amit Patel', 'amit.patel@college.edu', 'Computer Science', 'Assistant Professor', '9876543212', 8.0),
('Ms. Sneha Gupta', 'sneha.gupta@college.edu', 'Computer Science', 'Assistant Professor', '9876543213', 9.0),
('Dr. Vikram Singh', 'vikram.singh@college.edu', 'Computer Science', 'Professor', '9876543214', 11.0),
('Prof. Anjali Reddy', 'anjali.reddy@college.edu', 'Computer Science', 'Associate Professor', '9876543215', 10.0),
('Dr. Sanjay Mishra', 'sanjay.mishra@college.edu', 'Mathematics', 'Professor', '9876543216', 12.0),
('Prof. Kavita Devi', 'kavita.devi@college.edu', 'Mathematics', 'Associate Professor', '9876543217', 9.0);

-- =====================================================
-- SAMPLE DATA - ADMINS (password: admin123)
-- =====================================================
INSERT INTO admins (username, password, name, email) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', 'admin@college.edu');

-- =====================================================
-- SAMPLE DATA - TIMETABLE (Monday)
-- =====================================================
INSERT INTO timetable (faculty_id, day_of_week, start_time, end_time, subject, year, section, room) VALUES
(1, 'Monday', '09:00:00', '10:00:00', 'Data Structures', 'BTech Year 2', 'A', 'CS-101'),
(1, 'Monday', '10:00:00', '11:00:00', 'Data Structures', 'BTech Year 2', 'B', 'CS-101'),
(1, 'Monday', '14:00:00', '15:00:00', 'Algorithms', 'BTech Year 3', 'A', 'CS-102'),
(2, 'Monday', '09:00:00', '10:00:00', 'Database Management', 'BTech Year 2', 'A', 'CS-103'),
(2, 'Monday', '11:00:00', '12:00:00', 'Database Management', 'BTech Year 2', 'B', 'CS-103'),
(2, 'Monday', '14:00:00', '15:00:00', 'SQL Lab', 'BTech Year 2', 'A', 'DB-Lab'),
(3, 'Monday', '09:00:00', '10:00:00', 'Machine Learning', 'BTech Year 3', 'A', 'CS-104'),
(3, 'Monday', '10:00:00', '11:00:00', 'Machine Learning', 'BTech Year 3', 'B', 'CS-104'),
(3, 'Monday', '15:00:00', '16:00:00', 'Deep Learning', 'BTech Year 4', 'A', 'ML-Lab'),
(4, 'Monday', '09:00:00', '10:00:00', 'Web Development', 'BTech Year 3', 'A', 'CS-105'),
(4, 'Monday', '11:00:00', '12:00:00', 'Web Development', 'BTech Year 3', 'B', 'CS-105'),
(4, 'Monday', '14:00:00', '15:00:00', 'React Lab', 'BTech Year 3', 'A', 'Web-Lab'),
(5, 'Monday', '10:00:00', '11:00:00', 'Computer Networks', 'BTech Year 3', 'A', 'CS-106'),
(5, 'Monday', '11:00:00', '12:00:00', 'Computer Networks', 'BTech Year 3', 'B', 'CS-106'),
(5, 'Monday', '14:00:00', '15:00:00', 'Cloud Computing', 'BTech Year 4', 'A', 'CS-107'),
(6, 'Monday', '09:00:00', '10:00:00', 'Software Engineering', 'BTech Year 3', 'A', 'CS-108'),
(6, 'Monday', '10:00:00', '11:00:00', 'Software Engineering', 'BTech Year 3', 'B', 'CS-108'),
(6, 'Monday', '15:00:00', '16:00:00', 'Project Management', 'BTech Year 4', 'A', 'CS-109');

-- =====================================================
-- SAMPLE DATA - TIMETABLE (Tuesday)
-- =====================================================
INSERT INTO timetable (faculty_id, day_of_week, start_time, end_time, subject, year, section, room) VALUES
(1, 'Tuesday', '09:00:00', '10:00:00', 'Data Structures', 'BTech Year 2', 'A', 'CS-101'),
(1, 'Tuesday', '10:00:00', '11:00:00', 'Data Structures', 'BTech Year 2', 'B', 'CS-101'),
(1, 'Tuesday', '14:00:00', '15:00:00', 'Algorithms', 'BTech Year 3', 'A', 'CS-102'),
(2, 'Tuesday', '09:00:00', '10:00:00', 'Database Management', 'BTech Year 2', 'A', 'CS-103'),
(2, 'Tuesday', '11:00:00', '12:00:00', 'Database Management', 'BTech Year 2', 'B', 'CS-103'),
(3, 'Tuesday', '09:00:00', '10:00:00', 'Machine Learning', 'BTech Year 3', 'A', 'CS-104'),
(3, 'Tuesday', '10:00:00', '11:00:00', 'Machine Learning', 'BTech Year 3', 'B', 'CS-104'),
(4, 'Tuesday', '09:00:00', '10:00:00', 'Web Development', 'BTech Year 3', 'A', 'CS-105'),
(4, 'Tuesday', '11:00:00', '12:00:00', 'Web Development', 'BTech Year 3', 'B', 'CS-105'),
(5, 'Tuesday', '10:00:00', '11:00:00', 'Computer Networks', 'BTech Year 3', 'A', 'CS-106'),
(5, 'Tuesday', '11:00:00', '12:00:00', 'Computer Networks', 'BTech Year 3', 'B', 'CS-106'),
(6, 'Tuesday', '09:00:00', '10:00:00', 'Software Engineering', 'BTech Year 3', 'A', 'CS-108'),
(6, 'Tuesday', '10:00:00', '11:00:00', 'Software Engineering', 'BTech Year 3', 'B', 'CS-108');

-- =====================================================
-- SAMPLE DATA - TIMETABLE (Wednesday)
-- =====================================================
INSERT INTO timetable (faculty_id, day_of_week, start_time, end_time, subject, year, section, room) VALUES
(1, 'Wednesday', '09:00:00', '10:00:00', 'Data Structures', 'BTech Year 2', 'A', 'CS-101'),
(1, 'Wednesday', '10:00:00', '11:00:00', 'Data Structures', 'BTech Year 2', 'B', 'CS-101'),
(2, 'Wednesday', '09:00:00', '10:00:00', 'Database Management', 'BTech Year 2', 'A', 'CS-103'),
(2, 'Wednesday', '11:00:00', '12:00:00', 'Database Management', 'BTech Year 2', 'B', 'CS-103'),
(3, 'Wednesday', '09:00:00', '10:00:00', 'Machine Learning', 'BTech Year 3', 'A', 'CS-104'),
(3, 'Wednesday', '10:00:00', '11:00:00', 'Machine Learning', 'BTech Year 3', 'B', 'CS-104'),
(4, 'Wednesday', '09:00:00', '10:00:00', 'Web Development', 'BTech Year 3', 'A', 'CS-105'),
(4, 'Wednesday', '11:00:00', '12:00:00', 'Web Development', 'BTech Year 3', 'B', 'CS-105'),
(5, 'Wednesday', '10:00:00', '11:00:00', 'Computer Networks', 'BTech Year 3', 'A', 'CS-106'),
(5, 'Wednesday', '11:00:00', '12:00:00', 'Computer Networks', 'BTech Year 3', 'B', 'CS-106'),
(6, 'Wednesday', '09:00:00', '10:00:00', 'Software Engineering', 'BTech Year 3', 'A', 'CS-108'),
(6, 'Wednesday', '10:00:00', '11:00:00', 'Software Engineering', 'BTech Year 3', 'B', 'CS-108');

-- =====================================================
-- SAMPLE DATA - TIMETABLE (Thursday)
-- =====================================================
INSERT INTO timetable (faculty_id, day_of_week, start_time, end_time, subject, year, section, room) VALUES
(1, 'Thursday', '09:00:00', '10:00:00', 'Data Structures', 'BTech Year 2', 'A', 'CS-101'),
(1, 'Thursday', '10:00:00', '11:00:00', 'Data Structures', 'BTech Year 2', 'B', 'CS-101'),
(1, 'Thursday', '14:00:00', '15:00:00', 'Algorithms', 'BTech Year 3', 'A', 'CS-102'),
(2, 'Thursday', '09:00:00', '10:00:00', 'Database Management', 'BTech Year 2', 'A', 'CS-103'),
(2, 'Thursday', '11:00:00', '12:00:00', 'Database Management', 'BTech Year 2', 'B', 'CS-103'),
(3, 'Thursday', '09:00:00', '10:00:00', 'Machine Learning', 'BTech Year 3', 'A', 'CS-104'),
(3, 'Thursday', '10:00:00', '11:00:00', 'Machine Learning', 'BTech Year 3', 'B', 'CS-104'),
(4, 'Thursday', '09:00:00', '10:00:00', 'Web Development', 'BTech Year 3', 'A', 'CS-105'),
(4, 'Thursday', '11:00:00', '12:00:00', 'Web Development', 'BTech Year 3', 'B', 'CS-105'),
(5, 'Thursday', '10:00:00', '11:00:00', 'Computer Networks', 'BTech Year 3', 'A', 'CS-106'),
(5, 'Thursday', '11:00:00', '12:00:00', 'Computer Networks', 'BTech Year 3', 'B', 'CS-106'),
(6, 'Thursday', '09:00:00', '10:00:00', 'Software Engineering', 'BTech Year 3', 'A', 'CS-108'),
(6, 'Thursday', '10:00:00', '11:00:00', 'Software Engineering', 'BTech Year 3', 'B', 'CS-108');

-- =====================================================
-- SAMPLE DATA - TIMETABLE (Friday)
-- =====================================================
INSERT INTO timetable (faculty_id, day_of_week, start_time, end_time, subject, year, section, room) VALUES
(1, 'Friday', '09:00:00', '10:00:00', 'Data Structures', 'BTech Year 2', 'A', 'CS-101'),
(1, 'Friday', '10:00:00', '11:00:00', 'Data Structures', 'BTech Year 2', 'B', 'CS-101'),
(2, 'Friday', '09:00:00', '10:00:00', 'Database Management', 'BTech Year 2', 'A', 'CS-103'),
(2, 'Friday', '11:00:00', '12:00:00', 'Database Management', 'BTech Year 2', 'B', 'CS-103'),
(3, 'Friday', '09:00:00', '10:00:00', 'Machine Learning', 'BTech Year 3', 'A', 'CS-104'),
(3, 'Friday', '10:00:00', '11:00:00', 'Machine Learning', 'BTech Year 3', 'B', 'CS-104'),
(4, 'Friday', '09:00:00', '10:00:00', 'Web Development', 'BTech Year 3', 'A', 'CS-105'),
(4, 'Friday', '11:00:00', '12:00:00', 'Web Development', 'BTech Year 3', 'B', 'CS-105'),
(5, 'Friday', '10:00:00', '11:00:00', 'Computer Networks', 'BTech Year 3', 'A', 'CS-106'),
(5, 'Friday', '11:00:00', '12:00:00', 'Computer Networks', 'BTech Year 3', 'B', 'CS-106'),
(6, 'Friday', '09:00:00', '10:00:00', 'Software Engineering', 'BTech Year 3', 'A', 'CS-108'),
(6, 'Friday', '10:00:00', '11:00:00', 'Software Engineering', 'BTech Year 3', 'B', 'CS-108');

-- =====================================================
-- SAMPLE DATA - BREAKS
-- =====================================================
INSERT INTO breaks (faculty_id, day_of_week, start_time, end_time) VALUES
(1, 'Monday', '12:00:00', '13:00:00'),
(2, 'Monday', '12:00:00', '13:00:00'),
(3, 'Monday', '12:00:00', '13:00:00'),
(4, 'Monday', '12:00:00', '13:00:00'),
(5, 'Monday', '12:00:00', '13:00:00'),
(1, 'Tuesday', '12:00:00', '13:00:00'),
(2, 'Tuesday', '12:00:00', '13:00:00'),
(3, 'Tuesday', '12:00:00', '13:00:00'),
(4, 'Tuesday', '12:00:00', '13:00:00'),
(5, 'Tuesday', '12:00:00', '13:00:00'),
(1, 'Wednesday', '12:00:00', '13:00:00'),
(2, 'Wednesday', '12:00:00', '13:00:00'),
(3, 'Wednesday', '12:00:00', '13:00:00'),
(4, 'Wednesday', '12:00:00', '13:00:00'),
(5, 'Wednesday', '12:00:00', '13:00:00'),
(1, 'Thursday', '12:00:00', '13:00:00'),
(2, 'Thursday', '12:00:00', '13:00:00'),
(3, 'Thursday', '12:00:00', '13:00:00'),
(4, 'Thursday', '12:00:00', '13:00:00'),
(5, 'Thursday', '12:00:00', '13:00:00'),
(1, 'Friday', '12:00:00', '13:00:00'),
(2, 'Friday', '12:00:00', '13:00:00'),
(3, 'Friday', '12:00:00', '13:00:00'),
(4, 'Friday', '12:00:00', '13:00:00'),
(5, 'Friday', '12:00:00', '13:00:00');

-- =====================================================
-- SAMPLE DATA - NOTIFICATIONS
-- =====================================================
INSERT INTO notifications (faculty_id, title, message, type) VALUES
(1, 'Welcome to Faculty Portal', 'Welcome to the AI-Powered Faculty Duty & Substitution Management Portal', 'info'),
(2, 'Welcome to Faculty Portal', 'Welcome to the AI-Powered Faculty Duty & Substitution Management Portal', 'info'),
(3, 'Welcome to Faculty Portal', 'Welcome to the AI-Powered Faculty Duty & Substitution Management Portal', 'info');

-- =====================================================
-- VIEW: Get complete schedule with faculty details
-- =====================================================
CREATE OR REPLACE VIEW v_timetable_complete AS
SELECT 
    t.id,
    t.day_of_week,
    t.start_time,
    t.end_time,
    t.subject,
    t.year,
    t.section,
    t.room,
    f.id as faculty_id,
    f.name as faculty_name,
    f.department,
    f.email
FROM timetable t
JOIN faculty f ON t.faculty_id = f.id;

-- =====================================================
-- VIEW: Get substitutions with details
-- =====================================================
CREATE OR REPLACE VIEW v_substitutions_complete AS
SELECT 
    s.id,
    s.substitution_date,
    s.start_time,
    s.end_time,
    s.status,
    s.ai_selected,
    s.admin_override,
    of.id as original_faculty_id,
    of.name as original_faculty_name,
    sf.id as substitute_faculty_id,
    sf.name as substitute_faculty_name,
    t.subject,
    t.year,
    t.section,
    t.room,
    d.duty_type,
    d.location as duty_location
FROM substitutions s
JOIN faculty of ON s.original_faculty_id = of.id
JOIN faculty sf ON s.substitute_faculty_id = sf.id
JOIN timetable t ON s.timetable_id = t.id
LEFT JOIN duties d ON s.duty_id = d.id;

-- =====================================================
-- PROCEDURE: Get eligible substitutes
-- =====================================================
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_eligible_substitutes(
    IN p_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_day_of_week VARCHAR(20),
    IN p_department VARCHAR(50)
)
BEGIN
    SELECT 
        f.id,
        f.name,
        f.department,
        f.email,
        f.workload_hours,
        COUNT(DISTINCT t.id) as current_classes,
        COUNT(DISTINCT s.id) as current_substitutions,
        CASE WHEN f.department = p_department THEN 1 ELSE 0 END as same_dept
    FROM faculty f
    LEFT JOIN timetable t ON f.id = t.faculty_id 
        AND t.day_of_week = p_day_of_week
        AND NOT (t.end_time <= p_start_time OR t.start_time >= p_end_time)
    LEFT JOIN substitutions s ON f.id = s.substitute_faculty_id
        AND s.substitution_date = p_date
        AND s.status = 'confirmed'
        AND NOT (s.end_time <= p_start_time OR s.start_time >= p_end_time)
    LEFT JOIN breaks b ON f.id = b.faculty_id
        AND b.day_of_week = p_day_of_week
        AND NOT (b.end_time <= p_start_time OR b.start_time >= p_end_time)
    LEFT JOIN duties d ON f.id = d.faculty_id
        AND d.duty_date = p_date
        AND d.status = 'assigned'
        AND NOT (d.end_time <= p_start_time OR d.start_time >= p_end_time)
    WHERE f.is_available = TRUE
        AND b.id IS NULL
        AND d.id IS NULL
    GROUP BY f.id, f.name, f.department, f.email, f.workload_hours
    ORDER BY same_dept DESC, current_substitutions ASC, workload_hours ASC;
END //
DELIMITER ;
