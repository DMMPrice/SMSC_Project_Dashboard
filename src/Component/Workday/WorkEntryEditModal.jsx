// src/Component/Work-Entry/WorkEntryEditModal.jsx
import React, {Fragment, useState, useEffect} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import CustomSelect from '@/Component/Utils/CustomSelect.jsx';
import {Textarea} from '@/components/ui/textarea';
import axios from 'axios';
import {API_URL} from '@/config.js';
import {toast} from 'react-toastify';
import {FiEdit2, FiX} from 'react-icons/fi';

const SEVERITY_OPTIONS = ['High', 'Medium', 'Low'];
const SEVERITY_COLORS = {
    High: 'border-red-500',
    Medium: 'border-yellow-500',
    Low: 'border-green-500'
};

export default function WorkEntryEditModal({isOpen, onClose, entry = {}, onUpdated}) {
    const [hoursElapsed, setHoursElapsed] = useState(0);
    const [isDone, setIsDone] = useState(false);
    const [issues, setIssues] = useState([]);

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

    const addIssue = () => setIssues([...issues, {issue: '', severity: 'Medium'}]);
    const removeIssue = idx => setIssues(issues.filter((_, i) => i !== idx));

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

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
                {/* Grey overlay */}
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50"/>

                <div className="flex items-center justify-center min-h-screen px-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300 transform"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200 transform"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel
                            className="inline-block w-full max-w-4xl md:max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all"
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                            >
                                <FiX size={24}/>
                            </button>

                            <div className="flex items-center gap-2 mb-4">
                                <FiEdit2 className="text-blue-600 text-2xl"/>
                                <Dialog.Title className="text-2xl font-semibold text-gray-800">
                                    Edit Work Entry
                                </Dialog.Title>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Hours Elapsed */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hours Elapsed (max 8)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={8}
                                        step={0.1}
                                        value={hoursElapsed}
                                        onChange={e => setHoursElapsed(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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
                                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition"
                                    />
                                    <label htmlFor="isDone" className="text-sm text-gray-700">
                                        Mark as Done
                                    </label>
                                </div>

                                {/* Issues */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Issues
                                    </label>
                                    <div className="space-y-3">
                                        {issues.map((it, idx) => (
                                            <div
                                                key={idx}
                                                className={`
                          flex items-start gap-2 p-4 bg-gray-50 rounded-lg border-l-4
                          ${SEVERITY_COLORS[it.severity]}
                        `}
                                            >
                                                <Textarea
                                                    placeholder="Describe the issue..."
                                                    value={it.issue}
                                                    onChange={e => handleIssueChange(idx, 'issue', e.target.value)}
                                                    rows={2}
                                                    className="flex-1 h-10 resize-none px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm"
                                                />
                                                <div className="flex flex-col gap-2">
                                                    <CustomSelect
                                                        options={SEVERITY_OPTIONS}
                                                        value={it.severity}
                                                        onChange={val => handleIssueChange(idx, 'severity', val)}
                                                        className="w-28"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeIssue(idx)}
                                                        className="self-end px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addIssue}
                                            className="mt-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                        >
                                            + Add Issue
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}