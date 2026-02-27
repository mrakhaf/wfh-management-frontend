import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import CardMenu from '../components/CardMenu';
import attendanceService from '../services/attendanceService';

const Attendance = () => {
  const { user, loading: authLoading } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchTodayAttendance = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await attendanceService.getTodayAttendance(user.id);
      if (response.success) {
        setAttendance(response.data);
      } else {
        setAttendance(null);
      }
    } catch (err) {
      setError('Failed to load attendance data');
      setAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTapAction = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await attendanceService.tapInTapOut(user.id);
      
      if (response.success) {
        // Refresh attendance data
        await fetchTodayAttendance();
      } else if (response.statusCode === 400 && response.message === 'Already completed attendance today') {
        setError('Already completed attendance today');
        // Still refresh data to show latest state
        await fetchTodayAttendance();
      } else {
        setError(response.message || 'Action failed');
      }
    } catch (err) {
      setError('Failed to process attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, [user]);

  // Determine button state and text
  const getButtonState = () => {
    if (!attendance) {
      return {
        text: 'Tap In',
        variant: 'primary',
        disabled: false
      };
    } else if (attendance.tapIn && !attendance.tapOut) {
      return {
        text: 'Tap Out',
        variant: 'secondary',
        disabled: false
      };
    } else {
      return {
        text: 'Attendance Completed',
        variant: 'disabled',
        disabled: true
      };
    }
  };

  const buttonState = getButtonState();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-center mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Daily Attendance</h1>
            <p className="mt-2 text-gray-600">Today's date: {formatDate(new Date())}</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance Status</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    !attendance 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : attendance.tapIn && !attendance.tapOut 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {!attendance 
                      ? 'Not Checked In' 
                      : attendance.tapIn && !attendance.tapOut 
                        ? 'Checked In'
                        : 'Attendance Completed'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Tap In Time</span>
                  <span className="font-medium">{formatTime(attendance?.tapIn)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Tap Out Time</span>
                  <span className="font-medium">{formatTime(attendance?.tapOut)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{formatTime(attendance?.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              
              <div className="space-y-6">
                <div className="text-center">
                  <Button
                    onClick={handleTapAction}
                    disabled={buttonState.disabled || loading}
                    loading={loading}
                    className={`w-full py-4 text-lg font-semibold ${
                      buttonState.variant === 'primary' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : buttonState.variant === 'secondary'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    {loading ? 'Processing...' : buttonState.text}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>Click the button above to {buttonState.text.toLowerCase()} for today.</p>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tap In when you start work</li>
                    <li>• Tap Out when you finish work</li>
                    <li>• You can only complete attendance once per day</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;