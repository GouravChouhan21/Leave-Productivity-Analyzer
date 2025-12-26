import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KPICard from '../components/KPICard';
import AttendanceTable from '../components/AttendanceTable';
import ProductivityLineChart from '../components/Charts/ProductivityLineChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { attendanceAPI } from '../services/api';

const EmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      const response = await attendanceAPI.getEmployeeData(id);
      setEmployeeData(response.data);
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
      setError('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !employeeData) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error || 'Employee not found'}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { employee, attendanceRecords, charts } = employeeData;

  // Custom chart for leave vs present
  const LeaveVsPresentChart = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-sm" style={{ color: payload[0].color }}>
              Count: {payload[0].value}
            </p>
          </div>
        );
      }
      return null;
    };

    const getBarColor = (status) => {
      switch (status) {
        case 'Present': return '#22c55e';
        case 'Leave': return '#ef4444';
        case 'Partial': return '#f59e0b';
        default: return '#6b7280';
      }
    };

    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="status" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Bar key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Daily worked hours chart
  const DailyHoursChart = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-900">
              {new Date(label).toLocaleDateString()}
            </p>
            <p className="text-sm text-blue-600">
              Worked: {payload[0].value.toFixed(1)}h
            </p>
            {payload[1] && (
              <p className="text-sm text-gray-600">
                Expected: {payload[1].value.toFixed(1)}h
              </p>
            )}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Worked Hours</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="hours" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expected" 
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
                opacity={0.5}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 font-medium mb-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
          <p className="text-gray-600 mt-1">Individual employee analysis</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Expected Hours"
          value={`${employee.totalExpectedHours.toFixed(0)}h`}
          subtitle="This month"
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <KPICard
          title="Actual Hours"
          value={`${employee.totalActualHours.toFixed(0)}h`}
          subtitle="This month"
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <KPICard
          title="Leaves Used"
          value={`${employee.totalLeaves}/2`}
          subtitle="This month"
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        
        <KPICard
          title="Productivity"
          value={`${employee.productivity}%`}
          color={employee.productivity >= 80 ? 'green' : employee.productivity >= 60 ? 'yellow' : 'red'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyHoursChart data={charts.dailyHours} />
        <LeaveVsPresentChart data={charts.leaveVsPresent} />
      </div>

      {/* Attendance Table */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance Records</h2>
        <AttendanceTable data={attendanceRecords} />
      </div>
    </div>
  );
};

export default EmployeePage;