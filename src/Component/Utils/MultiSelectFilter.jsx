import React from "react";

export default function MultiSelectFilter({options, selectedValues, onChange}) {
    const toggleOption = (option) => {
        if (selectedValues.includes(option)) {
            onChange(selectedValues.filter((v) => v !== option));
        } else {
            onChange([...selectedValues, option]);
        }
    };

    return (
        <div className="bg-white border rounded-md p-2 text-xs shadow-sm space-y-1">
            {options.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedValues.includes(option)}
                        onChange={() => toggleOption(option)}
                        className="w-4 h-4"
                    />
                    {option}
                </label>
            ))}
        </div>
    );
}