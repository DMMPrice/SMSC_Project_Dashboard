// src/Component/Utils/InputField.jsx
import React from "react";

export default function InputField({
                                       label,
                                       type = "text",
                                       value,
                                       onChange,
                                       className = "",
                                   }) {
    return (
        <div className={`w-full ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="mt-2 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
        </div>
    );
}