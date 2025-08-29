const express = require('express');
const { body } = require('express-validator');
const Subject = require('../models/Subject');
const { auth, checkPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const subjectValidation = [
  body('code')
    .notEmpty()
    .trim()
    .toUpperCase()
    .withMessage('Subject code is required'),
  body('name')
    .notEmpty()
    .trim()
    .withMessage('Subject name is required'),
  body('credits')
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10'),
  body('department')
    .notEmpty()
    .trim()
    .withMessage('Department is required'),
  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  body('type')
    .isIn(['theory', 'practical', 'tutorial', 'project', 'seminar'])
    .withMessage('Invalid subject type'),
  body('classRequirements.classesPerWeek')
    .isInt({ min: 1, max: 10 })
    .withMessage('Classes per week must be between 1 and 10'),
  body('classRequirements.hoursPerClass')
    .isInt({ min: 1, max: 4 })
    .withMessage('Hours per class must be between 1 and 4'),
  body('classRequirements.preferredClassroomType')
    .isIn(['lecture_hall', 'laboratory', 'seminar_room', 'auditorium', 'tutorial_room'])
    .withMessage('Invalid classroom type')
];

// Get all subjects
router.get('/', auth, async (req, res) => {
  try {
    const { department, semester, type, isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    
    const subjects = await Subject.find(filter)
      .populate('prerequisites', 'code name')
      .populate('faculty', 'employeeId user')
      .sort({ department: 1, semester: 1, code: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subject.countDocuments(filter);

    res.json({
      subjects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
});

// Get subject by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('prerequisites', 'code name')
      .populate('faculty', 'employeeId user')
      .populate('fixedTimeSlots.classroom', 'code name');
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching subject' });
  }
});

// Create new subject
router.post('/', 
  auth, 
  checkPermission('canCreateTimetable'),
  subjectValidation, 
  validate, 
  async (req, res) => {
    try {
      const { code } = req.body;

      // Check if subject code already exists
      const existingSubject = await Subject.findOne({ code: code.toUpperCase() });
      if (existingSubject) {
        return res.status(400).json({ 
          message: 'Subject with this code already exists' 
        });
      }

      const subject = new Subject(req.body);
      await subject.save();

      // Populate for response
      await subject.populate('prerequisites', 'code name');
      await subject.populate('faculty', 'employeeId user');

      res.status(201).json({
        message: 'Subject created successfully',
        subject
      });
    } catch (error) {
      console.error('Create subject error:', error);
      res.status(500).json({ message: 'Server error while creating subject' });
    }
  }
);

// Update subject
router.put('/:id', 
  auth, 
  checkPermission('canCreateTimetable'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const subject = await Subject.findById(id);
      
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      // Check for code uniqueness if code is being updated
      if (updates.code && updates.code.toUpperCase() !== subject.code) {
        const existingSubject = await Subject.findOne({ 
          code: updates.code.toUpperCase(),
          _id: { $ne: id }
        });
        
        if (existingSubject) {
          return res.status(400).json({ 
            message: 'Subject with this code already exists' 
          });
        }
      }

      // Update allowed fields
      const allowedUpdates = [
        'code', 'name', 'credits', 'department', 'semester', 'type',
        'classRequirements', 'prerequisites', 'faculty', 'enrolledStudents',
        'fixedTimeSlots', 'isElective', 'isActive'
      ];
      
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          if (field === 'code') {
            subject[field] = updates[field].toUpperCase();
          } else {
            subject[field] = updates[field];
          }
        }
      });

      await subject.save();

      // Populate for response
      await subject.populate('prerequisites', 'code name');
      await subject.populate('faculty', 'employeeId user');

      res.json({
        message: 'Subject updated successfully',
        subject
      });
    } catch (error) {
      console.error('Update subject error:', error);
      res.status(500).json({ message: 'Server error while updating subject' });
    }
  }
);

// Delete subject
router.delete('/:id', auth, checkPermission('canCreateTimetable'), async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if subject is used as prerequisite for other subjects
    const dependentSubjects = await Subject.find({ prerequisites: id });
    if (dependentSubjects.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete subject. It is a prerequisite for other subjects.',
        dependentSubjects: dependentSubjects.map(s => ({ code: s.code, name: s.name }))
      });
    }

    // Check if subject is assigned to any active timetables
    // For now, we'll just deactivate instead of delete
    subject.isActive = false;
    await subject.save();

    res.json({ message: 'Subject deactivated successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error while deleting subject' });
  }
});

