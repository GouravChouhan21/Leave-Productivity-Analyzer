import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { attendanceAPI } from '../services/api';

const UploadPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const response = await attendanceAPI.uploadFile(file);
      setUploadResult(response.data);
      
      // Auto-redirect to dashboard after successful upload
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Upload Employee Attendance Data
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your Excel file (.xlsx) containing employee attendance records to analyze 
          productivity, leave patterns, and generate comprehensive reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Select File
            </h2>
            <FileUpload 
              onFileSelect={handleFileUpload}
              isUploading={isUploading}
            />
          </div>

          {/* Results */}
          {uploadResult && (
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-900">
                    Upload Successful!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Processed {uploadResult.employeesProcessed} employees with {uploadResult.recordsProcessed} records
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Redirecting to dashboard...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-900">
                    Upload Failed
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Excel Format Requirements
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Required Columns:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Employee Name</strong> - Full name of the employee</li>
                  <li>• <strong>Date</strong> - Date in YYYY-MM-DD format</li>
                  <li>• <strong>In-Time</strong> - Check-in time (HH:MM format)</li>
                  <li>• <strong>Out-Time</strong> - Check-out time (HH:MM format)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Sample Data:</h3>
                <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                  <div className="grid grid-cols-4 gap-2 font-semibold mb-1">
                    <div>Employee Name</div>
                    <div>Date</div>
                    <div>In-Time</div>
                    <div>Out-Time</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-gray-600">
                    <div>John Doe</div>
                    <div>2024-01-01</div>
                    <div>10:00</div>
                    <div>18:30</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-gray-600">
                    <div>John Doe</div>
                    <div>2024-01-02</div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Business Rules
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <strong className="text-gray-900">Working Hours:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Monday-Friday: 10:00 AM - 6:30 PM (8.5 hours)</li>
                  <li>• Saturday: 10:00 AM - 2:00 PM (4 hours)</li>
                  <li>• Sunday: Off day</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-900">Leave Policy:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• 2 leaves allowed per employee per month</li>
                  <li>• Missing In-Time or Out-Time = Leave</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-900">Productivity:</strong>
                <p className="mt-1">Calculated as (Actual Hours / Expected Hours) × 100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;