const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Classroom = require('../models/Classroom');

class TimetableOptimizer {
  constructor() {
    this.timeSlots = [
      '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
      '14:00-15:00', '15:00-16:00', '16:00-17:00'
    ];
    this.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  }

  // Main optimization function
  async generateOptimizedTimetable(constraints, subjects, faculty, classrooms) {
    try {
      const schedule = this.initializeSchedule();
      const conflicts = [];
      let score = 0;

      // Step 1: Place fixed time slots first
      await this.placeFixedTimeSlots(schedule, subjects, conflicts);

      // Step 2: Use genetic algorithm approach for remaining subjects
      const optimizedSchedule = await this.optimizeWithGeneticAlgorithm(
        schedule, subjects, faculty, classrooms, constraints, conflicts
      );

      // Step 3: Calculate optimization metrics
      const metrics = this.calculateMetrics(optimizedSchedule, faculty, classrooms, constraints);
      score = this.calculateOverallScore(metrics);

      return {
        schedule: optimizedSchedule,
        score,
        metrics,
        conflicts: conflicts.filter(c => c.severity !== 'resolved')
      };
    } catch (error) {
      console.error('Optimization error:', error);
      throw new Error('Failed to generate optimized timetable');
    }
  }

  // Initialize empty schedule structure
  initializeSchedule() {
    const schedule = {};
    this.days.forEach(day => {
      schedule[day] = [];
    });
    return schedule;
  }

  // Place subjects with fixed time slots
  async placeFixedTimeSlots(schedule, subjects, conflicts) {
    for (const subject of subjects) {
      if (subject.fixedTimeSlots && subject.fixedTimeSlots.length > 0) {
        for (const fixedSlot of subject.fixedTimeSlots) {
          const { day, startTime, endTime, classroom } = fixedSlot;
          
          // Check for conflicts
          const timeSlot = `${startTime}-${endTime}`;
          const hasConflict = this.checkTimeSlotConflict(schedule[day], timeSlot, classroom);
          
          if (hasConflict) {
            conflicts.push({
              type: 'classroom_clash',
              description: `Fixed time slot conflict for ${subject.name} on ${day} at ${timeSlot}`,
              severity: 'high',
              suggestions: ['Consider changing fixed time slot', 'Use different classroom']
            });
          } else {
            schedule[day].push({
              timeSlot: { startTime, endTime },
              subject: subject._id,
              classroom: classroom,
              classType: subject.type,
              isFixed: true
            });
          }
        }
      }
    }
  }

  // Genetic Algorithm for optimization
  async optimizeWithGeneticAlgorithm(schedule, subjects, faculty, classrooms, constraints, conflicts) {
    const populationSize = 50;
    const generations = 100;
    const mutationRate = 0.1;

    // Create initial population
    let population = [];
    for (let i = 0; i < populationSize; i++) {
      const individual = this.createRandomSchedule(schedule, subjects, faculty, classrooms, constraints);
      population.push(individual);
    }

    // Evolution process
    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness for each individual
      population = population.map(individual => ({
        ...individual,
        fitness: this.evaluateFitness(individual, faculty, classrooms, constraints)
      }));

      // Sort by fitness (higher is better)
      population.sort((a, b) => b.fitness - a.fitness);

      // Select parents and create new generation
      const newPopulation = [];
      
      // Keep best 20% (elitism)
      const eliteCount = Math.floor(populationSize * 0.2);
      for (let i = 0; i < eliteCount; i++) {
        newPopulation.push(population[i]);
      }

      // Generate offspring
      while (newPopulation.length < populationSize) {
        const parent1 = this.tournamentSelection(population);
        const parent2 = this.tournamentSelection(population);
        const offspring = this.crossover(parent1, parent2);
        
        if (Math.random() < mutationRate) {
          this.mutate(offspring, subjects, faculty, classrooms, constraints);
        }
        
        newPopulation.push(offspring);
      }

      population = newPopulation;
    }

