// src/Component/Employee-Details/AddEmployeeForm/AddEmployeeForm.jsx
import React, {useState, useEffect} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import {format} from "date-fns";

import BasicDatePicker from "@/Component/Utils/DateTimePicker.jsx";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import {API_URL} from "@/config.js";

const WORK_POSITIONS = [
    "Director",
    "Manager",
    "Developer",
    "Designer",
    // …etc
];

const ROLES = [
    "Employee",
    "Admin",
    "Attendance Team"
];

// Helper to generate a random 8-character password
function generateRandomPassword(length = 8) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pw = "";
    for (let i = 0; i < length; i++) {
        pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pw;
}

export default function AddEmployeeForm() {
    const [form, setForm] = useState({
        employee_id: "",
        full_name: "",
        email: "",
        phone: "",
        address: "",
        fathers_name: "",
        aadhar_no: "",
        date_of_birth: "",
        work_position: "",
        role: "",
        password: "",
    });

    // "auto" or "custom"
    const [passwordOption, setPasswordOption] = useState("auto");
    const [customPassword, setCustomPassword] = useState("");

    // Whenever we switch to "auto", generate a fresh password
    useEffect(() => {
        if (passwordOption === "auto") {
            setForm((f) => ({...f, password: generateRandomPassword()}));
        }
    }, [passwordOption]);

    // Generic setter for text inputs
    const handleChange = (field) => (e) =>
        setForm((f) => ({...f, [field]: e.target.value}));

    // DatePicker callback gives us a JS Date or Dayjs object
    const handleDateChange = (newDate) => {
        const iso = newDate ? format(new Date(newDate), "yyyy-MM-dd") : "";
        setForm((f) => ({...f, date_of_birth: iso}));
    };

    // CustomSelect callbacks
    const handlePositionChange = (pos) =>
        setForm((f) => ({...f, work_position: pos}));
    const handleRoleChange = (rl) =>
        setForm((f) => ({...f, role: rl}));

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Choose final password
        const password =
            passwordOption === "auto" ? form.password : customPassword.trim();

        if (passwordOption === "custom" && !password) {
            return toast.error("Please enter a custom password");
        }

        // Validate required fields
        const required = [
            "employee_id",
            "full_name",
            "email",
            "phone",
            "address",
            "fathers_name",
            "aadhar_no",
            "date_of_birth",
            "work_position",
            "role",
        ];
        const missing = required.filter((f) => !form[f]);
        if (missing.length) {
            return toast.error(`Missing fields: ${missing.join(", ")}`);
        }

        try {
            // note the plural "users" endpoint
            await axios.post(`${API_URL}users/`, {
                ...form,
                password,
            });
            toast.success("Employee created successfully");
            // Reset form
            setForm({
                employee_id: "",
                full_name: "",
                email: "",
                phone: "",
                address: "",
                fathers_name: "",
                aadhar_no: "",
                date_of_birth: "",
                work_position: "",
                role: "",
                password: "",
            });
            setCustomPassword("");
            setPasswordOption("auto");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create employee");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto"
        >
            <h2 className="text-2xl font-semibold mb-6">Add New Member</h2>

            <div className="grid grid-cols-2 gap-6">
                {/* Employee ID */}
                <div>
                    <label className="block font-medium mb-1">Employee ID</label>
                    <input
                        type="text"
                        value={form.employee_id}
                        onChange={handleChange("employee_id")}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                {/* Password Choice */}
                <div>
                    <label className="block font-medium mb-1">Password</label>
                    <div className="flex items-center gap-4 mb-2">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="pwOpt"
                                value="auto"
                                checked={passwordOption === "auto"}
                                onChange={() => setPasswordOption("auto")}
                                className="mr-2"
                            />
                            Auto-generate
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="pwOpt"
                                value="custom"
                                checked={passwordOption === "custom"}
                                onChange={() => setPasswordOption("custom")}
                                className="mr-2"
                            />
                            Custom
                        </label>
                    </div>
                    {passwordOption === "auto" ? (
                        <input
                            type="text"
                            value={form.password}
                            readOnly
                            className="w-full border px-3 py-2 rounded bg-gray-100"
                        />
                    ) : (
                        <input
                            type="text"
                            value={customPassword}
                            onChange={(e) => setCustomPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full border px-3 py-2 rounded"
                        />
                    )}
                </div>

                {/* Full Name */}
                <div>
                    <label className="block font-medium mb-1">Full Name</label>
                    <input
                        type="text"
                        value={form.full_name}
                        onChange={handleChange("full_name")}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block font-medium mb-1">Phone</label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={handleChange("phone")}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block font-medium mb-1">Address</label>
                    <input
                        type="text"
                        value={form.address}
                        onChange={handleChange("address")}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                {/* Father’s Name */}
                <div>
                    <label className="block font-medium mb-1">Father’s Name</label>
                    <input
                        type="text"
                        value={form.fathers_name}
                        onChange={handleChange("fathers_name")}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                {/* Aadhar No */}
                <div>
                    <label className="block font-medium mb-1">Aadhar No</label>
                    <input
                        type="text"
                        value={form.aadhar_no}
                        onChange={handleChange("aadhar_no")}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block font-medium mb-1">Date of Birth</label>
                    <BasicDatePicker
                        label="YYYY-MM-DD"
                        value={form.date_of_birth}
                        onChange={handleDateChange}
                    />
                </div>

                {/* Work Position */}
                <div>
                    <label className="block font-medium mb-1">Work Position</label>
                    <CustomSelect
                        options={WORK_POSITIONS}
                        value={form.work_position}
                        onChange={handlePositionChange}
                        placeholder="Select Position"
                        className="w-full"
                    />
                </div>

                {/* Role */}
                <div>
                    <label className="block font-medium mb-1">Role</label>
                    <CustomSelect
                        options={ROLES}
                        value={form.role}
                        onChange={handleRoleChange}
                        placeholder="Select Role"
                        className="w-full"
                    />
                </div>
            </div>

            <button
                type="submit"
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
            >
                Add Employee
            </button>
        </form>
    );
}