// Assign faculty to subject
router.post('/:id/faculty', 
  auth, 
  checkPermission('canCreateTimetable'),
  [
    body('facultyIds')
      .isArray({ min: 1 })
      .withMessage('At least one faculty must be provided'),
    body('facultyIds.*')
      .isMongoId()
      .withMessage('Invalid faculty ID')
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { facultyIds } = req.body;

      const subject = await Subject.findById(id);
      
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      // Add new faculty (avoid duplicates)
      const uniqueFaculty = [...new Set([...subject.faculty, ...facultyIds])];
      subject.faculty = uniqueFaculty;

      await subject.save();
      await subject.populate('faculty', 'employeeId user');

      res.json({
        message: 'Faculty assigned successfully',
        faculty: subject.faculty
      });
    } catch (error) {
      console.error('Assign faculty error:', error);
      res.status(500).json({ message: 'Server error while assigning faculty' });
    }
  }
);

// Remove faculty from subject
router.delete('/:id/faculty/:facultyId', 
  auth, 
  checkPermission('canCreateTimetable'),
  async (req, res) => {
    try {
      const { id, facultyId } = req.params;

      const subject = await Subject.findById(id);
      
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      subject.faculty = subject.faculty.filter(
        faculty => faculty.toString() !== facultyId
      );

      await subject.save();
      await subject.populate('faculty', 'employeeId user');

      res.json({
        message: 'Faculty removed successfully',
        faculty: subject.faculty
      });
    } catch (error) {
      console.error('Remove faculty error:', error);
      res.status(500).json({ message: 'Server error while removing faculty' });
    }
  }
);

// Set fixed time slots
router.put('/:id/fixed-slots', 
  auth, 
  checkPermission('canCreateTimetable'),
  [
    body('fixedTimeSlots')
      .isArray()
      .withMessage('Fixed time slots must be an array'),
    body('fixedTimeSlots.*.day')
      .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])
      .withMessage('Invalid day'),
    body('fixedTimeSlots.*.startTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid start time format (HH:MM)'),
    body('fixedTimeSlots.*.endTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid end time format (HH:MM)')
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { fixedTimeSlots } = req.body;

      const subject = await Subject.findById(id);
      
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      subject.fixedTimeSlots = fixedTimeSlots;
      await subject.save();

      await subject.populate('fixedTimeSlots.classroom', 'code name');

      res.json({
        message: 'Fixed time slots updated successfully',
        fixedTimeSlots: subject.fixedTimeSlots
      });
    } catch (error) {
      console.error('Update fixed slots error:', error);
      res.status(500).json({ message: 'Server error while updating fixed time slots' });
    }
  }
);

// Get subjects by department and semester
router.get('/department/:department/semester/:semester', auth, async (req, res) => {
  try {
    const { department, semester } = req.params;
    
    const subjects = await Subject.find({ 
      department, 
      semester: parseInt(semester),
      isActive: true 
    })
      .populate('prerequisites', 'code name')
      .populate('faculty', 'employeeId user')
      .sort({ code: 1 });

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects by department and semester error:', error);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
});

// Get subject statistics
router.get('/stats/overview', auth, checkPermission('canViewReports'), async (req, res) => {
  try {
    const departmentStats = await Subject.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalCredits: { $sum: '$credits' }
        }
      }
    ]);

    const typeStats = await Subject.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const semesterStats = await Subject.aggregate([
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSubjects = await Subject.countDocuments();
    const activeSubjects = await Subject.countDocuments({ isActive: true });
    const electiveSubjects = await Subject.countDocuments({ isElective: true });

    res.json({
      departmentStats,
      typeStats,
      semesterStats,
      summary: {
        total: totalSubjects,
        active: activeSubjects,
        inactive: totalSubjects - activeSubjects,
        electives: electiveSubjects
      }
    });
  } catch (error) {
    console.error('Get subject stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;
