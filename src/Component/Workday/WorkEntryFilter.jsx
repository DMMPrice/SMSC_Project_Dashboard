// src/Component/Workday/Work-Entry/WorkEntryFilter.jsx
import React from "react";
import CustomDatePicker from "@/Component/Utils/CustomDatePicker.jsx";
import {Button} from "@/components/ui/button";
import InfoCard from "@/Component/Utils/InfoCard.jsx";

const NAME_FILTER_ROLES = ["Super Admin", "Manager"];

export default function WorkEntryFilter({
                                            userRole,
                                            stats = [],
                                            employees = [],
                                            selectedEmployee,
                                            onEmployeeChange,
                                            searchDate,
                                            setSearchDate,
                                            onApply,
                                            onClear,
                                            onAddNew,
                                        }) {
    const showNameFilter = NAME_FILTER_ROLES.includes(userRole);

    return (
        <div className="mb-6 w-full">
            {/* InfoCards */}
            {stats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {stats.map((card, idx) => (
                        <InfoCard
                            key={idx}
                            header={card.header}
                            headerColor={card.headerColor}
                            headerClassName={card.headerClassName}
                            value={card.value}
                            icon={card.icon}
                            bgColor={card.bgColor}
                            textColor={card.textColor}
                            iconBgColor={card.iconBgColor}
                            iconColor={card.iconColor}
                        />
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap md:flex-nowrap items-end gap-4">
                {/* Date */}
                <CustomDatePicker
                    label="Search by Date"
                    selected={searchDate}
                    onChange={setSearchDate}
                    className="w-full md:w-52"
                />

                {/* Name (super admin & manager only) */}
                {showNameFilter && (
                    <select
                        value={selectedEmployee || ""}
                        onChange={(e) =>
                            onEmployeeChange(e.target.value ? +e.target.value : null)
                        }
                        className="w-full md:w-52 border rounded p-2"
                    >
                        <option value="">All Employees</option>
                        {employees.map((emp) => (
                            <option key={emp.value} value={emp.value}>
                                {emp.label}
                            </option>
                        ))}
                    </select>
                )}

                <Button
                    onClick={onApply}
                    className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700"
                >
                    Apply
                </Button>
                <Button
                    onClick={onClear}
                    className="w-full md:w-auto bg-gray-400 text-white hover:bg-gray-500"
                    variant="secondary"
                >
                    Clear
                </Button>
                <Button
                    onClick={onAddNew}
                    className="w-full md:w-auto bg-green-600 text-white hover:bg-green-700"
                >
                    Add New Work Entry
                </Button>
            </div>
        </div>
    );
}