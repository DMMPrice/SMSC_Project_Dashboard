// src/Component/Attendance/ManualAttendanceTable/AddAttendanceModal.jsx
import React, {useState, useEffect} from "react";
import axios from "axios";
import dayjs from "dayjs";
import {toast} from "react-toastify";
import {API_URL} from "@/config.js";

import BasicDatePicker from "@/Component/Utils/DateTimePicker.jsx";  // adjust path as needed
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";  // adjust path as needed

import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {TimePicker} from "@mui/x-date-pickers/TimePicker";
import TextField from "@mui/material/TextField";

export default function AddAttendanceModal({isOpen, onClose, onAdded}) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedName, setSelectedName] = useState("");
    const [form, setForm] = useState({
        employee_id: "",
        date: "",
        in_time: "",
        out_time: "",
    });

    // Load employee list when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        axios
            .get(`${API_URL}users/`)
            .then(({data}) => setEmployees(data))
            .catch(() => toast.error("Failed to load employees"))
            .finally(() => setLoading(false));
    }, [isOpen]);

    // When the user picks a name, store it and find the ID
    const handleEmployeeChange = (fullName) => {
        setSelectedName(fullName);
        const emp = employees.find((e) => e.full_name === fullName);
        setForm((f) => ({...f, employee_id: emp ? emp.employee_id : ""}));
    };

    const handleSubmit = () => {
        const {employee_id, date, in_time, out_time} = form;
        if (!employee_id || !date || !in_time || !out_time) {
            return toast.error("All fields are required");
        }
        axios
            .post(`${API_URL}attendance/`, {employee_id, date, in_time, out_time})
            .then(() => {
                toast.success("Attendance added");
                onAdded();
                onClose();
            })
            .catch(() => toast.error("Failed to add attendance"));
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Add Attendance</h2>

                {loading ? (
                    <div className="flex justify-center py-8">Loading…</div>
                ) : (
                    <div className="space-y-4">
                        {/* Employee dropdown via CustomSelect */}
                        <div>
                            <label className="block text-sm mb-1">Employee</label>
                            <CustomSelect
                                options={employees.map((e) => e.full_name)}
                                value={selectedName}
                                onChange={handleEmployeeChange}
                                placeholder="Select an employee"
                                className="w-full"
                            />
                        </div>

                        {/* Date picker */}
                        <div>
                            <label className="block text-sm mb-1">Date</label>
                            <BasicDatePicker
                                label="Date"
                                value={form.date ? dayjs(form.date) : null}
                                onChange={(newDate) => {
                                    const iso = newDate ? newDate.format("YYYY-MM-DD") : "";
                                    setForm((f) => ({...f, date: iso}));
                                }}
                            />
                        </div>

                        {/* Time pickers */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm mb-1">In Time</label>
                                    <TimePicker
                                        label="In Time"
                                        value={form.in_time ? dayjs(form.in_time, "HH:mm") : null}
                                        onChange={(newTime) => {
                                            const str = newTime ? newTime.format("HH:mm") : "";
                                            setForm((f) => ({...f, in_time: str}));
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} className="w-full"/>
                                        )}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm mb-1">Out Time</label>
                                    <TimePicker
                                        label="Out Time"
                                        value={form.out_time ? dayjs(form.out_time, "HH:mm") : null}
                                        onChange={(newTime) => {
                                            const str = newTime ? newTime.format("HH:mm") : "";
                                            setForm((f) => ({...f, out_time: str}));
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} className="w-full"/>
                                        )}
                                    />
                                </div>
                            </div>
                        </LocalizationProvider>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}