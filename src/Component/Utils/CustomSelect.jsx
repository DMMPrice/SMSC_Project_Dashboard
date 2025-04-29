import React, {useState, useRef, useEffect} from "react";

export default function CustomSelect({
                                         options = [],             // array of strings or { label, value }
                                         value = null,             // the currently selected value
                                         onChange,                 // receives the new `value`
                                         placeholder = "Select…",
                                         className = "",
                                     }) {
    // normalize all options to { label,value }
    const normalized = options.map((opt) =>
        typeof opt === "object"
            ? {label: opt.label, value: opt.value}
            : {label: opt, value: opt}
    );

    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // close on outside click
    useEffect(() => {
        const onBodyClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", onBodyClick);
        return () => document.removeEventListener("mousedown", onBodyClick);
    }, []);

    // find the label for the current `value`
    const selected = normalized.find((o) => o.value === value);

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* trigger */}
            <div
                className="w-full px-4 py-2 border rounded-md bg-white cursor-pointer"
                onClick={() => setIsOpen((o) => !o)}
            >
                {selected ? selected.label : placeholder}
            </div>

            {/* dropdown */}
            {isOpen && (
                <ul className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {normalized.length > 0 ? (
                        normalized.map((opt, i) => (
                            <li
                                key={i}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                            >
                                {opt.label}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-gray-500 text-center">
                            No options
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}