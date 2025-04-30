// src/Component/Workday/Work-Entry/WorkEntryFilter.jsx
import React from "react";
import CustomDatePicker from "@/Component/Utils/CustomDatePicker.jsx";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import {Button} from "@/components/ui/button";
import InfoCard from "@/Component/Utils/InfoCard.jsx";

const NAME_FILTER_ROLES = ["Super Admin", "Manager"];

export default function WorkEntryFilter({
                                            userRole,
                                            stats = [],
                                            employees = [],            // [{ value, label }]
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
            {/* ─── Info Cards ──────────────────────────────── */}
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

            {/* ─── Filter Controls ─────────────────────────── */}
            <div className="flex flex-wrap md:flex-nowrap items-end gap-4">
                {/* Date Picker */}
                <CustomDatePicker
                    label="Search by Date"
                    selected={searchDate}
                    onChange={setSearchDate}
                    className="w-full md:w-52"
                />

                {/* Name dropdown for privileged roles */}
                {showNameFilter && (
                    <CustomSelect
                        options={employees}
                        value={selectedEmployee}
                        onChange={(val) => onEmployeeChange(val || null)}
                        placeholder="All Employees"
                        className="w-full md:w-52"
                    />
                )}

                {/* Action Buttons */}
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