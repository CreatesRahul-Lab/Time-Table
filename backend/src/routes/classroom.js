const express = require('express');
const { body } = require('express-validator');
const Classroom = require('../models/Classroom');
const { auth, checkPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const classroomValidation = [
  body('name')
    .notEmpty()
    .trim()
    .withMessage('Classroom name is required'),
  body('code')
    .notEmpty()
    .trim()
    .toUpperCase()
    .withMessage('Classroom code is required'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive number'),
  body('type')
    .isIn(['lecture_hall', 'laboratory', 'seminar_room', 'auditorium', 'tutorial_room'])
    .withMessage('Invalid classroom type'),
  body('location.building')
    .notEmpty()
    .trim()
    .withMessage('Building name is required'),
  body('location.floor')
    .isInt({ min: 0 })
    .withMessage('Floor must be a non-negative number')
];

// Get all classrooms
router.get('/', auth, async (req, res) => {
  try {
    const { type, building, isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (building) filter['location.building'] = building;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    
    const classrooms = await Classroom.find(filter)
      .sort({ 'location.building': 1, 'location.floor': 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Classroom.countDocuments(filter);

    res.json({
      classrooms,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({ message: 'Server error while fetching classrooms' });
  }
});

// Get classroom by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    res.json(classroom);
  } catch (error) {
    console.error('Get classroom by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching classroom' });
  }
});

// Create new classroom
router.post('/', 
  auth, 
  checkPermission('canCreateTimetable'),
  classroomValidation, 
  validate, 
  async (req, res) => {
    try {
      const { code } = req.body;

      // Check if classroom code already exists
      const existingClassroom = await Classroom.findOne({ code: code.toUpperCase() });
      if (existingClassroom) {
        return res.status(400).json({ 
          message: 'Classroom with this code already exists' 
        });
      }

      const classroom = new Classroom(req.body);
      await classroom.save();

      res.status(201).json({
        message: 'Classroom created successfully',
        classroom
      });
    } catch (error) {
      console.error('Create classroom error:', error);
      res.status(500).json({ message: 'Server error while creating classroom' });
    }
  }
);

// Update classroom
router.put('/:id', 
  auth, 
  checkPermission('canCreateTimetable'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const classroom = await Classroom.findById(id);
      
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }

      // Check for code uniqueness if code is being updated
      if (updates.code && updates.code.toUpperCase() !== classroom.code) {
        const existingClassroom = await Classroom.findOne({ 
          code: updates.code.toUpperCase(),
          _id: { $ne: id }
        });
        
        if (existingClassroom) {
          return res.status(400).json({ 
            message: 'Classroom with this code already exists' 
          });
        }
      }

      // Update allowed fields
      const allowedUpdates = [
        'name', 'code', 'capacity', 'type', 'location', 
        'facilities', 'availability', 'isActive', 'maintenanceSchedule'
      ];
      
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          if (field === 'code') {
            classroom[field] = updates[field].toUpperCase();
          } else {
            classroom[field] = updates[field];
          }
        }
      });

      await classroom.save();

      res.json({
        message: 'Classroom updated successfully',
        classroom
      });
    } catch (error) {
      console.error('Update classroom error:', error);
      res.status(500).json({ message: 'Server error while updating classroom' });
    }
  }
);

// Delete classroom
router.delete('/:id', auth, checkPermission('canCreateTimetable'), async (req, res) => {
  try {
    const { id } = req.params;

    const classroom = await Classroom.findById(id);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if classroom is being used in any active timetables
    // This would require checking the Timetable model
    // For now, we'll just deactivate instead of delete
    classroom.isActive = false;
    await classroom.save();

    res.json({ message: 'Classroom deactivated successfully' });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({ message: 'Server error while deleting classroom' });
  }
});

// Get classroom availability
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // If date is provided, check specific date availability
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
      const availability = classroom.availability[day];
      
      res.json({
        date,
        day,
        availability
      });
    } else {
      res.json({
        availability: classroom.availability
      });
    }
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Server error while fetching availability' });
  }
});

// Update classroom availability
router.put('/:id/availability', 
  auth, 
  checkPermission('canCreateTimetable'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { availability } = req.body;

      const classroom = await Classroom.findById(id);
      
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }

      if (availability) {
        classroom.availability = { ...classroom.availability, ...availability };
        await classroom.save();
      }

      res.json({
        message: 'Classroom availability updated successfully',
        availability: classroom.availability
      });
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({ message: 'Server error while updating availability' });
    }
  }
);

// Get classroom statistics
router.get('/stats/overview', auth, checkPermission('canViewReports'), async (req, res) => {
  try {
    const stats = await Classroom.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' }
        }
      }
    ]);

    const totalClassrooms = await Classroom.countDocuments();
    const activeClassrooms = await Classroom.countDocuments({ isActive: true });

    res.json({
      stats,
      summary: {
        total: totalClassrooms,
        active: activeClassrooms,
        inactive: totalClassrooms - activeClassrooms
      }
    });
  } catch (error) {
    console.error('Get classroom stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;
