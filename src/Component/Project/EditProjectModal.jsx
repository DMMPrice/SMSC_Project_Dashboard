// src/Component/Project/EditProjectModal.jsx
import React, {useState, useEffect} from "react";
import {Button} from "@/components/ui/Button";
import {API_URL} from "@/config.js";
import axios from "axios";
import {FaTimes, FaTrashAlt} from "react-icons/fa";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import InputField from "@/Component/Utils/InputField.jsx";
import BasicDatePicker from "@/Component/Utils/DateTimePicker.jsx";
import dayjs from "dayjs";

export default function EditProjectModal({isOpen, onClose, project, onSave}) {
    const [form, setForm] = useState({
        project_name: "",
        total_estimate_hrs: 0,
        total_elapsed_hrs: 0,
        assigned_ids: [],
        project_subparts: [],
        is_completed: false,
        created_at: null,
    });
    const [allUsers, setAllUsers] = useState([]);
    const [newAssignId, setNewAssignId] = useState("");

    // Initialize form when `project` prop changes
    useEffect(() => {
        if (!project) return;
        setForm({
            project_name: project.project_name || "",
            total_estimate_hrs: project.total_estimate_hrs || 0,
            total_elapsed_hrs: project.total_elapsed_hrs || 0,
            assigned_ids: project.assigned_ids || [],
            project_subparts: project.project_subparts || [],
            is_completed: project.is_completed || false,
            created_at: project.created_at || null,
        });
    }, [project]);

    // Fetch all users once
    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`${API_URL}users/`);
                setAllUsers(res.data || []);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        })();
    }, []);

    // Auto-toggle `is_completed` when all subparts are done
    useEffect(() => {
        const subs = form.project_subparts;
        const allDone =
            subs.length > 0 && subs.every((sp) => Boolean(sp.is_done));
        if (allDone !== form.is_completed) {
            setForm((f) => ({...f, is_completed: allDone}));
        }
    }, [form.project_subparts]);

    // Generic field updater
    const handleInputChange = (name, value) => {
        setForm((f) => ({...f, [name]: value}));
    };

    // Add a new assigned ID
    const handleAddAssignedId = () => {
        if (
            newAssignId !== "" &&
            !form.assigned_ids.includes(newAssignId)
        ) {
            setForm((f) => ({
                ...f,
                assigned_ids: [...f.assigned_ids, newAssignId],
            }));
        }
        setNewAssignId("");
    };

    // Remove an assigned ID
    const removeAssignedId = (id) => {
        setForm((f) => ({
            ...f,
            assigned_ids: f.assigned_ids.filter((i) => i !== id),
        }));
    };

    // Subpart handlers
    const handleSubpartChange = (idx, field, value) => {
        const updated = [...form.project_subparts];
        updated[idx][field] = value;
        setForm((f) => ({...f, project_subparts: updated}));
    };
    const addSubpart = () => {
        setForm((f) => ({
            ...f,
            project_subparts: [
                ...f.project_subparts,
                {
                    project_subpart_name: "",
                    dead_line: "",
                    assigned_id: "",
                    hours_elapsed: 0,
                    is_done: false,
                },
            ],
        }));
    };
    const removeSubpart = (idx) => {
        setForm((f) => ({
            ...f,
            project_subparts: f.project_subparts.filter((_, i) => i !== idx),
        }));
    };

    // Submit handler
    const handleSubmit = () => {
        const finalData = {
            ...project,
            ...form,
            created_at: form.created_at
                ? dayjs.isDayjs(form.created_at)
                    ? form.created_at.format("YYYY-MM-DD")
                    : form.created_at
                : null,
        };
        onSave(finalData);
    };

    if (!isOpen) return null;

    // Filter out users already assigned
    const availableUsers = allUsers.filter(
        (u) => !form.assigned_ids.includes(u.id)
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl overflow-y-auto max-h-[90vh] relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">
                    Edit Project
                </h2>

                {/* Basic Info */}
                <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold">Basic Info</h3>
                    <InputField
                        label="Project Name"
                        value={form.project_name}
                        onChange={(e) =>
                            handleInputChange("project_name", e.target.value)
                        }
                    />
                    <div className="flex gap-4">
                        <InputField
                            label="Total Estimate Hrs"
                            type="number"
                            value={form.total_estimate_hrs}
                            onChange={(e) =>
                                handleInputChange(
                                    "total_estimate_hrs",
                                    Number(e.target.value)
                                )
                            }
                        />
                        <InputField
                            label="Total Elapsed Hrs"
                            type="number"
                            value={form.total_elapsed_hrs}
                            onChange={(e) =>
                                handleInputChange(
                                    "total_elapsed_hrs",
                                    Number(e.target.value)
                                )
                            }
                        />
                    </div>
                    <BasicDatePicker
                        label="Created Date"
                        value={form.created_at}
                        onChange={(val) =>
                            handleInputChange("created_at", val)
                        }
                    />

                    {/* Completed checkbox */}
                    <div className="flex items-center space-x-2 mt-2">
                        <input
                            id="is-completed"
                            type="checkbox"
                            checked={form.is_completed}
                            onChange={(e) =>
                                handleInputChange("is_completed", e.target.checked)
                            }
                            className="h-4 w-4"
                        />
                        <label
                            htmlFor="is-completed"
                            className="text-sm font-medium"
                        >
                            Mark project as complete
                        </label>
                    </div>
                </div>

                {/* Assigned Employees */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">
                        Assigned Employees
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {form.assigned_ids.map((id) => {
                            const user = allUsers.find((u) => u.id === id);
                            return (
                                <div
                                    key={id}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center space-x-2"
                                >
                                    <span>{user?.full_name || id}</span>
                                    <FaTimes
                                        onClick={() => removeAssignedId(id)}
                                        className="cursor-pointer"
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <CustomSelect
                                options={availableUsers.map((u) => ({
                                    label: u.full_name,
                                    value: u.id,
                                }))}
                                value={newAssignId}
                                onChange={(val) => setNewAssignId(val)}
                                placeholder="Select employee to assign"
                            />
                        </div>
                        <Button size="sm" onClick={handleAddAssignedId}>
                            Add
                        </Button>
                    </div>
                </div>

                {/* Project Subparts */}
                <div className="pb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">
                            Project Subparts
                        </h3>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={addSubpart}
                        >
                            + Add Subpart
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-gray-700">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2">Name</th>
                                <th className="p-2">Deadline</th>
                                <th className="p-2">Assign To</th>
                                <th className="p-2">Hours</th>
                                <th className="p-2">Done</th>
                                <th className="p-2">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {form.project_subparts.map((sub, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-2">
                                        <InputField
                                            value={sub.project_subpart_name}
                                            onChange={(e) =>
                                                handleSubpartChange(
                                                    idx,
                                                    "project_subpart_name",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="p-2">
                                        <InputField
                                            type="date"
                                            value={sub.dead_line}
                                            onChange={(e) =>
                                                handleSubpartChange(
                                                    idx,
                                                    "dead_line",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="p-2">
                                        <CustomSelect
                                            options={allUsers.map((u) => ({
                                                label: u.full_name,
                                                value: u.id,
                                            }))}
                                            value={sub.assigned_id}
                                            onChange={(val) =>
                                                handleSubpartChange(
                                                    idx,
                                                    "assigned_id",
                                                    val
                                                )
                                            }
                                            placeholder="Assign to"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <InputField
                                            type="number"
                                            value={sub.hours_elapsed}
                                            onChange={(e) =>
                                                handleSubpartChange(
                                                    idx,
                                                    "hours_elapsed",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={sub.is_done}
                                            onChange={(e) =>
                                                handleSubpartChange(
                                                    idx,
                                                    "is_done",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => removeSubpart(idx)}>
                                            <FaTrashAlt className="text-red-600 hover:text-red-800"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="default" onClick={handleSubmit}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}