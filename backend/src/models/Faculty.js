const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    enum: ['professor', 'associate_professor', 'assistant_professor', 'lecturer', 'visiting_faculty']
  },
  qualifications: [{
    degree: {
      type: String,
      required: true
    },
    specialization: String,
    university: String,
    year: Number
  }],
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  workload: {
    maxHoursPerWeek: {
      type: Number,
      default: 20,
      min: 1,
      max: 40
    },
    maxClassesPerDay: {
      type: Number,
      default: 4,
      min: 1,
      max: 8
    },
    preferredTimeSlots: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      startTime: String,
      endTime: String,
      preference: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      }
    }]
  },
  availability: {
    monday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        reason: String
      }]
    },
    tuesday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        reason: String
      }]
    },
    wednesday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        reason: String
      }]
    },
    thursday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        reason: String
      }]
    },
    friday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        reason: String
      }]
    },
    saturday: {
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: String,
        endTime: String,
        isBlocked: { type: Boolean, default: false },
        reason: String
      }]
    }
  },
  leavePattern: {
    averageLeavesPerMonth: {
      type: Number,
      default: 2,
      min: 0,
      max: 10
    },
    plannedLeaves: [{
      startDate: Date,
      endDate: Date,
      reason: String,
      isApproved: {
        type: Boolean,
        default: false
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Populate user details when querying faculty
facultySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'profile email'
  });
  next();
});

// Index for faster searching
facultySchema.index({ employeeId: 1, department: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
