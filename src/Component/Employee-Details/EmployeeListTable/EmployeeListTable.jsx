import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {CSVLink} from 'react-csv';
import {FaSearch, FaDownload} from 'react-icons/fa';
import {API_URL} from "@/config.js";
import CommonTable from '@/Component/Utils/CommonTable.jsx';

const EmployeeListTable = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortAsc, setSortAsc] = useState(true);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/users/`);
            let data = res.data || [];

            const currentEmployeeId = JSON.parse(localStorage.getItem("userData"))?.employee_id;
            // exclude current user
            data = data.filter(emp => emp.employee_id !== currentEmployeeId);

            // apply search filter
            if (search) {
                const term = search.toLowerCase();
                data = data.filter(emp =>
                    emp.employee_id.toLowerCase().includes(term) ||
                    emp.full_name.toLowerCase().includes(term)
                );
            }

            // sort by name
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

    // CSV headers
    const csvHeaders = [
        {label: 'Employee ID', key: 'employee_id'},
        {label: 'Full Name', key: 'full_name'},
        {label: 'Email', key: 'email'},
        {label: 'Phone', key: 'phone'},
        {label: 'Role', key: 'role'},
        {label: 'Work Position', key: 'work_position'},
        {label: 'Address', key: 'address'},
        {label: "Father's Name", key: 'fathers_name'},
        {label: 'Aadhar No', key: 'aadhar_no'},
    ];

    // define columns for CommonTable (no "Actions" column)
    const columns = [
        {header: 'Employee ID', accessor: 'employee_id'},
        {header: 'Full Name', accessor: 'full_name'},
        {header: 'Email', accessor: 'email'},
        {header: 'Role', accessor: 'role'},
    ];

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">All Employees</h2>
            {loading ? (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"/>
                </div>
            ) : (
                <CommonTable
                    title=""               // or pass a title if you want
                    columns={columns}
                    data={employees}
                    footer={null}         // no footer
                />
            )}
        </div>
    );
};

export default EmployeeListTable;