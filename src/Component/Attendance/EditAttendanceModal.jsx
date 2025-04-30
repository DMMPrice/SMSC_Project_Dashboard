// src/Component/Attendance/ManualAttendanceTable/EditAttendanceModal.jsx
import React from "react";
import dayjs from "dayjs";
import BasicDatePicker from "@/Component/Utils/DateTimePicker.jsx";

export default function EditAttendanceModal({
                                                isOpen,
                                                onClose,
                                                editRow,
                                                setEditRow,
                                                onSave
                                            }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Edit Attendance</h2>

                <div className="space-y-4">
                    {/* Employee ID */}
                    <div>
                        <label className="block text-sm">Employee ID</label>
                        <input
                            type="text"
                            disabled
                            value={editRow.employee_id}
                            className="mt-1 block w-full border p-2 rounded bg-gray-100"
                        />
                    </div>

                    {/* Date */}
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

                    {/* In Time / Out Time */}
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
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}