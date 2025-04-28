import React, {useState, useEffect} from "react";
import {Dialog} from "@headlessui/react";
import {toast} from "react-toastify";
import axios from "axios";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import InputField from "@/Component/Utils/InputField.jsx";
import BasicDatePicker from "@/Component/Utils/DateTimePicker.jsx";
import {API_URL} from "@/config.js";

export default function AddProjectModal({isOpen, onClose, onAdded}) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        project_name: "",
        total_estimate_hrs: 0,
        total_elapsed_hrs: 0,
        assigned_ids: [],
        project_subparts: [],
        is_completed: false,
        created_at: null,
    });

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${API_URL}users/`);
            const data = res.data || [];
            setEmployees(
                data.map((emp) => ({
                    label: emp.full_name,
                    value: emp.id,
                }))
            );
        } catch (err) {
            console.error("Failed to fetch employees:", err);
            toast.error("Failed to load employees");
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}projects/create`, {
                project_name: form.project_name,
                total_estimate_hrs: form.total_estimate_hrs,
                total_elapsed_hrs: form.total_elapsed_hrs,
                assigned_ids: form.assigned_ids,
                project_subparts: form.project_subparts,
                created_by: JSON.parse(localStorage.getItem("userData"))?.id || 1,
                client_id: 1,
                created_at: form.created_at ? form.created_at.format("YYYY-MM-DD") : undefined,
            });

            toast.success("Project created successfully!");
            onAdded();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create project.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubpartChange = (idx, field, value) => {
        const updated = [...form.project_subparts];
        updated[idx][field] = value;
        setForm((prev) => ({...prev, project_subparts: updated}));
    };

    const addSubpart = () => {
        setForm((prev) => ({
            ...prev,
            project_subparts: [
                ...prev.project_subparts,
                {
                    project_subpart_name: "",
                    dead_line: "",
                    assigned_id: null,
                    hours_elapsed: 0,
                    is_done: false,
                },
            ],
        }));
    };

    const removeSubpart = (idx) => {
        setForm((prev) => ({
            ...prev,
            project_subparts: prev.project_subparts.filter((_, i) => i !== idx),
        }));
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true"/>
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-6xl bg-white p-6 rounded-lg overflow-y-auto max-h-[90vh]">
                    <Dialog.Title className="text-2xl font-semibold mb-4">
                        Add New Project
                    </Dialog.Title>

                    <div className="grid grid-cols-2 gap-6">
                        <InputField
                            label="Project Name"
                            value={form.project_name}
                            onChange={(e) =>
                                setForm((p) => ({...p, project_name: e.target.value}))
                            }
                        />
                        <InputField
                            label="Total Estimate Hours"
                            type="number"
                            value={form.total_estimate_hrs}
                            onChange={(e) =>
                                setForm((p) => ({...p, total_estimate_hrs: e.target.value}))
                            }
                        />
                        <InputField
                            label="Total Elapsed Hours"
                            type="number"
                            value={form.total_elapsed_hrs}
                            onChange={(e) =>
                                setForm((p) => ({...p, total_elapsed_hrs: e.target.value}))
                            }
                        />
                        <BasicDatePicker
                            label="Project Start Date"
                            value={form.created_at}
                            onChange={(val) =>
                                setForm((p) => ({...p, created_at: val}))
                            }
                        />
                    </div>

                    {/* Assigned Employees */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Assigned Employees</h3>
                        <div className="flex gap-4">
                            <CustomSelect
                                options={employees
                                    .filter((e) => !form.assigned_ids.includes(e.value))
                                    .map((e) => ({label: e.label, value: e.value}))}
                                value=""
                                onChange={(selected) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        assigned_ids: [...prev.assigned_ids, selected.value],
                                    }));
                                }}
                                placeholder="Select Employee to Assign"
                            />
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {form.assigned_ids.map((id) => {
                                const emp = employees.find((e) => e.value === id);
                                return (
                                    <div
                                        key={id}
                                        className="flex items-center bg-blue-100 px-3 py-1 rounded-full"
                                    >
                                        <span className="mr-2">{emp?.label || `ID-${id}`}</span>
                                        <button
                                            className="text-red-600"
                                            onClick={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    assigned_ids: prev.assigned_ids.filter((eid) => eid !== id),
                                                }))
                                            }
                                        >
                                            &times;
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Project Subparts */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2">Project Subparts</h3>

                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">Subpart Name</th>
                                    <th className="p-2 border">Deadline</th>
                                    <th className="p-2 border">Assigned</th>
                                    <th className="p-2 border">Hours Elapsed</th>
                                    <th className="p-2 border">Done</th>
                                    <th className="p-2 border">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {form.project_subparts.map((sp, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2 border">
                                            <input
                                                type="text"
                                                className="border p-2 rounded w-full"
                                                value={sp.project_subpart_name}
                                                onChange={(e) =>
                                                    handleSubpartChange(idx, "project_subpart_name", e.target.value)
                                                }
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="date"
                                                className="border p-2 rounded w-full"
                                                value={sp.dead_line}
                                                onChange={(e) =>
                                                    handleSubpartChange(idx, "dead_line", e.target.value)
                                                }
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <CustomSelect
                                                options={employees.map((e) => ({
                                                    label: e.label,
                                                    value: e.value,
                                                }))}
                                                value={
                                                    employees.find((e) => e.value === sp.assigned_id)?.label || ""
                                                }
                                                onChange={(selected) =>
                                                    handleSubpartChange(idx, "assigned_id", selected.value)
                                                }
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                className="border p-2 rounded w-full"
                                                value={sp.hours_elapsed}
                                                onChange={(e) =>
                                                    handleSubpartChange(idx, "hours_elapsed", e.target.value)
                                                }
                                            />
                                        </td>
                                        <td className="p-2 border text-center">
                                            <input
                                                type="checkbox"
                                                checked={sp.is_done}
                                                onChange={(e) =>
                                                    handleSubpartChange(idx, "is_done", e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td className="p-2 border text-center">
                                            <button
                                                className="text-red-600 font-bold"
                                                onClick={() => removeSubpart(idx)}
                                            >
                                                ×
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <div className="mt-4">
                                <button
                                    onClick={addSubpart}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    + Add Subpart
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Project"}
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}