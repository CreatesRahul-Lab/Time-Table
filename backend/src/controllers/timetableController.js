const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Classroom = require('../models/Classroom');
const TimetableOptimizer = require('../services/TimetableOptimizer');

// Get all timetables
const getAllTimetables = async (req, res) => {
  try {
    const { department, semester, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    
    const timetables = await Timetable.find(filter)
      .populate('createdBy', 'username profile')
      .populate('approvedBy', 'username profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Timetable.countDocuments(filter);

    res.json({
      timetables,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all timetables error:', error);
    res.status(500).json({ message: 'Server error while fetching timetables' });
  }
};

// Get timetable by ID
const getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('createdBy', 'username profile')
      .populate('approvedBy', 'username profile')
      .populate('schedule.monday.subject', 'code name')
      .populate('schedule.monday.faculty', 'employeeId user')
      .populate('schedule.monday.classroom', 'code name')
      .populate('schedule.tuesday.subject', 'code name')
      .populate('schedule.tuesday.faculty', 'employeeId user')
      .populate('schedule.tuesday.classroom', 'code name')
      .populate('schedule.wednesday.subject', 'code name')
      .populate('schedule.wednesday.faculty', 'employeeId user')
      .populate('schedule.wednesday.classroom', 'code name')
      .populate('schedule.thursday.subject', 'code name')
      .populate('schedule.thursday.faculty', 'employeeId user')
      .populate('schedule.thursday.classroom', 'code name')
      .populate('schedule.friday.subject', 'code name')
      .populate('schedule.friday.faculty', 'employeeId user')
      .populate('schedule.friday.classroom', 'code name')
      .populate('schedule.saturday.subject', 'code name')
      .populate('schedule.saturday.faculty', 'employeeId user')
      .populate('schedule.saturday.classroom', 'code name');

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.json(timetable);
  } catch (error) {
    console.error('Get timetable by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching timetable' });
  }
};

// Generate optimized timetable
const generateTimetable = async (req, res) => {
  try {
    const {
      name,
      department,
      semester,
      academicYear,
      shift,
      batch,
      constraints,
      subjectIds
    } = req.body;

    // Validate required data
    if (!name || !department || !semester || !academicYear || !batch || !subjectIds?.length) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, department, semester, academicYear, batch, or subjects' 
      });
    }

    // Fetch subjects, faculty, and classrooms
    const subjects = await Subject.find({ _id: { $in: subjectIds } })
      .populate('faculty');
    
    const faculty = await Faculty.find({ 
      department,
      isActive: true,
      subjects: { $in: subjectIds }
    });
    
    const classrooms = await Classroom.find({ isActive: true });

    if (subjects.length === 0) {
      return res.status(400).json({ message: 'No valid subjects found' });
    }

    if (faculty.length === 0) {
      return res.status(400).json({ message: 'No available faculty found for these subjects' });
    }

    if (classrooms.length === 0) {
      return res.status(400).json({ message: 'No available classrooms found' });
    }

    // Generate optimized timetable using the optimizer
    const optimizer = new TimetableOptimizer();
    const optimizationResult = await optimizer.generateOptimizedTimetable(
      constraints || {},
      subjects,
      faculty,
      classrooms
    );

    // Create new timetable document
    const timetable = new Timetable({
      name,
      department,
      semester,
      academicYear,
      shift: shift || 'morning',
      batch,
      schedule: optimizationResult.schedule,
      constraints: constraints || {},
      optimizationResults: {
        score: optimizationResult.score,
        metrics: optimizationResult.metrics,
        conflicts: optimizationResult.conflicts
      },
      status: 'generated',
      createdBy: req.user._id
    });

    await timetable.save();

    // Populate the created timetable for response
    await timetable.populate('createdBy', 'username profile');

    res.status(201).json({
      message: 'Timetable generated successfully',
      timetable,
      optimizationScore: optimizationResult.score,
      conflicts: optimizationResult.conflicts
    });
  } catch (error) {
    console.error('Generate timetable error:', error);
    res.status(500).json({ 
      message: 'Server error while generating timetable',
      error: error.message 
    });
  }
};

