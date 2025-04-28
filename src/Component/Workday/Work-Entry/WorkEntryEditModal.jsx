import React, {useState, useEffect} from "react";
import {Dialog} from "@headlessui/react";
import {toast} from "react-toastify";
import axios from "axios";
import {API_URL} from "@/config.js";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx"; // ✅ Import your CustomSelect

const SEVERITY_OPTIONS = ["High", "Medium", "Low"];

export default function WorkEntryEditModal({isOpen, onClose, entry, onUpdated}) {
    const [form, setForm] = useState({
        project_name: entry.project_name || "",
        project_subpart: entry.project_subpart || "",
        hours_elapsed: entry.hours_elapsed || 0,
        issues: Array.isArray(entry.issues)
            ? entry.issues.map(i => ({issue: i.issue || "", severity: i.severity || "Medium"}))
            : [],
        is_done: entry.is_done || false,
        assigned_by_name: "",
        assigned_to_name: "",
    });

    useEffect(() => {
        if (entry.assigned_by) fetchAssignedName(entry.assigned_by, "assigned_by_name");
        if (entry.assigned_to) fetchAssignedName(entry.assigned_to, "assigned_to_name");
    }, [entry]);

    const fetchAssignedName = async (id, field) => {
        try {
            const res = await axios.get(`${API_URL}users/${id}`);
            setForm(prev => ({...prev, [field]: res.data?.full_name || `Unknown (${id})`}));
        } catch (err) {
            console.error("Failed to fetch assigned user name:", err);
        }
    };

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setForm({...form, [name]: type === "checkbox" ? checked : value});
    };

    const handleIssueChange = (idx, field, value) => {
        const updatedIssues = [...form.issues];
        updatedIssues[idx][field] = value;
        setForm({...form, issues: updatedIssues});
    };

    const addIssueField = () => {
        setForm({...form, issues: [...form.issues, {issue: "", severity: "Medium"}]});
    };

    const removeIssueField = (idx) => {
        const updatedIssues = form.issues.filter((_, i) => i !== idx);
        setForm({...form, issues: updatedIssues});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.hours_elapsed > 8) {
            toast.error("Hours elapsed cannot exceed 8!");
            return;
        }

        try {
            await axios.put(`${API_URL}work-day/update/${entry.id}`, {
                project_name: form.project_name,
                project_subpart: form.project_subpart,
                hours_elapsed: parseFloat(form.hours_elapsed),
                is_done: form.is_done,
                issues: form.issues.filter(i => i.issue.trim()), // Only keep non-empty issues
            });

            toast.success("Work entry updated successfully!");
            onUpdated();
            onClose();
        } catch (err) {
            console.error("❌ Update failed:", err);
            toast.error("Failed to update work entry");
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="w-full max-w-lg bg-white p-6 rounded-lg shadow-xl">
                    <Dialog.Title className="text-2xl font-semibold mb-6 text-gray-800">
                        Edit Work Entry
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Project Name */}
                        <div>
                            <label className="text-sm font-medium">Project Name:</label>
                            <input
                                type="text"
                                name="project_name"
                                value={form.project_name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        {/* Project Subpart */}
                        <div>
                            <label className="text-sm font-medium">Project Subpart:</label>
                            <input
                                type="text"
                                name="project_subpart"
                                value={form.project_subpart}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        {/* Hours Elapsed */}
                        <div>
                            <label className="text-sm font-medium">Hours Elapsed (max 8):</label>
                            <input
                                type="number"
                                name="hours_elapsed"
                                min="0"
                                max="8"
                                step="0.1"
                                value={form.hours_elapsed}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        {/* Issues with Severity */}
                        <div>
                            <label className="text-sm font-medium">Issues:</label>
                            {form.issues.map((issueItem, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Issue Description"
                                        value={issueItem.issue}
                                        onChange={(e) => handleIssueChange(idx, "issue", e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md"
                                    />
                                    <CustomSelect
                                        options={SEVERITY_OPTIONS}
                                        value={issueItem.severity}
                                        onChange={(value) => handleIssueChange(idx, "severity", value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeIssueField(idx)}
                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addIssueField}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm mt-2"
                            >
                                + Add Issue
                            </button>
                        </div>

                        {/* Is Done Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_done"
                                checked={form.is_done}
                                onChange={handleChange}
                                className="w-5 h-5"
                            />
                            <label className="text-sm font-medium">Mark as Done</label>
                        </div>

                        {/* Assigned By/Assigned To */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <b>Assigned By:</b><br/>{form.assigned_by_name || "Self"}
                            </div>
                            <div>
                                <b>Assigned To:</b><br/>{form.assigned_to_name || "Self"}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>

                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}