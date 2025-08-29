const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['lecture_hall', 'laboratory', 'seminar_room', 'auditorium', 'tutorial_room'],
    required: true
  },
  location: {
    building: {
      type: String,
      required: true,
      trim: true
    },
    floor: {
      type: Number,
      required: true
    },
    wing: {
      type: String,
      trim: true
    }
  },
  facilities: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    isWorking: {
      type: Boolean,
      default: true
    }
  }],
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
  isActive: {
    type: Boolean,
    default: true
  },
  maintenanceSchedule: [{
    date: Date,
    startTime: String,
    endTime: String,
    reason: String,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Index for faster searching
classroomSchema.index({ code: 1, type: 1 });
classroomSchema.index({ 'location.building': 1, 'location.floor': 1 });

module.exports = mongoose.model('Classroom', classroomSchema);
