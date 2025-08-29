const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, department, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (department) filter['profile.department'] = department;

    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// Update user (admin only for role/permission changes)
router.put('/:id', 
  auth, 
  [
    body('role')
      .optional()
      .isIn(['admin', 'faculty', 'staff', 'student'])
      .withMessage('Invalid role'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be true or false')
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check permissions for sensitive updates
      if (updates.role || updates.permissions || updates.isActive) {
        if (req.user.role !== 'admin') {
          return res.status(403).json({ 
            message: 'Access denied. Only admins can update roles, permissions, or account status.' 
          });
        }
      }

      // Users can update their own profile
      if (req.user._id.toString() !== id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Update allowed fields
      const allowedUpdates = ['profile', 'role', 'permissions', 'isActive'];
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          if (field === 'profile') {
            Object.keys(updates[field]).forEach(key => {
              user.profile[key] = updates[field][key];
            });
          } else if (field === 'permissions') {
            Object.keys(updates[field]).forEach(key => {
              user.permissions[key] = updates[field][key];
            });
          } else {
            user[field] = updates[field];
          }
        }
      });

      await user.save();

      const userResponse = user.toJSON();
      delete userResponse.password;

      res.json({
        message: 'User updated successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error while updating user' });
    }
  }
);

// Delete user (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-deletion
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      stats,
      summary: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;
