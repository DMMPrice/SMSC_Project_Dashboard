// src/Component/Work-Entry/WorkEntryEditModal.jsx
import React, {useState, useEffect} from 'react';
import {Dialog} from '@headlessui/react';
import CustomSelect from '@/Component/Utils/CustomSelect.jsx';
import axios from 'axios';
import {API_URL} from '@/config.js';
import {toast} from 'react-toastify';

const SEVERITY_OPTIONS = ['High', 'Medium', 'Low'];

export default function WorkEntryEditModal({isOpen, onClose, entry = {}, onUpdated}) {
    const [hoursElapsed, setHoursElapsed] = useState(0);
    const [isDone, setIsDone] = useState(false);
    const [issues, setIssues] = useState([]);

    // initialize form state whenever a new entry is passed in
    useEffect(() => {
        setHoursElapsed(entry.hours_elapsed ?? 0);
        setIsDone(entry.is_done ?? false);
        setIssues(Array.isArray(entry.issues) ? entry.issues : []);
    }, [entry]);

    const handleIssueChange = (idx, field, value) => {
        const copy = [...issues];
        copy[idx] = {...copy[idx], [field]: value};
        setIssues(copy);
    };

    const addIssue = () => {
        setIssues([...issues, {issue: '', severity: 'Medium'}]);
    };

    const removeIssue = idx => {
        setIssues(issues.filter((_, i) => i !== idx));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (hoursElapsed > 8) {
            toast.error('Hours elapsed cannot exceed 8');
            return;
        }
        try {
            await axios.put(`${API_URL}work-day/update/${entry.id}`, {
                hours_elapsed: parseFloat(hoursElapsed),
                is_done: isDone,
                issues: issues.filter(i => i.issue.trim() !== ''),
            });
            toast.success('Work entry updated');
            onUpdated();
            onClose();
        } catch (err) {
            console.error('Update failed', err);
            toast.error(err.response?.data?.message || 'Failed to update work entry');
        }
    };

    if (!isOpen) return null;
    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="w-full max-w-lg bg-white p-6 rounded-lg shadow-xl">
                    <Dialog.Title className="text-2xl font-semibold mb-4">Edit Work Entry</Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Hours Elapsed */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Hours Elapsed (max 8)</label>
                            <input
                                type="number"
                                min={0}
                                max={8}
                                step={0.1}
                                value={hoursElapsed}
                                onChange={e => setHoursElapsed(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        {/* Is Done */}
                        <div className="flex items-center space-x-2">
                            <input
                                id="isDone"
                                type="checkbox"
                                checked={isDone}
                                onChange={e => setIsDone(e.target.checked)}
                                className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="isDone" className="text-sm">Mark as Done</label>
                        </div>

                        {/* Issues */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Issues</label>
                            {issues.map((it, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={it.issue}
                                        onChange={e => handleIssueChange(idx, 'issue', e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                    <CustomSelect
                                        options={SEVERITY_OPTIONS}
                                        value={it.severity}
                                        onChange={val => handleIssueChange(idx, 'severity', val)}
                                        className="w-32 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeIssue(idx)}
                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addIssue}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                                + Add Issue
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
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