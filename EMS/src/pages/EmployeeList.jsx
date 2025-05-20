import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import bgVideo from '../assets/bg.mov';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEmployees = async (queryParams = {}) => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      const response = await axios.get(
        'http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/employees.php',
        {
          params: queryParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setEmployees(response.data.employees || []);
      } else {
        setError(response.data.message || 'Failed to fetch employees.');
      }
    } catch (error) {
      console.error('Error fetching employees:', error.response || error.message);
      if (error.response && error.response.status === 401) {
        setError('Unauthorized access. Please log in again.');
      } else if (error.response && error.response.status === 500) {
        setError('Server error: Failed to fetch employees.');
      } else {
        setError('Failed to load employees. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/delete_employee.php?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(employees.filter((employee) => employee.id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error.response || error.message);
      setError('Failed to delete employee. Please try again.');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = async (searchTerm) => {
    try {
      fetchEmployees({ q: searchTerm });
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to search employees. Please try again.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
  <div className="relative min-h-screen w-full overflow-hidden">
    <video autoPlay loop muted playsInline className="fixed top-0 left-0 w-full h-full object-cover z-0">
      <source src="/src/assets/bg.mov" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-700/70 via-blue-400/30 to-white/80 z-10"></div>
    <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 p-6 sm:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-6 tracking-wide">
          Employee List
        </h1>
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full bg-white/95 text-sm sm:text-base table-fixed">
            <thead>
              <tr className="bg-blue-50 text-left text-gray-700">
                <th className="py-3 px-4 w-10">ID</th>
                <th className="py-3 px-4 w-40">Name</th>
                <th className="py-3 px-4 w-60">Email</th>
                <th className="py-3 px-4 w-40">Phone</th>
                <th className="py-3 px-4 w-60">Department</th>
                <th className="py-3 px-4 w-48">Position</th>
                <th className="py-3 px-4 w-32">Hire Date</th>
                <th className="py-3 px-4 w-32">Salary</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-32">Profile</th>
                <th className="py-3 px-4 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, idx) => (
                <tr key={employee.id} className="hover:bg-blue-50 transition-colors border-b">
                  <td className="py-2 px-4">{idx + 1}</td>
                  <td className="py-2 px-4">{employee.name}</td>
                  <td className="py-2 px-4">{employee.email}</td>
                  <td className="py-2 px-4">{employee.phone || 'N/A'}</td>
                  <td className="py-2 px-4 whitespace-normal break-words">{employee.department_name}</td>
                  <td className="py-2 px-4">{employee.position}</td>
                  <td className="py-2 px-4">{new Date(employee.hire_date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 text-green-700 font-semibold">
                    ₱{employee.salary || '0.00'}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {employee.profile_image ? (
                      <img
                        src={`http://localhost/FINAL%20PROJECT/EMS_BACKEND/uploads/${employee.profile_image}`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </td>
                  <td className="py-2 px-4 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => navigate(`/edit-employee/${employee.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs sm:text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </div>
  );
};

export default EmployeeList;
