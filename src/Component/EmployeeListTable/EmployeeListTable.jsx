import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { FaSearch, FaDownload } from 'react-icons/fa';

const EmployeeListTable = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);
  const role = localStorage.getItem("userRole");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      let res;

      if (!search) {
        res = await axios.get('http://127.0.0.1:5000/employees/all');
      } else if (/^EMP-\d+-\d+$/.test(search)) {
        res = await axios.get(`http://127.0.0.1:5000/employees/by-code/${search}`);
        res = { data: [res.data] };
      } else if (/^\d+$/.test(search)) {
        res = await axios.get(`http://127.0.0.1:5000/employees/${search}`);
        res = { data: [res.data] };
      } else {
        res = await axios.get(`http://127.0.0.1:5000/employees/search?name=${search}`);
      }

      let sorted = res.data;
      if (sortAsc) {
        sorted.sort((a, b) => a.full_name.localeCompare(b.full_name));
      } else {
        sorted.sort((a, b) => b.full_name.localeCompare(a.full_name));
      }

      setEmployees(sorted);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'Admin' || role === 'Manager') {
      fetchEmployees();
    }
  }, [sortAsc]);

  const toggleSort = () => setSortAsc(!sortAsc);

  const csvHeaders = [
    { label: 'Employee ID', key: 'employee_id' },
    { label: 'Full Name', key: 'full_name' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Role', key: 'role' },
    { label: 'Work Position', key: 'work_position' },
    { label: 'Address', key: 'address' },
    { label: "Father's Name", key: 'fathers_name' },
    { label: 'Aadhar No', key: 'aadhar_no' }
  ];

  if (role !== 'Admin' && role !== 'Manager') {
    return <p className="text-red-500 text-center mt-10">Unauthorized</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Employees</h2>

      {/* ✅ Unified search & button row with justify-between */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Employee ID or Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchEmployees()}
              className="border pl-10 pr-4 py-2 rounded w-64"
            />
          </div>

          <button
            onClick={fetchEmployees}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>

          <button
            onClick={toggleSort}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Sort by Name: {sortAsc ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>

        {/* ✅ CSV button aligned to the right in same row */}
        {employees.length > 0 && (
          <CSVLink
            data={employees}
            headers={csvHeaders}
            filename="employees_list.csv"
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaDownload /> Download CSV
          </CSVLink>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <div className="animate-fade-in transition-opacity duration-700 overflow-x-auto">
          <table className="w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Employee ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="border p-2">{emp.employee_id}</td>
                  <td className="border p-2">{emp.full_name}</td>
                  <td className="border p-2">{emp.email}</td>
                  <td className="border p-2">{emp.role}</td>
                  <td className="border p-2">
                    <Link
                      to={`/admin/employees/${emp.employee_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeListTable;
