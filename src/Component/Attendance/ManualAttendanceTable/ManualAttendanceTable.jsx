// src/Component/Attendance/ManualAttendanceTable/ManualAttendanceTable.jsx
import React, {useState, useEffect} from "react";
import axios from "axios";
import {format} from "date-fns";
import {toast} from "react-toastify";
import {FiRefreshCw} from "react-icons/fi";
import {API_URL} from "@/config.js";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import AddAttendanceModal from "./AddAttendanceModal.jsx";
import dayjs from "dayjs";
import BasicDatePicker from "@/Component/Utils/DateTimePicker.jsx";

export default function ManualAttendanceTable() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employeesMap, setEmployeesMap] = useState({});

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editRow, setEditRow] = useState({
        id: null,
        employee_id: "",
        date_text: "",
        in_time: "",
        out_time: "",
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteRow, setDeleteRow] = useState(null);

    // 1️⃣ Load employees → build map → fetch attendance
    useEffect(() => {
        (async () => {
            try {
                const {data: users} = await axios.get(`${API_URL}users/`);
                const map = {};
                users.forEach((u) => {
                    map[u.employee_id] = u.full_name;
                });
                setEmployeesMap(map);
                await fetchRows(map);
            } catch (err) {
                console.error("Users load failed:", err);
                toast.error("Could not load employee list");
                await fetchRows({});
            }
        })();
    }, []);

    // 2️⃣ Fetch attendance rows
    const fetchRows = async (map = {}) => {
        setLoading(true);
        const stored = localStorage.getItem("userData");
        const {role, employee_id} = stored ? JSON.parse(stored) : {};
        const endpoint =
            ["Admin", "Super Admin", "Attendance Team"].includes(role)
                ? `${API_URL}attendance/all`
                : `${API_URL}attendance/employee/${employee_id}`;

        try {
            const {data} = await axios.get(endpoint);
            const prepared = data.map((r) => {
                const d = new Date(r.date);
                const iso = format(d, "yyyy-MM-dd");
                const month = d.toLocaleString("default", {month: "long"});
                const title = `${r.employee_id}-${iso}`;
                const working_hours =
                    r.in_time && r.out_time
                        ? (
                            ((parseInt(r.out_time.split(":")[0], 10) * 60 +
                                    parseInt(r.out_time.split(":")[1], 10)) -
                                (parseInt(r.in_time.split(":")[0], 10) * 60 +
                                    parseInt(r.in_time.split(":")[1], 10))) /
                            60
                        ).toFixed(2)
                        : "";
                return {
                    ...r,
                    date_text: iso,
                    month,
                    title,
                    working_hours,
                    name: map[r.employee_id] || "",
                };
            });
            setRows(prepared);
        } catch (err) {
            console.error("Fetch failed:", err);
            toast.error("Could not load attendance");
        } finally {
            setLoading(false);
        }
    };

    // 3️⃣ Handlers
    const openEditModal = (row) => {
        setEditRow({
            id: row.id,
            employee_id: row.employee_id,
            date_text: row.date_text,
            in_time: row.in_time,
            out_time: row.out_time,
        });
        setEditModalOpen(true);
    };

    const openDeleteModal = (row) => {
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
            toast.success("Attendance updated");
            setEditModalOpen(false);
            await fetchRows(employeesMap);
        } catch {
            toast.error("Update failed");
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteRow) return;
        try {
            await axios.delete(`${API_URL}attendance/delete/${deleteRow.id}`);
            toast.success("Attendance deleted");
            setDeleteModalOpen(false);
            setDeleteRow(null);
            await fetchRows(employeesMap);
        } catch {
            toast.error("Delete failed");
        }
    };

    // 4️⃣ Table columns
    const columns = [
        {accessor: "title", header: "Title"},
        {accessor: "date_text", header: "Date"},
        {accessor: "month", header: "Month"},
        {accessor: "name", header: "Name"},
        {accessor: "in_time", header: "In"},
        {accessor: "out_time", header: "Out"},
        {accessor: "working_hours", header: "Working Hours"},
    ];

    const userRole = JSON.parse(localStorage.getItem("userData"))?.role;

    return (
        <div className="relative p-6">
            <div className="flex justify-between items-center mb-4">
                {["Admin", "Super Admin", "Attendance Team"].includes(userRole) && (
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        + Add Attendance
                    </button>
                )}
                <button
                    onClick={() => fetchRows(employeesMap)}
                    className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                >
                    <FiRefreshCw size={18}/>
                    Reload
                </button>
            </div>

            {/* Table + loading overlay */}
            <CommonTable
                title="Manual Attendance"
                columns={columns}
                data={rows}
                userRole={userRole}
                editRoles={["Admin", "Super Admin", "Attendance Team"]}
                deleteRoles={["Admin", "Super Admin"]}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
            />
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
                    <svg
                        className="animate-spin h-12 w-12 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                        />
                    </svg>
                </div>
            )}

            {/* Add Modal */}
            <AddAttendanceModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdded={async () => {
                    setAddModalOpen(false);
                    await fetchRows(employeesMap);
                }}
            />

            {/* Edit Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">
                            Edit Attendance
                        </h2>

                        <div className="space-y-4">
                            {/* Employee ID (unchanged) */}
                            <div>
                                <label className="block text-sm">Employee ID</label>
                                <input
                                    type="text"
                                    disabled
                                    value={editRow.employee_id}
                                    className="mt-1 block w-full border p-2 rounded bg-gray-100"
                                />
                            </div>

                            {/* ← Replace this entire block:
              <label>Date</label>
              <input type="date" … />
            with: */}
                            <div>
                                <BasicDatePicker
                                    label="Date"
                                    value={editRow.date_text ? dayjs(editRow.date_text) : null}
                                    onChange={(newDate) => {
                                        const iso = newDate ? newDate.format("YYYY-MM-DD") : "";
                                        setEditRow((prev) => ({...prev, date_text: iso}));
                                    }}
                                />
                            </div>

                            {/* In Time / Out Time (unchanged) */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm">In Time</label>
                                    <input
                                        type="time"
                                        value={editRow.in_time}
                                        onChange={(e) =>
                                            setEditRow((p) => ({...p, in_time: e.target.value}))
                                        }
                                        className="mt-1 block w-full border p-2 rounded"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm">Out Time</label>
                                    <input
                                        type="time"
                                        value={editRow.out_time}
                                        onChange={(e) =>
                                            setEditRow((p) => ({...p, out_time: e.target.value}))
                                        }
                                        className="mt-1 block w-full border p-2 rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && deleteRow && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-semibold mb-4">Delete Attendance</h2>
                        <p className="mb-6">
                            Are you sure you want to delete the attendance record for{" "}
                            <strong>{deleteRow.employee_id}</strong> on{" "}
                            <strong>{deleteRow.date_text}</strong>?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setDeleteRow(null);
                                }}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}