const express = require('express');
const { body } = require('express-validator');
const Faculty = require('../models/Faculty');
const { auth, checkPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const facultyValidation = [
  body('employeeId')
    .notEmpty()
    .trim()
    .toUpperCase()
    .withMessage('Employee ID is required'),
  body('user')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('department')
    .notEmpty()
    .trim()
    .withMessage('Department is required'),
  body('designation')
    .isIn(['professor', 'associate_professor', 'assistant_professor', 'lecturer', 'visiting_faculty'])
    .withMessage('Invalid designation')
];

// Get all faculty
router.get('/', auth, async (req, res) => {
  try {
    const { department, designation, isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    
    const faculty = await Faculty.find(filter)
      .populate('user', 'username email profile')
      .populate('subjects', 'code name')
      .sort({ department: 1, designation: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Faculty.countDocuments(filter);

    res.json({
      faculty,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: 'Server error while fetching faculty' });
  }
});

// Get faculty by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('user', 'username email profile')
      .populate('subjects', 'code name credits');
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    console.error('Get faculty by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching faculty' });
  }
});

// Create new faculty
router.post('/', 
  auth, 
  checkPermission('canCreateTimetable'),
  facultyValidation, 
  validate, 
  async (req, res) => {
    try {
      const { employeeId } = req.body;

      // Check if faculty with employee ID already exists
      const existingFaculty = await Faculty.findOne({ employeeId: employeeId.toUpperCase() });
      if (existingFaculty) {
        return res.status(400).json({ 
          message: 'Faculty with this employee ID already exists' 
        });
      }

      const faculty = new Faculty(req.body);
      await faculty.save();

      // Populate for response
      await faculty.populate('user', 'username email profile');
      await faculty.populate('subjects', 'code name');

      res.status(201).json({
        message: 'Faculty created successfully',
        faculty
      });
    } catch (error) {
      console.error('Create faculty error:', error);
      res.status(500).json({ message: 'Server error while creating faculty' });
    }
  }
);

// Update faculty
router.put('/:id', 
  auth, 
  checkPermission('canCreateTimetable'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const faculty = await Faculty.findById(id);
      
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found' });
      }

      // Check for employee ID uniqueness if it's being updated
      if (updates.employeeId && updates.employeeId.toUpperCase() !== faculty.employeeId) {
        const existingFaculty = await Faculty.findOne({ 
          employeeId: updates.employeeId.toUpperCase(),
          _id: { $ne: id }
        });
        
        if (existingFaculty) {
          return res.status(400).json({ 
            message: 'Faculty with this employee ID already exists' 
          });
        }
      }

      // Update allowed fields
      const allowedUpdates = [
        'employeeId', 'department', 'designation', 'qualifications', 
        'subjects', 'workload', 'availability', 'leavePattern', 'isActive'
      ];
      
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          if (field === 'employeeId') {
            faculty[field] = updates[field].toUpperCase();
          } else {
            faculty[field] = updates[field];
          }
        }
      });

      await faculty.save();

      // Populate for response
      await faculty.populate('user', 'username email profile');
      await faculty.populate('subjects', 'code name');

      res.json({
        message: 'Faculty updated successfully',
        faculty
      });
    } catch (error) {
      console.error('Update faculty error:', error);
      res.status(500).json({ message: 'Server error while updating faculty' });
    }
  }
);

// Delete faculty
router.delete('/:id', auth, checkPermission('canCreateTimetable'), async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findById(id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check if faculty is assigned to any active timetables
    // For now, we'll just deactivate instead of delete
    faculty.isActive = false;
    await faculty.save();

    res.json({ message: 'Faculty deactivated successfully' });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ message: 'Server error while deleting faculty' });
  }
});

