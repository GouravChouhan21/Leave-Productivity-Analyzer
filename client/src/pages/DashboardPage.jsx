import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/KPICard';
import ProductivityLineChart from '../components/Charts/ProductivityLineChart';
import LeaveBarChart from '../components/Charts/LeaveBarChart';
import WorkHoursPieChart from '../components/Charts/WorkHoursPieChart';
import StackedBarChart from '../components/Charts/StackedBarChart';
import { attendanceAPI } from '../services/api';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchEmployees();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await attendanceAPI.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await attendanceAPI.getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeClick = (employeeId) => {
    navigate(`/employee/${employeeId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/upload')}
            className="btn-primary"
          >
            Upload Data
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData || dashboardData.kpis.totalEmployees === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Upload an Excel file with employee attendance data to view analytics and insights.
          </p>
          <button 
            onClick={() => navigate('/upload')}
            className="btn-primary"
          >
            Upload Data
          </button>
        </div>
      </div>
    );
  }

  const { kpis, charts } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Dashboard</h1>
          <p className="text-gray-600 mt-1">Employee attendance and productivity analytics</p>
        </div>
        <button 
          onClick={() => navigate('/upload')}
          className="btn-secondary"
        >
          Upload New Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          title="Total Employees"
          value={kpis.totalEmployees}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
        />
        
        <KPICard
          title="Expected Hours"
          value={`${kpis.totalExpectedHours.toFixed(0)}h`}
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
          value={`${kpis.totalActualHours.toFixed(0)}h`}
          subtitle="This month"
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <KPICard
          title="Avg Productivity"
          value={`${kpis.averageProductivity}%`}
          color={kpis.averageProductivity >= 80 ? 'green' : kpis.averageProductivity >= 60 ? 'yellow' : 'red'}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        
        <KPICard
          title="Leaves Used"
          value={`${kpis.totalLeavesUsed}/${kpis.totalAllowedLeaves}`}
          subtitle="This month"
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityLineChart data={charts.productivityTrend} />
        <LeaveBarChart data={charts.leavesPerEmployee} />
        <WorkHoursPieChart data={charts.workStatusDistribution} />
        <StackedBarChart data={charts.expectedVsActual} />
      </div>

      {/* Employee List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Employee Overview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leaves Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productivity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.totalLeaves} / 2
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      employee.productivity >= 80 
                        ? 'bg-green-100 text-green-800'
                        : employee.productivity >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.productivity}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEmployeeClick(employee._id)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;