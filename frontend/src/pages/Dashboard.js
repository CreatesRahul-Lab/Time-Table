import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FiCalendar, 
  FiBook, 
  FiUsers, 
  FiMapPin, 
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import { timetableAPI, subjectAPI, facultyAPI, classroomAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    timetables: { total: 0, published: 0, draft: 0 },
    subjects: { total: 0, active: 0 },
    faculty: { total: 0, active: 0 },
    classrooms: { total: 0, active: 0 }
  });
  const [recentTimetables, setRecentTimetables] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        timetablesResponse,
        subjectsResponse,
        facultyResponse,
        classroomsResponse
      ] = await Promise.all([
        timetableAPI.getAll({ limit: 5 }),
        subjectAPI.getStats(),
        facultyAPI.getStats(),
        classroomAPI.getStats()
      ]);

      setStats({
        timetables: {
          total: timetablesResponse.data.pagination.total,
          published: timetablesResponse.data.timetables.filter(t => t.status === 'published').length,
          draft: timetablesResponse.data.timetables.filter(t => t.status === 'draft').length
        },
        subjects: subjectsResponse.data.summary,
        faculty: facultyResponse.data.summary,
        classrooms: classroomsResponse.data.summary
      });

      setRecentTimetables(timetablesResponse.data.timetables);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'var(--primary-color)', trend }) => (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-body">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <div>
            <h3 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              margin: '0 0 0.25rem 0'
            }}>
              {value}
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              margin: '0 0 0.5rem 0',
              fontSize: '0.875rem'
            }}>
              {title}
            </p>
            {subtitle && (
              <p style={{ 
                color: 'var(--text-light)', 
                margin: 0,
                fontSize: '0.75rem'
              }}>
                {subtitle}
              </p>
            )}
          </div>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}>
            <Icon size={24} />
          </div>
        </div>
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            fontSize: '0.75rem'
          }}>
            <FiTrendingUp size={12} style={{ color: 'var(--success-color)' }} />
            <span style={{ color: 'var(--success-color)' }}>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const badges = {
      'published': { class: 'badge-success', label: 'Published' },
      'approved': { class: 'badge-info', label: 'Approved' },
      'review': { class: 'badge-warning', label: 'In Review' },
      'draft': { class: 'badge-secondary', label: 'Draft' },
      'generated': { class: 'badge-info', label: 'Generated' }
    };
    
    const badge = badges[status] || { class: 'badge-secondary', label: status };
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <FiAlertTriangle size={48} style={{ color: 'var(--error-color)', marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>
              Error Loading Dashboard
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {error}
            </p>
            <button 
              className="btn btn-primary"
              onClick={fetchDashboardData}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem 0'
        }}>
          Welcome back, {user?.profile?.firstName}!
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          margin: 0,
          fontSize: '1rem'
        }}>
          Here's what's happening with your timetable management system today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Timetables"
          value={stats.timetables.total}
          subtitle={`${stats.timetables.published} published`}
          icon={FiCalendar}
          color="var(--primary-color)"
        />
        <StatCard
          title="Active Subjects"
          value={stats.subjects.active}
          subtitle={`${stats.subjects.total} total subjects`}
          icon={FiBook}
          color="var(--success-color)"
        />
        <StatCard
          title="Faculty Members"
          value={stats.faculty.active}
          subtitle={`${stats.faculty.total} total faculty`}
          icon={FiUsers}
          color="var(--warning-color)"
        />
        <StatCard
          title="Available Classrooms"
          value={stats.classrooms.active}
          subtitle={`${stats.classrooms.total} total rooms`}
          icon={FiMapPin}
          color="var(--error-color)"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2">
        {/* Recent Timetables */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiClock size={20} />
              Recent Timetables
            </h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentTimetables.length > 0 ? (
              <div>
                {recentTimetables.map((timetable) => (
                  <div 
                    key={timetable._id}
                    style={{
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h4 style={{ 
                        margin: '0 0 0.25rem 0', 
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {timetable.name}
                      </h4>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {timetable.department} • Semester {timetable.semester}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {getStatusBadge(timetable.status)}
                      <p style={{ 
                        margin: '0.25rem 0 0 0', 
                        fontSize: '0.75rem',
                        color: 'var(--text-light)'
                      }}>
                        {new Date(timetable.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <FiCalendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No timetables created yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiCheckCircle size={20} />
              Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user?.permissions?.canCreateTimetable && (
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/timetables/create'}
                >
                  Create New Timetable
                </button>
              )}
              
              <button 
                className="btn btn-outline"
                onClick={() => window.location.href = '/timetables'}
              >
                View All Timetables
              </button>
              
              <button 
                className="btn btn-outline"
                onClick={() => window.location.href = '/subjects'}
              >
                Manage Subjects
              </button>
              
              <button 
                className="btn btn-outline"
                onClick={() => window.location.href = '/faculty'}
              >
                Manage Faculty
              </button>
              
              {user?.permissions?.canViewReports && (
                <button 
                  className="btn btn-outline"
                  onClick={() => window.location.href = '/reports'}
                >
                  View Reports
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