// Generate multiple optimized options
const generateMultipleOptions = async (req, res) => {
  try {
    const {
      department,
      semester,
      academicYear,
      shift,
      batch,
      constraints,
      subjectIds,
      optionsCount = 3
    } = req.body;

    // Fetch required data
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).populate('faculty');
    const faculty = await Faculty.find({ 
      department,
      isActive: true,
      subjects: { $in: subjectIds }
    });
    const classrooms = await Classroom.find({ isActive: true });

    const optimizer = new TimetableOptimizer();
    const options = [];

    // Generate multiple options
    for (let i = 0; i < optionsCount; i++) {
      const result = await optimizer.generateOptimizedTimetable(
        constraints || {},
        subjects,
        faculty,
        classrooms
      );
      
      options.push({
        id: i + 1,
        schedule: result.schedule,
        score: result.score,
        metrics: result.metrics,
        conflicts: result.conflicts
      });
    }

    // Sort by score (best first)
    options.sort((a, b) => b.score - a.score);

    res.json({
      message: 'Multiple timetable options generated successfully',
      options
    });
  } catch (error) {
    console.error('Generate multiple options error:', error);
    res.status(500).json({ 
      message: 'Server error while generating timetable options' 
    });
  }
};

// Update timetable
const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const timetable = await Timetable.findById(id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    // Check permissions
    if (timetable.createdBy.toString() !== req.user._id.toString() && 
        !req.user.permissions.canCreateTimetable) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own timetables.' 
      });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'schedule', 'constraints', 'status'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        timetable[field] = updates[field];
      }
    });

    await timetable.save();

    res.json({
      message: 'Timetable updated successfully',
      timetable
    });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({ message: 'Server error while updating timetable' });
  }
};

// Approve timetable
const approveTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, comments } = req.body;

    const timetable = await Timetable.findById(id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    if (!req.user.permissions.canApproveTimetable) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to approve timetables.' 
      });
    }

    if (approved) {
      timetable.status = 'approved';
      timetable.approvedBy = req.user._id;
      timetable.approvalDate = new Date();
    } else {
      timetable.status = 'review';
    }

    if (comments) {
      timetable.comments.push({
        user: req.user._id,
        message: comments
      });
    }

    await timetable.save();

    res.json({
      message: `Timetable ${approved ? 'approved' : 'sent back for review'} successfully`,
      timetable
    });
  } catch (error) {
    console.error('Approve timetable error:', error);
    res.status(500).json({ message: 'Server error while processing approval' });
  }
};

// Publish timetable
const publishTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findById(id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    if (timetable.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Only approved timetables can be published' 
      });
    }

    if (!req.user.permissions.canApproveTimetable) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to publish timetables.' 
      });
    }

    timetable.status = 'published';
    timetable.publishDate = new Date();

    await timetable.save();

    res.json({
      message: 'Timetable published successfully',
      timetable
    });
  } catch (error) {
    console.error('Publish timetable error:', error);
    res.status(500).json({ message: 'Server error while publishing timetable' });
  }
};

// Delete timetable
const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findById(id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    // Check permissions
    if (timetable.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own timetables.' 
      });
    }

    if (timetable.status === 'published') {
      return res.status(400).json({ 
        message: 'Cannot delete published timetables. Archive instead.' 
      });
    }

    await Timetable.findByIdAndDelete(id);

    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({ message: 'Server error while deleting timetable' });
  }
};

// Get timetable analytics
const getTimetableAnalytics = async (req, res) => {
  try {
    const { department, semester, academicYear } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (academicYear) filter.academicYear = academicYear;

    const analytics = await Timetable.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgScore: { $avg: '$optimizationResults.score' }
        }
      }
    ]);

    const totalTimetables = await Timetable.countDocuments(filter);
    const publishedTimetables = await Timetable.countDocuments({ 
      ...filter, 
      status: 'published' 
    });

    res.json({
      analytics,
      summary: {
        total: totalTimetables,
        published: publishedTimetables,
        publishRate: totalTimetables > 0 ? (publishedTimetables / totalTimetables) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
};

module.exports = {
  getAllTimetables,
  getTimetableById,
  generateTimetable,
  generateMultipleOptions,
  updateTimetable,
  approveTimetable,
  publishTimetable,
  deleteTimetable,
  getTimetableAnalytics
};
