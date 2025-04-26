// src/Component/Utils/CustomSelect.jsx
import React, {useState, useRef, useEffect} from "react";

function CustomSelect({
                          options = [],
                          value = "",
                          onChange,
                          placeholder = "Select an option",
                          className = "",
                      }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            ref={selectRef}
            className={`relative overflow-visible ${className}`}   // ← allow overflow
        >
            {/* trigger */}
            <div
                className="w-full px-4 py-2 border rounded-md bg-white shadow-sm cursor-pointer hover:shadow-md"
                onClick={() => setIsOpen((o) => !o)}
            >
                {value || placeholder}
            </div>

            {/* dropdown */}
            {isOpen && (
                <ul className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.length ? (
                        options.map((opt, i) => (
                            <li
                                key={i}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                            >
                                {opt}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-gray-500 text-center">
                            No options available
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default CustomSelect;