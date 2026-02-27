import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CardMenu from '../components/CardMenu';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome to your WFH Management System</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardMenu
              title="Employee Profile"
              description="View and manage employee information"
              icon="👤"
              onClick={() => handleCardClick('/profile')}
            />
            
            <CardMenu
              title="Attendance"
              description="Record and track daily attendance"
              icon="⏰"
              onClick={() => handleCardClick('/attendance')}
            />
            
            <CardMenu
              title="Attendance Summary"
              description="View attendance reports and statistics"
              icon="📊"
              onClick={() => handleCardClick('/attendance-summary')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;