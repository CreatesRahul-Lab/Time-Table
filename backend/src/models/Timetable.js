const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    default: 'morning'
  },
  batch: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    strength: {
      type: Number,
      required: true,
      min: 1
    }
  },
  schedule: {
    monday: [{
      timeSlot: {
        startTime: {
          type: String,
          required: true
        },
        endTime: {
          type: String,
          required: true
        }
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
      },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
      },
      classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
      },
      classType: {
        type: String,
        enum: ['theory', 'practical', 'tutorial', 'project', 'seminar'],
        required: true
      }
    }],
    tuesday: [{
      timeSlot: {
        startTime: String,
        endTime: String
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      },
      classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
      },
      classType: {
        type: String,
        enum: ['theory', 'practical', 'tutorial', 'project', 'seminar']
      }
    }],
    wednesday: [{
      timeSlot: {
        startTime: String,
        endTime: String
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      },
      classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
      },
      classType: {
        type: String,
        enum: ['theory', 'practical', 'tutorial', 'project', 'seminar']
      }
    }],
    thursday: [{
      timeSlot: {
        startTime: String,
        endTime: String
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      },
      classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
      },
      classType: {
        type: String,
        enum: ['theory', 'practical', 'tutorial', 'project', 'seminar']
      }
    }],
    friday: [{
      timeSlot: {
        startTime: String,
        endTime: String
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      },
      classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
      },
      classType: {
        type: String,
        enum: ['theory', 'practical', 'tutorial', 'project', 'seminar']
      }
    }],
    saturday: [{
      timeSlot: {
        startTime: String,
        endTime: String
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      },
      classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
      },
      classType: {
        type: String,
        enum: ['theory', 'practical', 'tutorial', 'project', 'seminar']
      }
    }]
  },
  constraints: {
    maxClassesPerDay: {
      type: Number,
      default: 6,
      min: 1,
      max: 10
    },
    startTime: {
      type: String,
      default: '09:00'
    },
    endTime: {
      type: String,
      default: '17:00'
    },
    lunchBreak: {
      startTime: {
        type: String,
        default: '13:00'
      },
      duration: {
        type: Number,
        default: 60
      }
    },
    classDuration: {
      type: Number,
      default: 60,
      min: 30,
      max: 180
    }
  },
  optimizationResults: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    metrics: {
      classroomUtilization: Number,
      facultyWorkloadBalance: Number,
      studentSatisfaction: Number,
      timeSlotEfficiency: Number
    },
    conflicts: [{
      type: {
        type: String,
        enum: ['faculty_clash', 'classroom_clash', 'student_clash', 'constraint_violation']
      },
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      suggestions: [String]
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'review', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  publishDate: Date,
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster searching
timetableSchema.index({ department: 1, semester: 1, academicYear: 1 });
timetableSchema.index({ status: 1, createdBy: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
