// src/Component/Attendance/ManualAttendanceTable/ManualAttendanceTable.jsx
import React, {useState, useEffect} from "react";
import axios from "axios";
import {format} from "date-fns";
import {toast} from "react-toastify";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import AddAttendanceModal from "../AddAttendanceModal.jsx";
import EditAttendanceModal from "@/Component/Attendance/EditAttendanceModal.jsx";
import DeleteAttendanceModal from "@/Component/Attendance/DeleteAttendanceModal.jsx";
import AttendanceToolbar from "@/Component/Attendance/AttendanceToolbar.jsx";
import {API_URL} from "@/config.js";

export default function ManualAttendanceTable() {
    // 1️⃣ store both rows and the raw users list
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [users, setUsers] = useState([]);               // ← new
    const [employeesList, setEmployeesList] = useState([]);

    // modals & filters unchanged...
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editRow, setEditRow] = useState({});
    const [deleteRow, setDeleteRow] = useState(null);

    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // ▶ load users once, then load attendance
    useEffect(() => {
        (async () => {
            let userList = [];
            try {
                const res = await axios.get(`${API_URL}users/`);
                userList = res.data;
                setUsers(userList);

                setEmployeesList(
                    userList.map(u => ({value: u.employee_id, label: u.full_name}))
                );
            } catch {
                toast.error("Could not load employees");
            }
            await fetchRows(userList);
        })();
    }, []);

    // ▶ fetchRows now accepts an optional userList for lookup
    const fetchRows = async (userList = users) => {
        setLoading(true);
        const {role, employee_id} = JSON.parse(
            localStorage.getItem("userData") || "{}"
        );
        const endpoint = ["Admin", "Super Admin", "Attendance Team"].includes(role)
            ? `${API_URL}attendance/all`
            : `${API_URL}attendance/employee/${employee_id}`;

        try {
            const {data} = await axios.get(endpoint);

            // build lookup map: employee_id → full_name
            const nameMap = userList.reduce((m, u) => {
                m[u.employee_id] = u.full_name;
                return m;
            }, {});

            const prepared = data.map(r => {
                const d = new Date(r.date);
                const iso = format(d, "yyyy-MM-dd");
                const hours =
                    r.in_time && r.out_time
                        ? (
                            ((+r.out_time.split(":")[0] * 60 + +r.out_time.split(":")[1]) -
                                (+r.in_time.split(":")[0] * 60 + +r.in_time.split(":")[1])) /
                            60
                        ).toFixed(2)
                        : "";

                return {
                    ...r,
                    date_text: iso,
                    title: `${r.employee_id}-${iso}`,
                    in_time: r.in_time,
                    out_time: r.out_time,
                    working_hours: hours,
                    // ← use full name lookup here
                    name: nameMap[r.employee_id] || r.employee_id,
                };
            });
            setRows(prepared);
            setFilteredRows(prepared);
        } catch {
            toast.error("Could not load attendance");
        } finally {
            setLoading(false);
        }
    };

    // ▶ filters, modals, handlers unchanged...
    const applyFilters = () => {
        let fr = [...rows];
        if (selectedYear) {
            fr = fr.filter(r => new Date(r.date_text).getFullYear() === selectedYear);
        }
        if (selectedEmployee) {
            fr = fr.filter(r => r.employee_id === selectedEmployee);
        }
        if (startDate) {
            fr = fr.filter(r => r.date_text >= startDate);
        }
        if (endDate) {
            fr = fr.filter(r => r.date_text <= endDate);
        }
        setFilteredRows(fr);
    };

    const clearFilters = () => {
        setSelectedYear(null);
        setSelectedEmployee(null);
        setStartDate(null);
        setEndDate(null);
        setFilteredRows(rows);
    };

    const openEditModal = row => {
        setEditRow(row);
        setEditModalOpen(true);
    };
    const openDeleteModal = row => {
        setDeleteRow(row);
        setDeleteModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`${API_URL}attendance/${editRow.id}`, {
                employee_id: editRow.employee_id,
                date: editRow.date_text,
                in_time: editRow.in_time,
                out_time: editRow.out_time,
            });
            toast.success("Updated");
            setEditModalOpen(false);
            await fetchRows();
        } catch {
            toast.error("Update failed");
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`${API_URL}attendance/delete/${deleteRow.id}`);
            toast.success("Deleted");
            setDeleteModalOpen(false);
            await fetchRows();
        } catch {
            toast.error("Delete failed");
        }
    };

    // ▶ update column header to “Employee Name”
    const columns = [
        {accessor: "title", header: "Title"},
        {accessor: "date_text", header: "Date"},
        {accessor: "name", header: "Employee Name"},
        {accessor: "in_time", header: "Start Time"},
        {accessor: "out_time", header: "End Time"},
        {accessor: "working_hours", header: "Work Hours"},
    ];

    const userRole = JSON.parse(localStorage.getItem("userData") || "{}").role;

    return (
        <div className="relative p-6">
            <AttendanceToolbar
                userRole={userRole}
                rows={filteredRows}
                loading={loading}
                employees={employeesList}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                selectedEmployee={selectedEmployee}
                onEmployeeChange={setSelectedEmployee}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                onApply={applyFilters}
                onClear={clearFilters}
                onAdd={() => setAddModalOpen(true)}
                onReload={fetchRows}
            />

            <CommonTable
                title="Attendance Records"
                columns={columns}
                data={filteredRows}
                userRole={userRole}
                editRoles={["Admin", "Super Admin", "Attendance Team"]}
                deleteRoles={["Admin", "Super Admin"]}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
            />

            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"/>
                </div>
            )}

            <AddAttendanceModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdded={async () => {
                    setAddModalOpen(false);
                    await fetchRows();
                }}
            />
            <EditAttendanceModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                editRow={editRow}
                setEditRow={setEditRow}
                onSave={handleSaveEdit}
            />
            <DeleteAttendanceModal
                isOpen={deleteModalOpen}
                row={deleteRow}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}