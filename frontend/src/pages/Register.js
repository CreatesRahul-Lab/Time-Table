import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register: registerUser, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    clearError();
    
    try {
      const userData = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role || 'staff',
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          department: data.department
        }
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: 'var(--background-color)',
    borderRadius: 'var(--border-radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
    maxWidth: '500px',
    width: '100%'
  };

  const formStyle = {
    padding: '2rem'
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textAlign: 'center',
    marginBottom: '0.5rem'
  };

  const subtitleStyle = {
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '0.875rem'
  };

  const footerStyle = {
    padding: '1.5rem',
    backgroundColor: 'var(--background-alt)',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)'
  };

  const linkStyle = {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: '500'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  };

  return (
    <div style={cardStyle}>
      <form style={formStyle} onSubmit={handleSubmit(onSubmit)}>
        <h2 style={titleStyle}>Create Account</h2>
        <p style={subtitleStyle}>Join Smart Timetable Scheduler</p>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'rgb(239 68 68 / 0.1)',
            border: '1px solid rgb(239 68 68 / 0.2)',
            borderRadius: 'var(--border-radius)',
            color: 'var(--error-color)',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <div style={gridStyle}>
          <div className="form-group">
            <label className="form-label" htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              className="form-input"
              placeholder="Enter first name"
              {...register('firstName', {
                required: 'First name is required'
              })}
            />
            {errors.firstName && (
              <div className="form-error">{errors.firstName.message}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              className="form-input"
              placeholder="Enter last name"
              {...register('lastName', {
                required: 'Last name is required'
              })}
            />
            {errors.lastName && (
              <div className="form-error">{errors.lastName.message}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="form-input"
            placeholder="Choose a username"
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
              }
            })}
          />
          {errors.username && (
            <div className="form-error">{errors.username.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="Enter your email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Please enter a valid email address'
              }
            })}
          />
          {errors.email && (
            <div className="form-error">{errors.email.message}</div>
          )}
        </div>

        <div style={gridStyle}>
          <div className="form-group">
            <label className="form-label" htmlFor="department">
              Department
            </label>
            <input
              id="department"
              type="text"
              className="form-input"
              placeholder="e.g., Computer Science"
              {...register('department', {
                required: 'Department is required'
              })}
            />
            {errors.department && (
              <div className="form-error">{errors.department.message}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="form-select"
              {...register('role')}
            >
              <option value="staff">Staff</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            className="form-input"
            placeholder="Enter phone number"
            {...register('phone')}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Choose a password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />
          {errors.password && (
            <div className="form-error">{errors.password.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="form-input"
            placeholder="Confirm your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => 
                value === password || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && (
            <div className="form-error">{errors.confirmPassword.message}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '1rem', height: '1rem' }} />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div style={footerStyle}>
        Already have an account?{' '}
        <Link to="/login" style={linkStyle}>
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default Register;
