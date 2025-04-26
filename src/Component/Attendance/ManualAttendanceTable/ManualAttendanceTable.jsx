// src/Component/Attendance/ManualAttendanceTable/ManualAttendanceTable.jsx
import React, {useState, useEffect} from "react";
import axios from "axios";
import {format} from "date-fns";
import {toast} from "react-toastify";
import {API_URL} from "@/config.js";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import AddAttendanceModal from "./AddAttendanceModal.jsx";

export default function ManualAttendanceTable() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add‐modal state
    const [addModalOpen, setAddModalOpen] = useState(false);

    // Edit‐modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editRow, setEditRow] = useState({
        id: null,
        employee_id: "",
        date_text: "",
        in_time: "",
        out_time: "",
    });

    // Delete‐modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);

    // Fetch + prepare attendance rows
    const fetchRows = () => {
        setLoading(true);
        const stored = localStorage.getItem("userData");
        const {role, employee_id} = stored ? JSON.parse(stored) : {};
        const endpoint =
            role === "Admin" || role === "Super Admin"
                ? `${API_URL}attendance/all`
                : `${API_URL}attendance/employee/${employee_id}`;

        axios
            .get(endpoint)
            .then(({data}) => {
                const prepared = data.map((r) => {
                    const d = new Date(r.date);
                    const iso = format(d, "yyyy-MM-dd");
                    const month = d.toLocaleString("default", {month: "long"});
                    const title = `${r.employee_id}-${iso}`;
                    const working_hours =
                        r.in_time && r.out_time
                            ? (
                                (parseInt(r.out_time.split(":")[0]) * 60 +
                                    parseInt(r.out_time.split(":")[1]) -
                                    (parseInt(r.in_time.split(":")[0]) * 60 +
                                        parseInt(r.in_time.split(":")[1]))) /
                                60
                            ).toFixed(2)
                            : "";

                    return {
                        ...r,
                        date_text: iso,
                        month,
                        title,
                        working_hours,
                        name: "", // will be filled next
                    };
                });
                setRows(prepared);
            })
            .catch((err) => {
                console.error("Failed to fetch attendance:", err);
                toast.error("Could not load attendance");
            })
            .finally(() => setLoading(false));
    };

    // Load on mount
    useEffect(fetchRows, []);

    // Fill in employee names
    useEffect(() => {
        rows.forEach((row, idx) => {
            if (!row.name && row.employee_id) {
                axios
                    .get(`${API_URL}users/profile/${row.employee_id}`)
                    .then(({data}) =>
                        setRows((prev) => {
                            const next = [...prev];
                            next[idx].name = data.full_name;
                            return next;
                        })
                    )
                    .catch((err) =>
                        console.error(
                            `Failed to load profile for ${row.employee_id}:`,
                            err
                        )
                    );
            }
        });
    }, [rows]);

    // Open edit modal
    const openEditModal = (row, idx) => {
        setEditIndex(idx);
        setEditRow({
            id: row.id,
            employee_id: row.employee_id,
            date_text: row.date_text,
            in_time: row.in_time,
            out_time: row.out_time,
        });
        setEditModalOpen(true);
    };

    // Open delete modal
    const openDeleteModal = (_row, idx) => {
        setDeleteIndex(idx);
        setDeleteModalOpen(true);
    };

    // Save edit
    const handleSaveEdit = () => {
        axios
            .put(`${API_URL}attendance/${editRow.id}`, {
                employee_id: editRow.employee_id,
                date: editRow.date_text,
                in_time: editRow.in_time,
                out_time: editRow.out_time,
            })
            .then(() => {
                toast.success("Attendance updated");
                setEditModalOpen(false);
                fetchRows();
            })
            .catch(() => toast.error("Update failed"));
    };

    // Confirm delete
    const handleConfirmDelete = () => {
        const row = rows[deleteIndex];
        axios
            .delete(`${API_URL}attendance/delete/${row.id}`)
            .then(() => {
                toast.success("Attendance deleted");
                setDeleteModalOpen(false);
                fetchRows();
            })
            .catch(() => toast.error("Delete failed"));
    };

    // Table column definitions
    const columns = [
        {accessor: "title", header: "Title"},
        {accessor: "date_text", header: "Date"},
        {accessor: "month", header: "Month"},
        {accessor: "employee_id", header: "Emp ID"},
        {accessor: "name", header: "Name"},
        {accessor: "in_time", header: "In"},
        {accessor: "out_time", header: "Out"},
        {accessor: "working_hours", header: "Working Hours"},
    ];

    // Current user role
    const userRole = JSON.parse(localStorage.getItem("userData"))?.role;

    return (
        <div className="p-6">
            {/* + Add Attendance only for Admin / Super Admin */}
            {(userRole === "Admin" || userRole === "Super Admin") && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        + Add Attendance
                    </button>
                </div>
            )}

            {/* Table or Loading Spinner */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <svg
                        className="animate-spin h-10 w-10 text-blue-600"
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
            ) : (
                <CommonTable
                    title="Manual Attendance"
                    columns={columns}
                    data={rows}
                    userRole={userRole}
                    editRoles={["Admin", "Super Admin"]}
                    deleteRoles={["Admin", "Super Admin"]}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                />
            )}

            {/* Add Attendance Modal */}
            <AddAttendanceModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdded={() => {
                    setAddModalOpen(false);
                    fetchRows();
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
                            <div>
                                <label className="block text-sm">Employee ID</label>
                                <input
                                    type="text"
                                    disabled
                                    value={editRow.employee_id}
                                    className="mt-1 block w-full border p-2 rounded bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm">Date</label>
                                <input
                                    type="date"
                                    value={editRow.date_text}
                                    onChange={(e) =>
                                        setEditRow((p) => ({
                                            ...p,
                                            date_text: e.target.value,
                                        }))
                                    }
                                    className="mt-1 block w-full border p-2 rounded"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm">In Time</label>
                                    <input
                                        type="time"
                                        value={editRow.in_time}
                                        onChange={(e) =>
                                            setEditRow((p) => ({
                                                ...p,
                                                in_time: e.target.value,
                                            }))
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
                                            setEditRow((p) => ({
                                                ...p,
                                                out_time: e.target.value,
                                            }))
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
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-semibold mb-4">
                            Delete Attendance
                        </h2>
                        <p className="mb-6">
                            Are you sure you want to delete the attendance record for{" "}
                            <strong>{rows[deleteIndex]?.employee_id}</strong> on{" "}
                            <strong>{rows[deleteIndex]?.date_text}</strong>?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
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