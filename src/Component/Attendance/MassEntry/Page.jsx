// src/Component/Attendance/MassEntry/Page.jsx
import React, {useState, useEffect} from "react";
import axios from "axios";
import dayjs from "dayjs";
import {API_URL} from "@/config.js";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import {TextField} from "@mui/material";
import {Button} from "@/components/ui/Button";
import {toast} from "react-toastify";

export default function MassAttendanceEntry() {
    const [employees, setEmployees] = useState([]);
    const [rows, setRows] = useState([]);

    // load employee list once
    useEffect(() => {
        axios
            .get(`${API_URL}users/`)
            .then((res) => setEmployees(res.data))
            .catch(() => toast.error("Failed to load employees"));

        // start with one empty row
        resetRows();
    }, []);

    // helper to reset to a single blank row
    const resetRows = () => {
        setRows([
            {id: Date.now(), employee_id: "", date: "", in_time: "", out_time: ""},
        ]);
    };

    const addRow = () =>
        setRows((r) => [
            ...r,
            {id: Date.now(), employee_id: "", date: "", in_time: "", out_time: ""},
        ]);

    const deleteRow = (idx) =>
        setRows((r) => r.filter((_, i) => i !== idx));

    const updateRow = (idx, field, value) =>
        setRows((r) =>
            r.map((row, i) => (i === idx ? {...row, [field]: value} : row))
        );

    const handleSubmit = async () => {
        // prepare payload
        const payload = rows.map((r) => ({
            employee_id: r.employee_id,
            date: r.date,
            in_time: r.in_time,
            out_time: r.out_time,
        }));

        try {
            await axios.post(`${API_URL}attendance/mass-entry`, payload);
            toast.success("Attendance submitted!");
            resetRows();
        } catch (err) {
            console.error(err);
            toast.error("Submission failed. Please try again.");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Mass Attendance Entry</h1>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <table className="min-w-full border-collapse mb-4">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 text-left">Employee</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">In Time</th>
                        <th className="p-2 text-left">Out Time</th>
                        <th className="p-2">—</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                            {/* Employee Select */}
                            <td className="p-2">
                                <CustomSelect
                                    options={employees.map((e) => ({
                                        label: e.full_name,
                                        value: e.employee_id,
                                    }))}
                                    value={row.employee_id}
                                    onChange={(v) => updateRow(idx, "employee_id", v)}
                                    placeholder="Select Employee"
                                />
                            </td>

                            {/* Date */}
                            <td className="p-2">
                                <DatePicker
                                    value={row.date ? dayjs(row.date) : null}
                                    onChange={(d) =>
                                        updateRow(idx, "date", d ? d.format("YYYY-MM-DD") : "")
                                    }
                                    slots={{textField: TextField}}
                                />
                            </td>

                            {/* In Time */}
                            <td className="p-2">
                                <TimePicker
                                    value={row.in_time ? dayjs(row.in_time, "HH:mm") : null}
                                    onChange={(t) =>
                                        updateRow(idx, "in_time", t ? t.format("HH:mm") : "")
                                    }
                                    slots={{textField: TextField}}
                                />
                            </td>

                            {/* Out Time */}
                            <td className="p-2">
                                <TimePicker
                                    value={row.out_time ? dayjs(row.out_time, "HH:mm") : null}
                                    onChange={(t) =>
                                        updateRow(idx, "out_time", t ? t.format("HH:mm") : "")
                                    }
                                    slots={{textField: TextField}}
                                />
                            </td>

                            {/* Delete */}
                            <td className="p-2 text-center">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteRow(idx)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </LocalizationProvider>

            <div className="flex gap-4">
                <Button onClick={addRow} variant="outline">
                    + Add Row
                </Button>
                <Button onClick={handleSubmit}>Submit Attendance</Button>
            </div>
        </div>
    );
}