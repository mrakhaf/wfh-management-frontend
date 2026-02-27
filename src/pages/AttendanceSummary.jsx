import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import attendanceService from '../services/attendanceService';

const AttendanceSummary = () => {
  const { user, loading: authLoading } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  // Format date to YYYY-MM-DD for input
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get first day of current month
  const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Get today's date
  const getToday = () => {
    const today = new Date();
    // Set time to end of day to ensure we get today's data
    today.setHours(23, 59, 59, 999);
    return today;
  };

  // Format date for display (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  // Format time for display (HH:mm)
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status based on tapIn and tapOut
  const getStatus = (tapIn, tapOut) => {
    if (tapIn && tapOut) {
      return 'Completed';
    } else if (tapIn && !tapOut) {
      return 'Checked In Only';
    }
    return 'No Data';
  };

  const fetchAttendanceSummary = async (useDefaultDates = false) => {
    if (!user?.id) return;

    setLoading(true);
    setError('');
    
    let start = startDate;
    let end = endDate;

    // If useDefaultDates is true or dates are empty, use default range
    if (useDefaultDates || !start || !end) {
      const firstDay = getFirstDayOfMonth();
      const today = getToday();
      start = formatDateForInput(firstDay);
      end = formatDateForInput(today);
      
      // Update state with default dates
      setStartDate(start);
      setEndDate(end);
    }

    try {
      const response = await attendanceService.getAttendanceSummary(user.id, start, end);
      if (response.success) {
        setAttendanceData(response.data || []);
      } else {
        setAttendanceData([]);
        setError('Failed to load attendance data');
      }
    } catch (err) {
      setError('Failed to load attendance data');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchAttendanceSummary();
  };

  useEffect(() => {
    // Set default date range to current month
    const firstDay = getFirstDayOfMonth();
    const today = getToday();
    
    setStartDate(formatDateForInput(firstDay));
    setEndDate(formatDateForInput(today));
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceSummary(true);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Attendance Summary</h1>
            <p className="mt-2 text-gray-600">View your attendance records by date range</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                <Button
                  onClick={handleFilter}
                  disabled={loading}
                  loading={loading}
                  className="w-full"
                >
                  {loading ? 'Loading...' : 'Filter'}
                </Button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Attendance Records
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {attendanceData.length} record(s) for the selected date range
              </p>
            </div>

            {attendanceData.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 text-lg mb-2">No attendance records found</div>
                <p className="text-gray-400">
                  for the selected date range
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tap In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tap Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.map((record, index) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.tapIn)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(record.tapIn)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(record.tapOut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getStatus(record.tapIn, record.tapOut) === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getStatus(record.tapIn, record.tapOut)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

export default AttendanceSummary;