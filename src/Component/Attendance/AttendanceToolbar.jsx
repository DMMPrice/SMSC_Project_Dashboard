// src/Component/Attendance/ManualAttendanceTable/AttendanceToolbar.jsx
import React from "react";
import {FiRefreshCw} from "react-icons/fi";
import {LuCalendarDays} from "react-icons/lu";
import InfoCard from "@/Component/Utils/InfoCard.jsx";
import BasicDatePicker from "@/Component/Utils/DateTimePicker.jsx";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import dayjs from "dayjs";

const PRIVILEGED = ["Admin", "Super Admin", "Attendance Team"];

export default function AttendanceToolbar({
                                              userRole,
                                              rows = [],
                                              loading = false,
                                              employees = [],
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
    const isPrivileged = PRIVILEGED.includes(userRole);
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 5}, (_, i) => currentYear - i);

    // Stats
    const totalWorkingDays = rows.length;
    const avgWorkingHours = rows.length
        ? (
            rows.reduce((sum, r) => sum + (parseFloat(r.working_hours) || 0), 0) /
            rows.length
        ).toFixed(2)
        : "0.00";

    const sorted = [...rows].sort(
        (a, b) => new Date(a.date_text) - new Date(b.date_text)
    );
    const start = sorted[0]?.date_text ?? null;
    const end = sorted[sorted.length - 1]?.date_text ?? null;
    const totalSpanDays = start && end ? dayjs(end).diff(dayjs(start), "day") + 1 : 0;
    const holidaysTaken = totalSpanDays - totalWorkingDays;

    return (
        <div className="mb-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-4 items-end">
                <div>
                    <label className="block text-sm mb-1">Year</label>
                    <CustomSelect
                        options={years}
                        value={selectedYear}
                        onChange={(v) => onYearChange(v != null ? +v : null)}
                        placeholder="All Years"
                    />
                </div>

                {isPrivileged && (
                    <div>
                        <label className="block text-sm mb-1">Employee</label>
                        <CustomSelect
                            options={employees}
                            value={selectedEmployee}
                            onChange={(v) => onEmployeeChange(v || null)}
                            placeholder="All Employees"
                        />
                    </div>
                )}

                <div>
                    <BasicDatePicker
                        label="Start Date"
                        value={startDate ? dayjs(startDate) : null}
                        onChange={(d) => onStartDateChange(d ? d.format("YYYY-MM-DD") : null)}
                    />
                </div>

                <div>
                    <BasicDatePicker
                        label="End Date"
                        value={endDate ? dayjs(endDate) : null}
                        onChange={(d) => onEndDateChange(d ? d.format("YYYY-MM-DD") : null)}
                    />
                </div>

                <div className="flex gap-2 col-span-3">
                    <button
                        onClick={onApply}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Apply
                    </button>
                    <button
                        onClick={onClear}
                        disabled={loading}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                        Clear
                    </button>
                    <button
                        onClick={onReload}
                        disabled={loading}
                        className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        <FiRefreshCw size={18}/>
                        Reload
                    </button>
                    <button
                        onClick={onAdd}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        + Add Attendance
                    </button>
                </div>
            </div>

            {/* Stats */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {Array(6)
                        .fill()
                        .map((_, i) => (
                            <div key={i} className="h-32 rounded-xl bg-gray-200 animate-pulse"/>
                        ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <InfoCard
                        header="Start Date"
                        value={start ? dayjs(start).format("DD MMM YYYY") : "-"}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-yellow-400"
                        textColor="text-yellow-800"
                        iconBgColor="bg-white"
                        iconColor="text-yellow-600"
                    />
                    <InfoCard
                        header="Days Span"
                        value={totalSpanDays}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-green-400"
                        textColor="text-green-800"
                        iconBgColor="bg-white"
                        iconColor="text-green-600"
                    />
                    <InfoCard
                        header="Days Worked"
                        value={totalWorkingDays}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-blue-400"
                        textColor="text-blue-800"
                        iconBgColor="bg-white"
                        iconColor="text-blue-600"
                    />
                    <InfoCard
                        header="Holidays Taken"
                        value={holidaysTaken}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-red-400"
                        textColor="text-red-800"
                        iconBgColor="bg-white"
                        iconColor="text-red-600"
                    />
                    <InfoCard
                        header="Avg Hours"
                        value={avgWorkingHours}
                        icon={<LuCalendarDays/>}
                        bgColor="bg-green-400"
                        textColor="text-green-800"
                        iconBgColor="bg-white"
                        iconColor="text-green-600"
                    />
                    <InfoCard
                        header="End Date"
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