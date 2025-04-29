// src/Component/Project/ProjectListTable.jsx
import React, {useState, useEffect} from "react";
import axios from "axios";
import {Dialog} from "@headlessui/react";
import {toast} from "react-toastify";
import {API_URL} from "@/config.js";
import AdvancedTable from "@/Component/Utils/AdvancedTable.jsx";
import EditProjectModal from "@/Component/Project/EditProjectModal.jsx";
import AddProjectModal from "@/Component/Project/AddProjectModal.jsx";
import ViewProjectModal from "@/Component/Project/ViewProjectModal.jsx";

export default function ProjectListTable() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const stored = localStorage.getItem("userData");
    const {role} = stored ? JSON.parse(stored) : {};

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewProject, setViewProject] = useState(null);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    // Delete‐modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteProject, setDeleteProject] = useState(null);

    // helper to fetch a user’s full name
    const fetchUserName = async (userId) => {
        try {
            const res = await axios.get(`${API_URL}users/${userId}`);
            return res.data?.full_name || `Unknown (${userId})`;
        } catch (err) {
            console.error(`Failed to fetch user for ID ${userId}`, err);
            return `Unknown (${userId})`;
        }
    };

    // load projects
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}projects/all`);
            const {projects: raw} = res.data;
            const incomplete = raw.filter((p) => !p.is_completed);

            const formatted = await Promise.all(
                incomplete.map(async (proj) => {
                    const createdByName = await fetchUserName(proj.created_by);
                    const assignedNames = Array.isArray(proj.assigned_ids)
                        ? await Promise.all(proj.assigned_ids.map(fetchUserName))
                        : [];

                    return {
                        id: proj.id,
                        project_name: proj.project_name,
                        total_estimate_hrs: proj.total_estimate_hrs,
                        total_elapsed_hrs: proj.total_elapsed_hrs,
                        assigned_ids: proj.assigned_ids || [],
                        assigned_names: assignedNames,
                        created_by: proj.created_by,
                        created_by_name: createdByName,
                        project_subparts: proj.project_subparts || [],
                        created_at: proj.created_at,
                        updated_at: proj.updated_at,
                    };
                })
            );

            setProjects(formatted);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            toast.error("Could not load project data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // table columns
    const columns = [
        {accessor: "project_name", header: "Project Name"},
        {accessor: "total_estimate_hrs", header: "Estimated Hrs"},
        {accessor: "total_elapsed_hrs", header: "Elapsed Hrs"},
        {
            accessor: "assigned_names",
            header: "Assigned Employees",
            render: (row) => (
                <div className="flex flex-wrap gap-2">
                    {row.assigned_names.map((name, i) => (
                        <span
                            key={i}
                            className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs"
                        >
            {name}
          </span>
                    ))}
                </div>
            ),
        },
        {
            accessor: "project_subparts",
            header: "Project Subparts",
            render: (row) => (
                <div className="space-y-2">
                    {row.project_subparts.length > 0 ? (
                        row.project_subparts.map((sub, idx) => (
                            <div key={idx} className="bg-gray-100 p-2 rounded shadow-sm">
                                <div className="text-sm font-semibold">
                                    {sub.project_subpart_name}
                                </div>
                                <div className="text-xs text-gray-600">
                                    Deadline: {sub.dead_line}
                                </div>
                                <div className="text-xs text-gray-600">
                                    Hours: {sub.hours_elapsed ?? 0}
                                </div>
                                <div className="text-xs text-gray-600">
                                    Done: {sub.is_done ? "✅" : "❌"}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-xs text-gray-400">No Subparts</div>
                    )}
                </div>
            ),
        },
        {accessor: "created_by_name", header: "Created By"},
        {accessor: "created_at", header: "Created Date"},
        {accessor: "updated_at", header: "Updated Date"},
    ];

    const userRole = role || "Employee";

    // open delete‐confirmation
    const openDeleteModal = (row) => {
        setDeleteProject(row);
        setDeleteModalOpen(true);
    };

    // confirm deletion
    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`${API_URL}projects/delete/${deleteProject.id}`);
            toast.success("Project deleted");
            setDeleteModalOpen(false);
            fetchProjects();
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Could not delete project");
        }
    };

    return (
        <div className="p-6">
            {(userRole === "Super Admin" ||
                userRole === "Admin" ||
                userRole === "Manager" ||
                userRole === "Employee") && (
                <div className="flex justify-end mb-4">
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => setAddModalOpen(true)}
                    >
                        + Add Project
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <svg
                        className="animate-spin h-10 w-10 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                        />
                    </svg>
                </div>
            ) : (
                <>
                    <AdvancedTable
                        title="Projects List"
                        columns={columns}
                        data={projects}
                        userRole={userRole}
                        editRoles={["Admin", "Super Admin"]}
                        deleteRoles={["Admin", "Super Admin"]}
                        onEdit={(row) => {
                            setSelectedProject(row);
                            setEditModalOpen(true);
                        }}
                        onView={(row) => {
                            setViewProject(row);
                            setViewModalOpen(true);
                        }}
                        onDelete={openDeleteModal}
                    />

                    {/* Edit Modal */}
                    <EditProjectModal
                        isOpen={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        project={selectedProject || {}}
                        onSave={async (updated) => {
                            try {
                                await axios.put(
                                    `${API_URL}projects/update/${updated.id}`,
                                    {
                                        project_name: updated.project_name,
                                        total_estimate_hrs: updated.total_estimate_hrs,
                                        total_elapsed_hrs: updated.total_elapsed_hrs,
                                        assigned_ids: updated.assigned_ids,
                                        project_subparts: updated.project_subparts,
                                        is_completed: updated.is_completed,
                                    }
                                );
                                toast.success("Project updated successfully!");
                                setEditModalOpen(false);
                                fetchProjects();
                            } catch (err) {
                                console.error("Update failed:", err);
                                toast.error("Failed to update project.");
                            }
                        }}
                    />

                    {/* View Modal */}
                    <ViewProjectModal
                        isOpen={viewModalOpen}
                        onClose={() => setViewModalOpen(false)}
                        project={viewProject}
                    />

                    {/* Add Modal */}
                    <AddProjectModal
                        isOpen={addModalOpen}
                        onClose={() => setAddModalOpen(false)}
                        onAdded={fetchProjects}
                    />

                    {/* Delete Confirmation Modal */}
                    {deleteModalOpen && (
                        <Dialog
                            open={deleteModalOpen}
                            onClose={() => setDeleteModalOpen(false)}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            {/* back-drop removed */}
                            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
                                <Dialog.Title className="text-lg font-semibold mb-4">
                                    Delete Project
                                </Dialog.Title>
                                <p className="mb-6">
                                    Are you sure you want to delete project{" "}
                                    <strong>{deleteProject?.project_name}</strong>?
                                </p>
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Dialog>
                    )}
                </>
            )}
        </div>
    );
}