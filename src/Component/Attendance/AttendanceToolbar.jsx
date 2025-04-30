// src/Component/Attendance/ManualAttendanceTable/AttendanceToolbar.jsx
import React from "react";
import {FiRefreshCw} from "react-icons/fi";
import {LuCalendarDays} from "react-icons/lu";
import InfoCard from "@/Component/Utils/InfoCard.jsx";
import BasicDatePicker from "@/Component/Utils/DateTimePicker.jsx";
import dayjs from "dayjs";

const PRIVILEGED = ["Admin", "Super Admin", "Attendance Team"];

export default function AttendanceToolbar({
                                              userRole,
                                              rows = [],               // ← already filtered by parent
                                              loading = false,
                                              employees = [],          // [{ value, label }]
                                              selectedYear,
                                              onYearChange,
                                              selectedEmployee,
                                              onEmployeeChange,
                                              startDate,
                                              onStartDateChange,
                                              endDate,
                                              onEndDateChange,
                                              onApply,
                                              onClear,
                                              onAdd,
                                              onReload,
                                          }) {
    // Year options (last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 5}, (_, i) => currentYear - i);

    // Compute stats from passed-in rows
    const totalWorkingDays = rows.length;
    const avgWorkingHours = rows.length
        ? (
            rows.reduce((sum, r) => sum + (parseFloat(r.working_hours) || 0), 0) /
            rows.length
        ).toFixed(2)
        : "0.00";

    const sortedByDate = [...rows].sort(
        (a, b) => new Date(a.date_text) - new Date(b.date_text)
    );
    const start = sortedByDate[0]?.date_text ?? null;
    const end = sortedByDate[sortedByDate.length - 1]?.date_text ?? null;

    const totalSpanDays = start && end
        ? dayjs(end).diff(dayjs(start), "day") + 1
        : 0;
    const holidaysTaken = totalSpanDays - totalWorkingDays;

    const isPrivileged = PRIVILEGED.includes(userRole);

    return (
        <div className="mb-6">
            {/* ─── Filter Controls ───────────── */}
            <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-4 items-end">
                {/* Year */}
                <div className="col-span-1">
                    <label className="block text-sm mb-1">Year</label>
                    <select
                        value={selectedYear || ""}
                        onChange={e => onYearChange(e.target.value ? +e.target.value : null)}
                        className="w-full border rounded p-2"
                    >
                        <option value="">All</option>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* Employee (only if privileged) */}
                {isPrivileged && (
                    <div className="col-span-1">
                        <label className="block text-sm mb-1">Employee</label>
                        <select
                            value={selectedEmployee || ""}
                            onChange={e => onEmployeeChange(e.target.value || null)}
                            className="w-full border rounded p-2"
                        >
                            <option value="">All</option>
                            {employees.map(emp => (
                                <option key={emp.value} value={emp.value}>
                                    {emp.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Start Date */}
                <div className="col-span-1">
                    <BasicDatePicker
                        label="Start Date"
                        value={startDate ? dayjs(startDate) : null}
                        onChange={d => onStartDateChange(d ? d.format("YYYY-MM-DD") : null)}
                    />
                </div>

                {/* End Date */}
                <div className="col-span-1">
                    <BasicDatePicker
                        label="End Date"
                        value={endDate ? dayjs(endDate) : null}
                        onChange={d => onEndDateChange(d ? d.format("YYYY-MM-DD") : null)}
                    />
                </div>

                {/* Apply / Clear / Reload / Add */}
                <div className="flex gap-2 col-span-3">
                    <button
                        onClick={onApply}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Apply
                    </button>
                    <button
                        onClick={onClear}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Clear
                    </button>
                    <button
                        onClick={onReload}
                        className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        <FiRefreshCw size={18}/> Reload
                    </button>
                    <button
                        onClick={onAdd}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        + Add Attendance
                    </button>
                </div>
            </div>

            {/* ─── Stats Cards / Skeleton ───────── */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {Array(6).fill().map((_, i) => (
                        <div key={i} className="h-32 rounded-xl bg-gray-200 animate-pulse"/>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <InfoCard
                        header="Start Date"
                        headerClassName="text-lg"
                        headerColor="text-white"
                        value={start ? dayjs(start).format("DD MMM YYYY") : "-"}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-yellow-400"
                        textColor="text-yellow-800"
                        iconBgColor="bg-white"
                        iconColor="text-yellow-600"
                    />
                    <InfoCard
                        header="Days Span"
                        headerClassName="text-lg"
                        headerColor="text-white"
                        value={totalSpanDays}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-green-400"
                        textColor="text-green-800"
                        iconBgColor="bg-white"
                        iconColor="text-green-600"
                    />
                    <InfoCard
                        header="Days Worked"
                        headerClassName="text-lg"
                        headerColor="text-white"
                        value={totalWorkingDays}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-blue-400"
                        textColor="text-blue-800"
                        iconBgColor="bg-white"
                        iconColor="text-blue-600"
                    />
                    <InfoCard
                        header="Holidays Taken"
                        headerClassName="text-lg"
                        headerColor="text-white"
                        value={holidaysTaken}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-red-400"
                        textColor="text-red-800"
                        iconBgColor="bg-white"
                        iconColor="text-red-600"
                    />
                    <InfoCard
                        header="Avg Hours"
                        headerClassName="text-lg"
                        headerColor="text-white"
                        value={avgWorkingHours}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-green-400"
                        textColor="text-green-800"
                        iconBgColor="bg-white"
                        iconColor="text-green-600"
                    />
                    <InfoCard
                        header="End Date"
                        headerClassName="text-lg"
                        headerColor="text-white"
                        value={end ? dayjs(end).format("DD MMM YYYY") : "-"}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-yellow-400"
                        textColor="text-yellow-800"
                        iconBgColor="bg-white"
                        iconColor="text-yellow-600"
                    />
                </div>
            )}
        </div>
    );
}