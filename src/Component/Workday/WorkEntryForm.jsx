import React, {useState, useEffect} from "react";
import axios from "axios";
import {API_URL} from "@/config.js";
import CustomDatePicker from "@/Component/Utils/CustomDatePicker.jsx";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "react-toastify";

export default function WorkEntryForm({toggleModal, fetchEntries}) {
    const stored = JSON.parse(localStorage.getItem("userData"));
    const employeeId = stored?.id;

    const [projectOptions, setProjectOptions] = useState([]);
    const [availableSubparts, setAvailableSubparts] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);

    const [form, setForm] = useState({
        date: null,
        project_name: "",
        project_subpart: "",
        assigned_by: employeeId,
        assigned_to: employeeId,
        hours_elapsed: "",
        issues: [],
        is_done: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchProjects();
        fetchEmployees();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${API_URL}projects/all`);
            const projects = res.data.projects || [];
            setProjectOptions(projects.map(p => ({
                label: p.project_name,
                value: p.project_name,
                // 💥 We save subparts separately
                subparts: p.project_subparts || []
            })));
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch projects.");
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${API_URL}users/`);
            const employees = res.data || [];
            setEmployeeOptions(employees.map(emp => ({
                label: emp.full_name,
                value: emp.id
            })));
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch employees.");
        }
    };

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setForm({...form, [name]: type === "checkbox" ? checked : value});
    };

    const handleProjectChange = (value) => {
        const selected = projectOptions.find(p => p.value === value);
        setForm({...form, project_name: value, project_subpart: ""});
        setAvailableSubparts(selected?.subparts || []);
    };

    const addIssueField = () => {
        setForm({...form, issues: [...form.issues, {issue: "", severity: "Medium"}]});
    };

    const removeIssueField = (idx) => {
        const updated = form.issues.filter((_, i) => i !== idx);
        setForm({...form, issues: updated});
    };

    const handleIssueChange = (idx, field, value) => {
        const updated = [...form.issues];
        updated[idx][field] = value;
        setForm({...form, issues: updated});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post(`${API_URL}work-day/create`, {
                user_id: employeeId,
                work_date: form.date?.toISOString().split("T")[0],
                project_name: form.project_name,
                project_subpart: form.project_subpart,
                assigned_by: form.assigned_by,
                assigned_to: form.assigned_to,
                hours_elapsed: parseFloat(form.hours_elapsed),
                issues: form.issues.filter(i => i.issue.trim() !== ""),
                is_done: form.is_done
            });

            await fetchEntries();
            toast.success("Work Entry submitted!");
            toggleModal();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-700 text-center">Submit Work Entry</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Work Date */}
                <CustomDatePicker
                    label="Work Entry Date"
                    selected={form.date}
                    onChange={(value) => setForm({...form, date: value})}
                />

                {/* Project Name */}
                <div>
                    <label className="text-sm text-gray-600 mb-1">Project Name</label>
                    <CustomSelect
                        value={form.project_name}
                        onChange={(value) => handleProjectChange(value)}
                        options={projectOptions.map(p => ({
                            label: p.label,
                            value: p.value
                        }))}
                        placeholder="Select Project"
                    />
                </div>

                {/* Project Subpart */}
                <div>
                    <label className="text-sm text-gray-600 mb-1">Project Subpart</label>
                    <CustomSelect
                        value={form.project_subpart}
                        onChange={(value) => setForm({...form, project_subpart: value})}
                        options={availableSubparts.map(sub => ({
                            label: sub.project_subpart_name,
                            value: sub.project_subpart_name
                        }))}
                        placeholder="Select Subpart"
                    />
                </div>

                {/* Assign To */}
                <div>
                    <label className="text-sm text-gray-600 mb-1">Assign To</label>
                    <CustomSelect
                        value={form.assigned_to}
                        onChange={(value) => setForm({...form, assigned_to: value})}
                        options={employeeOptions}
                        placeholder="Assign to employee"
                    />
                </div>

                {/* Hours Elapsed */}
                <div>
                    <label className="text-sm text-gray-600 mb-1">Hours Elapsed</label>
                    <input
                        type="number"
                        name="hours_elapsed"
                        value={form.hours_elapsed}
                        onChange={handleChange}
                        min="0"
                        max="8"
                        step="0.1"
                        required
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>

                {/* Is Done */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="is_done"
                        checked={form.is_done}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Mark as Done</label>
                </div>
            </div>

            {/* Issues */}
            <div className="mt-4">
                <label className="text-sm text-gray-600 mb-2 block">Issues</label>

                {form.issues.map((issueObj, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Issue description"
                            value={issueObj.issue}
                            onChange={(e) => handleIssueChange(idx, "issue", e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-md text-sm"
                        />
                        <select
                            value={issueObj.severity}
                            onChange={(e) => handleIssueChange(idx, "severity", e.target.value)}
                            className="px-3 py-2 border rounded-md text-sm"
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
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
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                    + Add Issue
                </button>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 text-white font-semibold rounded-md ${
                        isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>

                <button
                    type="button"
                    onClick={toggleModal}
                    disabled={isSubmitting}
                    className="px-6 py-2 text-white font-semibold bg-gray-400 rounded-md hover:bg-gray-500"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}