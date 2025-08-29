import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    clearError();
    
    try {
      const result = await login(data);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
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
    overflow: 'hidden'
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

  return (
    <div style={cardStyle}>
      <form style={formStyle} onSubmit={handleSubmit(onSubmit)}>
        <h2 style={titleStyle}>Welcome Back</h2>
        <p style={subtitleStyle}>Sign in to your account to continue</p>

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

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Enter your password"
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

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '1rem', height: '1rem' }} />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div style={footerStyle}>
        Don't have an account?{' '}
        <Link to="/register" style={linkStyle}>
          Sign up here
        </Link>
      </div>
    </div>
  );
};

export default Login;
