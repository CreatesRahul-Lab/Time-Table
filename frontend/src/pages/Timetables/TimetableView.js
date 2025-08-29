import React from 'react';
import { useParams } from 'react-router-dom';

const TimetableView = () => {
  const { id } = useParams();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Timetable Details</h1>
          <p className="page-subtitle">View and manage timetable: {id}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Timetable Viewer
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Detailed timetable view with weekly schedule, conflicts, and optimization metrics.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
            Timetable ID: {id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimetableView;
