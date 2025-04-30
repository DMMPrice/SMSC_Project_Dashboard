// src/Component/Workday/Work-Entry/ViewProjectModal.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import {API_URL} from "@/config.js";
import {Dialog} from "@headlessui/react";
import {FaClipboardList, FaUserFriends, FaPuzzlePiece} from "react-icons/fa";

export default function ViewProjectModal({isOpen, onClose, project}) {
    const [userMap, setUserMap] = useState({});

    // 1️⃣ Load all users once and build id→full_name map
    useEffect(() => {
        axios
            .get(`${API_URL}users/`)
            .then((res) => {
                const map = {};
                res.data.forEach((u) => {
                    map[u.id] = u.full_name;
                });
                setUserMap(map);
            })
            .catch((err) => {
                console.error("Failed to load users for name lookup", err);
            });
    }, []);

    if (!project) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <Dialog.Panel className="w-full max-w-5xl bg-white p-8 rounded-xl shadow-2xl overflow-y-auto">

                    <Dialog.Title className="flex items-center text-3xl font-bold mb-6 text-gray-800 gap-2">
                        <FaClipboardList className="text-blue-600"/> Project Details
                    </Dialog.Title>

                    {/* ─── Project Main Info ─────────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div><b>Project Name:</b> {project.project_name || "-"}</div>
                        <div><b>Created By:</b> {project.created_by_name || "-"}</div>
                        <div><b>Estimated Hours:</b> {project.total_estimate_hrs ?? "-"}</div>
                        <div><b>Elapsed Hours:</b> {project.total_elapsed_hrs ?? "-"}</div>
                        <div><b>Created
                            Date:</b> {project.created_at ? new Date(project.created_at).toLocaleString() : "-"}</div>
                        <div><b>Updated
                            Date:</b> {project.updated_at ? new Date(project.updated_at).toLocaleString() : "-"}</div>
                    </div>

                    {/* ─── Assigned Employees ───────────────────────────────────────────── */}
                    <div className="mb-8">
                        <h3 className="flex items-center text-xl font-semibold mb-3 text-gray-700 gap-2">
                            <FaUserFriends className="text-green-600"/> Assigned Employees:
                        </h3>
                        {project.assigned_names?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {project.assigned_names.map((name, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs shadow-sm"
                                    >
                    {name}
                  </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No employees assigned.</p>
                        )}
                    </div>

                    {/* ─── Project Subparts ─────────────────────────────────────────────── */}
                    <div>
                        <h3 className="flex items-center text-xl font-semibold mb-3 text-gray-700 gap-2">
                            <FaPuzzlePiece className="text-purple-600"/> Project Subparts:
                        </h3>
                        {project.project_subparts?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.project_subparts.map((sub, idx) => (
                                    <div
                                        key={idx}
                                        className="border rounded-lg p-4 bg-gray-50 shadow hover:shadow-md transition-all"
                                    >
                                        <div className="font-semibold text-gray-700">{sub.project_subpart_name}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            <b>Assigned To: </b>
                                            {userMap[sub.assigned_id] ?? `#${sub.assigned_id}` ?? "-"}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <b>Deadline:</b> {sub.dead_line ?? "-"}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <b>Is Done:</b> {sub.is_done ? "✅ Done" : "❌ Pending"}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <b>Hours Elapsed:</b> {sub.hours_elapsed ?? "0"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No subparts available.</p>
                        )}
                    </div>

                    {/* ─── Close Button ─────────────────────────────────────────────────── */}
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                        >
                            Close
                        </button>
                    </div>

                </Dialog.Panel>
            </div>
        </Dialog>
    );
}