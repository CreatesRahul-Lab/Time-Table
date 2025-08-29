const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  type: {
    type: String,
    enum: ['theory', 'practical', 'tutorial', 'project', 'seminar'],
    required: true
  },
  classRequirements: {
    classesPerWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    hoursPerClass: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
      default: 1
    },
    preferredClassroomType: {
      type: String,
      enum: ['lecture_hall', 'laboratory', 'seminar_room', 'auditorium', 'tutorial_room'],
      required: true
    },
    minClassroomCapacity: {
      type: Number,
      default: 30
    },
    specialEquipment: [{
      name: String,
      isRequired: {
        type: Boolean,
        default: true
      }
    }]
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  faculty: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  }],
  enrolledStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  fixedTimeSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    startTime: String,
    endTime: String,
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom'
    },
    isFixed: {
      type: Boolean,
      default: true
    },
    reason: String
  }],
  isElective: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster searching
subjectSchema.index({ code: 1, department: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
