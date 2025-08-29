import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';
import { timetableAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const TimetableList = () => {
  const { hasPermission } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    semester: '',
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchTimetables();
  }, [filters, pagination.current]);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: 10,
        ...filters
      };

      const response = await timetableAPI.getAll(params);
      setTimetables(response.data.timetables);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching timetables:', error);
      toast.error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  if (loading && timetables.length === 0) {
    return <LoadingSpinner text="Loading timetables..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Timetables</h1>
          <p className="page-subtitle">Manage and view all timetables</p>
        </div>
        {hasPermission('canCreateTimetable') && (
          <Link to="/timetables/create" className="btn btn-primary">
            <FiPlus size={16} />
            Create Timetable
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body">
          <div className="grid grid-cols-4" style={{ alignItems: 'end' }}>
            <div className="form-group">
              <label className="form-label">
                <FiSearch size={16} style={{ marginRight: '0.5rem' }} />
                Search
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Search timetables..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select
                className="form-select"
                value={filters.semester}
                onChange={(e) => handleFilterChange('semester', e.target.value)}
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="generated">Generated</option>
                <option value="review">In Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Timetables List */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '2rem' }}>
              <LoadingSpinner size="sm" text="Loading..." />
            </div>
          ) : timetables.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {timetables.map((timetable) => (
                  <tr key={timetable._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>{timetable.name}</div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--text-secondary)' 
                        }}>
                          {timetable.academicYear}
                        </div>
                      </div>
                    </td>
                    <td>{timetable.department}</td>
                    <td>Semester {timetable.semester}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>{timetable.batch.name}</div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--text-secondary)' 
                        }}>
                          {timetable.batch.strength} students
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(timetable.status)}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {new Date(timetable.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link 
                        to={`/timetables/${timetable._id}`}
                        className="btn btn-sm btn-outline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ 
              padding: '4rem 2rem', 
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <FiCalendar size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ marginBottom: '0.5rem' }}>No timetables found</h3>
              <p style={{ marginBottom: '2rem' }}>
                {Object.values(filters).some(f => f) 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first timetable to get started.'
                }
              </p>
              {hasPermission('canCreateTimetable') && (
                <Link to="/timetables/create" className="btn btn-primary">
                  <FiPlus size={16} />
                  Create Timetable
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '2rem',
          gap: '0.5rem'
        }}>
          <button
            className="btn btn-outline btn-sm"
            disabled={pagination.current === 1}
            onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
          >
            Previous
          </button>
          
          <span style={{ 
            padding: '0.5rem 1rem', 
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            Page {pagination.current} of {pagination.pages}
          </span>
          
          <button
            className="btn btn-outline btn-sm"
            disabled={pagination.current === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TimetableList;