    // Return the best schedule
    const bestSchedule = population.sort((a, b) => b.fitness - a.fitness)[0];
    return bestSchedule.schedule;
  }

  // Create a random valid schedule
  createRandomSchedule(baseSchedule, subjects, faculty, classrooms, constraints) {
    const schedule = JSON.parse(JSON.stringify(baseSchedule)); // Deep copy
    const remainingSubjects = subjects.filter(s => 
      !s.fixedTimeSlots || s.fixedTimeSlots.length === 0
    );

    for (const subject of remainingSubjects) {
      const requiredClasses = subject.classRequirements.classesPerWeek;
      let placedClasses = 0;

      while (placedClasses < requiredClasses) {
        const randomDay = this.days[Math.floor(Math.random() * this.days.length)];
        const randomTimeSlot = this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
        const [startTime, endTime] = randomTimeSlot.split('-');

        // Find suitable faculty and classroom
        const suitableFaculty = this.findSuitableFaculty(subject, faculty, randomDay, startTime);
        const suitableClassroom = this.findSuitableClassroom(subject, classrooms, randomDay, startTime);

        if (suitableFaculty && suitableClassroom) {
          const conflict = this.checkScheduleConflict(
            schedule, randomDay, { startTime, endTime }, 
            suitableFaculty._id, suitableClassroom._id
          );

          if (!conflict) {
            schedule[randomDay].push({
              timeSlot: { startTime, endTime },
              subject: subject._id,
              faculty: suitableFaculty._id,
              classroom: suitableClassroom._id,
              classType: subject.type
            });
            placedClasses++;
          }
        }

        // Prevent infinite loop
        if (placedClasses === 0) break;
      }
    }

    return { schedule };
  }

  // Fitness evaluation function
  evaluateFitness(individual, faculty, classrooms, constraints) {
    let score = 100; // Start with perfect score

    // Penalty for conflicts
    const conflicts = this.detectConflicts(individual.schedule, faculty, classrooms);
    score -= conflicts.length * 10;

    // Bonus for balanced faculty workload
    const workloadBalance = this.evaluateWorkloadBalance(individual.schedule, faculty);
    score += workloadBalance * 20;

    // Bonus for classroom utilization
    const roomUtilization = this.evaluateRoomUtilization(individual.schedule, classrooms);
    score += roomUtilization * 15;

    // Penalty for exceeding daily class limits
    const dailyLimitPenalty = this.evaluateDailyLimits(individual.schedule, constraints);
    score -= dailyLimitPenalty * 5;

    return Math.max(0, score);
  }

  // Tournament selection for genetic algorithm
  tournamentSelection(population, tournamentSize = 3) {
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }
    return tournament.sort((a, b) => b.fitness - a.fitness)[0];
  }

  // Crossover operation
  crossover(parent1, parent2) {
    const offspring = { schedule: {} };
    
    this.days.forEach(day => {
      offspring.schedule[day] = [];
      const parent1Classes = parent1.schedule[day] || [];
      const parent2Classes = parent2.schedule[day] || [];
      
      // Randomly choose from both parents
      [...parent1Classes, ...parent2Classes].forEach(classInfo => {
        if (Math.random() < 0.5 && !this.hasTimeConflict(offspring.schedule[day], classInfo)) {
          offspring.schedule[day].push(classInfo);
        }
      });
    });

    return offspring;
  }

  // Mutation operation
  mutate(individual, subjects, faculty, classrooms, constraints) {
    const days = Object.keys(individual.schedule);
    const randomDay = days[Math.floor(Math.random() * days.length)];
    const daySchedule = individual.schedule[randomDay];

    if (daySchedule.length > 0) {
      const randomClassIndex = Math.floor(Math.random() * daySchedule.length);
      const randomClass = daySchedule[randomClassIndex];

      // Try to move to a different time slot
      const newTimeSlot = this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
      const [startTime, endTime] = newTimeSlot.split('-');

      randomClass.timeSlot = { startTime, endTime };
    }
  }

  // Helper methods for conflict detection and utility calculations
  checkTimeSlotConflict(daySchedule, timeSlot, classroom) {
    return daySchedule.some(classInfo => 
      classInfo.timeSlot.startTime + '-' + classInfo.timeSlot.endTime === timeSlot &&
      classInfo.classroom.toString() === classroom.toString()
    );
  }

  checkScheduleConflict(schedule, day, timeSlot, facultyId, classroomId) {
    const daySchedule = schedule[day] || [];
    return daySchedule.some(classInfo => 
      (classInfo.timeSlot.startTime === timeSlot.startTime && classInfo.timeSlot.endTime === timeSlot.endTime) &&
      (classInfo.faculty.toString() === facultyId.toString() || 
       classInfo.classroom.toString() === classroomId.toString())
    );
  }

  findSuitableFaculty(subject, faculty, day, startTime) {
    return faculty.find(f => 
      f.subjects.includes(subject._id) &&
      f.availability[day]?.isAvailable &&
      !f.availability[day]?.timeSlots?.some(slot => 
        slot.isBlocked && slot.startTime <= startTime && slot.endTime > startTime
      )
    );
  }

  findSuitableClassroom(subject, classrooms, day, startTime) {
    return classrooms.find(c => 
      c.type === subject.classRequirements.preferredClassroomType &&
      c.capacity >= subject.classRequirements.minClassroomCapacity &&
      c.availability[day]?.isAvailable &&
      !c.availability[day]?.timeSlots?.some(slot => 
        slot.isBlocked && slot.startTime <= startTime && slot.endTime > startTime
      )
    );
  }

  hasTimeConflict(daySchedule, newClass) {
    return daySchedule.some(existingClass => 
      existingClass.timeSlot.startTime === newClass.timeSlot.startTime &&
      existingClass.timeSlot.endTime === newClass.timeSlot.endTime &&
      (existingClass.faculty === newClass.faculty || existingClass.classroom === newClass.classroom)
    );
  }

  detectConflicts(schedule, faculty, classrooms) {
    const conflicts = [];
    // Implementation for conflict detection
    // This would check for faculty double-booking, classroom conflicts, etc.
    return conflicts;
  }

  evaluateWorkloadBalance(schedule, faculty) {
    // Calculate how evenly distributed the workload is among faculty
    const workloads = faculty.map(f => {
      let totalHours = 0;
      Object.values(schedule).forEach(daySchedule => {
        totalHours += daySchedule.filter(c => c.faculty === f._id).length;
      });
      return totalHours;
    });

    const average = workloads.reduce((a, b) => a + b, 0) / workloads.length;
    const variance = workloads.reduce((acc, hours) => acc + Math.pow(hours - average, 2), 0) / workloads.length;
    
    return Math.max(0, 1 - (variance / (average * average))); // Normalized score
  }

  evaluateRoomUtilization(schedule, classrooms) {
    const roomUsage = {};
    classrooms.forEach(room => {
      roomUsage[room._id] = 0;
    });

    Object.values(schedule).forEach(daySchedule => {
      daySchedule.forEach(classInfo => {
        if (roomUsage[classInfo.classroom] !== undefined) {
          roomUsage[classInfo.classroom]++;
        }
      });
    });

    const totalSlots = this.timeSlots.length * this.days.length;
    const averageUtilization = Object.values(roomUsage).reduce((a, b) => a + b, 0) / 
                              (classrooms.length * totalSlots);
    
    return averageUtilization;
  }

  evaluateDailyLimits(schedule, constraints) {
    let penalty = 0;
    const maxClassesPerDay = constraints.maxClassesPerDay || 6;

    Object.values(schedule).forEach(daySchedule => {
      if (daySchedule.length > maxClassesPerDay) {
        penalty += daySchedule.length - maxClassesPerDay;
      }
    });

    return penalty;
  }

  calculateMetrics(schedule, faculty, classrooms, constraints) {
    return {
      classroomUtilization: this.evaluateRoomUtilization(schedule, classrooms),
      facultyWorkloadBalance: this.evaluateWorkloadBalance(schedule, faculty),
      studentSatisfaction: 0.85, // Placeholder - would be calculated based on preferences
      timeSlotEfficiency: 0.90   // Placeholder - would be calculated based on time gaps
    };
  }

  calculateOverallScore(metrics) {
    const weights = {
      classroomUtilization: 0.25,
      facultyWorkloadBalance: 0.30,
      studentSatisfaction: 0.25,
      timeSlotEfficiency: 0.20
    };

    return Object.entries(metrics).reduce((score, [metric, value]) => {
      return score + (value * weights[metric] * 100);
    }, 0);
  }
}

module.exports = TimetableOptimizer;
