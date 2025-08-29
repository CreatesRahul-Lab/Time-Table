import React from 'react';

const TimetableCreate = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Timetable</h1>
          <p className="page-subtitle">Generate an optimized timetable for your department</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Timetable Creation Wizard
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            This feature will allow you to create optimized timetables using our intelligent scheduling algorithm.
          </p>
          <div style={{ 
            padding: '2rem',
            backgroundColor: 'var(--background-alt)',
            borderRadius: 'var(--border-radius)',
            marginBottom: '2rem'
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Coming soon: Step-by-step timetable creation with constraint management, 
              multiple optimization options, and conflict resolution.
            </p>
          </div>
          <button className="btn btn-primary" disabled>
            Start Creating Timetable
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimetableCreate;
