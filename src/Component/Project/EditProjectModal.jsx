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

    useEffect(() => {
        if (project) {
            setForm({
                project_name: project.project_name || "",
                total_estimate_hrs: project.total_estimate_hrs || 0,
                total_elapsed_hrs: project.total_elapsed_hrs || 0,
                assigned_ids: project.assigned_ids || [],
                project_subparts: project.project_subparts || [],
                is_completed: project.is_completed || false,
                created_at: project.created_at || null,
            });
        }
    }, [project]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await axios.get(`${API_URL}users/`);
                setAllUsers(res.data || []);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        }

        fetchUsers();
    }, []);

    const handleInputChange = (name, value) => {
        setForm((prev) => ({...prev, [name]: value}));
    };

    const handleAddAssignedId = () => {
        if (newAssignId && !form.assigned_ids.includes(newAssignId)) {
            setForm((prev) => ({
                ...prev,
                assigned_ids: [...prev.assigned_ids, newAssignId],
            }));
        }
        setNewAssignId("");
    };

    const removeAssignedId = (id) => {
        setForm((prev) => ({
            ...prev,
            assigned_ids: prev.assigned_ids.filter((i) => i !== id),
        }));
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
                    assigned_id: "",
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

    const handleSubmit = () => {
        const finalData = {
            ...project,
            ...form,
            created_at: form.created_at
                ? (dayjs.isDayjs(form.created_at)
                    ? form.created_at.format("YYYY-MM-DD")
                    : form.created_at)
                : null,
        };
        onSave(finalData);
    };

    if (!isOpen) return null;

    const availableUsers = allUsers.filter((u) => !form.assigned_ids.includes(u.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-5 rounded-md shadow-lg w-full max-w-7xl overflow-y-auto max-h-[90vh] relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">Edit Project</h2>

                {/* Basic Info */}
                <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold">Basic Info</h3>
                    <InputField
                        label="Project Name"
                        value={form.project_name}
                        onChange={(e) => handleInputChange("project_name", e.target.value)}
                    />
                    <div className="flex gap-4">
                        <InputField
                            label="Total Estimate Hrs"
                            type="number"
                            value={form.total_estimate_hrs}
                            onChange={(e) => handleInputChange("total_estimate_hrs", e.target.value)}
                        />
                        <InputField
                            label="Total Elapsed Hrs"
                            type="number"
                            value={form.total_elapsed_hrs}
                            onChange={(e) => handleInputChange("total_elapsed_hrs", e.target.value)}
                        />
                    </div>
                    <BasicDatePicker
                        label="Created Date"
                        value={form.created_at}
                        onChange={(newVal) => handleInputChange("created_at", newVal)}
                    />
                </div>

                {/* Assigned Employees */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Assigned Employees</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {form.assigned_ids.map((id) => {
                            const user = allUsers.find((u) => u.id === id);
                            return (
                                <div key={id}
                                     className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center space-x-2">
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
                                value=""
                                onChange={(selected) => setNewAssignId(selected.value)}
                                placeholder="Select employee to assign"
                            />
                        </div>
                        <Button size="sm" onClick={handleAddAssignedId}>
                            Add
                        </Button>
                    </div>
                </div>

                {/* Project Subparts */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Project Subparts</h3>
                        <Button size="sm" variant="outline" onClick={addSubpart}>
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
                                            onChange={(e) => handleSubpartChange(idx, "project_subpart_name", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <InputField
                                            type="date"
                                            value={sub.dead_line}
                                            onChange={(e) => handleSubpartChange(idx, "dead_line", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <CustomSelect
                                            options={allUsers.map((u) => ({
                                                label: u.full_name,
                                                value: u.id,
                                            }))}
                                            value=""
                                            onChange={(selected) =>
                                                handleSubpartChange(idx, "assigned_id", selected.value)
                                            }
                                            placeholder="Assign to"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <InputField
                                            type="number"
                                            value={sub.hours_elapsed}
                                            onChange={(e) => handleSubpartChange(idx, "hours_elapsed", Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={sub.is_done}
                                            onChange={(e) => handleSubpartChange(idx, "is_done", e.target.checked)}
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