// Get faculty availability
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    if (date) {
      const dayOfWeek = new Date(date).toLocaleLowerCase().substring(0, 3);
      const dayMap = {
        'sun': 'sunday',
        'mon': 'monday',
        'tue': 'tuesday',
        'wed': 'wednesday',
        'thu': 'thursday',
        'fri': 'friday',
        'sat': 'saturday'
      };
      
      const day = dayMap[dayOfWeek] || 'monday';
      const availability = faculty.availability[day];
      
      res.json({
        date,
        day,
        availability,
        workload: faculty.workload
      });
    } else {
      res.json({
        availability: faculty.availability,
        workload: faculty.workload
      });
    }
  } catch (error) {
    console.error('Get faculty availability error:', error);
    res.status(500).json({ message: 'Server error while fetching availability' });
  }
});

// Update faculty availability
router.put('/:id/availability', 
  auth, 
  checkPermission('canCreateTimetable'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { availability, workload } = req.body;

      const faculty = await Faculty.findById(id);
      
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found' });
      }

      if (availability) {
        faculty.availability = { ...faculty.availability, ...availability };
      }

      if (workload) {
        faculty.workload = { ...faculty.workload, ...workload };
      }

      await faculty.save();

      res.json({
        message: 'Faculty availability updated successfully',
        availability: faculty.availability,
        workload: faculty.workload
      });
    } catch (error) {
      console.error('Update faculty availability error:', error);
      res.status(500).json({ message: 'Server error while updating availability' });
    }
  }
);

// Get faculty workload
router.get('/:id/workload', auth, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Calculate current workload from active timetables
    // This would require checking the Timetable model
    // For now, return the configured workload limits
    res.json({
      limits: faculty.workload,
      // currentLoad: {} // Would be calculated from active timetables
    });
  } catch (error) {
    console.error('Get faculty workload error:', error);
    res.status(500).json({ message: 'Server error while fetching workload' });
  }
});

// Assign subjects to faculty
router.post('/:id/subjects', 
  auth, 
  checkPermission('canCreateTimetable'),
  [
    body('subjectIds')
      .isArray({ min: 1 })
      .withMessage('At least one subject must be provided'),
    body('subjectIds.*')
      .isMongoId()
      .withMessage('Invalid subject ID')
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { subjectIds } = req.body;

      const faculty = await Faculty.findById(id);
      
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found' });
      }

      // Add new subjects (avoid duplicates)
      const uniqueSubjects = [...new Set([...faculty.subjects, ...subjectIds])];
      faculty.subjects = uniqueSubjects;

      await faculty.save();
      await faculty.populate('subjects', 'code name');

      res.json({
        message: 'Subjects assigned successfully',
        subjects: faculty.subjects
      });
    } catch (error) {
      console.error('Assign subjects error:', error);
      res.status(500).json({ message: 'Server error while assigning subjects' });
    }
  }
);

// Remove subjects from faculty
router.delete('/:id/subjects/:subjectId', 
  auth, 
  checkPermission('canCreateTimetable'),
  async (req, res) => {
    try {
      const { id, subjectId } = req.params;

      const faculty = await Faculty.findById(id);
      
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found' });
      }

      faculty.subjects = faculty.subjects.filter(
        subject => subject.toString() !== subjectId
      );

      await faculty.save();
      await faculty.populate('subjects', 'code name');

      res.json({
        message: 'Subject removed successfully',
        subjects: faculty.subjects
      });
    } catch (error) {
      console.error('Remove subject error:', error);
      res.status(500).json({ message: 'Server error while removing subject' });
    }
  }
);

// Get faculty statistics
router.get('/stats/overview', auth, checkPermission('canViewReports'), async (req, res) => {
  try {
    const stats = await Faculty.aggregate([
      {
        $group: {
          _id: '$designation',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await Faculty.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalFaculty = await Faculty.countDocuments();
    const activeFaculty = await Faculty.countDocuments({ isActive: true });

    res.json({
      designationStats: stats,
      departmentStats,
      summary: {
        total: totalFaculty,
        active: activeFaculty,
        inactive: totalFaculty - activeFaculty
      }
    });
  } catch (error) {
    console.error('Get faculty stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;
