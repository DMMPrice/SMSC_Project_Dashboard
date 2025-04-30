// src/Component/Attendance/ManualAttendanceTable/DeleteAttendanceModal.jsx
import React from "react";

export default function DeleteAttendanceModal({
                                                  isOpen,
                                                  row,
                                                  onCancel,
                                                  onConfirm
                                              }) {
    if (!isOpen || !row) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                <h2 className="text-xl font-semibold mb-4">Delete Attendance</h2>
                <p className="mb-6">
                    Are you sure you want to delete the attendance record for{" "}
                    <strong>{row.employee_id}</strong> on{" "}
                    <strong>{row.date_text}</strong>?
                </p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}