import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import {CSVLink} from 'react-csv';
import {FaSearch, FaDownload} from 'react-icons/fa';
import {API_URL} from "@/config.js";

const EmployeeListTable = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortAsc, setSortAsc] = useState(true);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}employees/all`);
            let data = res.data || [];

            const currentEmployeeId = JSON.parse(localStorage.getItem("userData"))?.employee_id;

            // ✅ Exclude current user based on employee_id
            data = data.filter(emp => emp.employee_id !== currentEmployeeId);

            // Filter by search term
            if (search) {
                const term = search.toLowerCase();
                data = data.filter(emp =>
                    emp.employee_id.toLowerCase().includes(term) ||
                    emp.full_name.toLowerCase().includes(term)
                );
            }

            // Sort by full name
            data.sort((a, b) =>
                sortAsc
                    ? a.full_name.localeCompare(b.full_name)
                    : b.full_name.localeCompare(a.full_name)
            );

            setEmployees(data);
        } catch (err) {
            console.error("Failed to fetch employees:", err);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [sortAsc]);

    const toggleSort = () => setSortAsc(!sortAsc);

    const csvHeaders = [
        {label: 'Employee ID', key: 'employee_id'},
        {label: 'Full Name', key: 'full_name'},
        {label: 'Email', key: 'email'},
        {label: 'Phone', key: 'phone'},
        {label: 'Role', key: 'role'},
        {label: 'Work Position', key: 'work_position'},
        {label: 'Address', key: 'address'},
        {label: "Father's Name", key: 'fathers_name'},
        {label: 'Aadhar No', key: 'aadhar_no'}
    ];

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">All Employees</h2>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="Search by ID or Name"
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
                        Sort: {sortAsc ? '↑ A-Z' : '↓ Z-A'}
                    </button>
                </div>

                {employees.length > 0 && (
                    <CSVLink
                        data={employees}
                        headers={csvHeaders}
                        filename="employees_list.csv"
                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <FaDownload/> Download CSV
                    </CSVLink>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full bg-white border">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Employee ID</th>
                            <th className="border p-2">Full Name</th>
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