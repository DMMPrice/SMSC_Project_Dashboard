import React, {useState, useEffect} from "react";
import axios from "axios";
import {API_URL} from "@/config.js";
import {toast} from "react-toastify";
import AdvancedTable from "@/Component/Utils/AdvancedTable.jsx";
import EditProjectModal from "@/Component/Project/EditProjectModal.jsx";
import AddProjectModal from "@/Component/Project/AddProjectModal.jsx";
import ViewProjectModal from "@/Component/Project/ViewProjectModal.jsx";

export default function ArchivedProjectList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    const [selectedProject, setSelectedProject] = useState(null);
    const [viewProject, setViewProject] = useState(null);

    const stored = localStorage.getItem("userData");
    const {role, employee_id} = stored ? JSON.parse(stored) : {};

    // Fetch user name by ID
    const fetchUserName = async (userId) => {
        try {
            const res = await axios.get(`${API_URL}users/${userId}`);
            return res.data?.full_name || `Unknown (${userId})`;
        } catch (err) {
            console.error(`Failed to fetch user ${userId}`, err);
            return `Unknown (${userId})`;
        }
    };

    // Fetch Archived Projects (is_completed === true)
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}projects/all`);
            const {projects} = res.data;

            const archivedProjects = projects.filter((proj) => proj.is_completed === true);

            const formatted = await Promise.all(
                archivedProjects.map(async (proj) => {
                    const createdByName = await fetchUserName(proj.created_by);

                    let assignedNames = [];
                    if (Array.isArray(proj.assigned_ids) && proj.assigned_ids.length > 0) {
                        assignedNames = await Promise.all(
                            proj.assigned_ids.map((id) => fetchUserName(id))
                        );
                    }

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
                        is_completed: proj.is_completed || false,
                        client_id: proj.client_id || 1,
                        created_at: proj.created_at,
                        updated_at: proj.updated_at,
                    };
                })
            );

            setProjects(formatted);
        } catch (err) {
            console.error("Failed to fetch archived projects:", err);
            toast.error("Could not load archived project data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const columns = [
        {accessor: "project_name", header: "Project Name"},
        {accessor: "total_estimate_hrs", header: "Estimated Hrs"},
        {accessor: "total_elapsed_hrs", header: "Elapsed Hrs"},
        {accessor: "assigned_names", header: "Assigned Employees"},
        {
            accessor: "project_subparts", header: "Project Subparts", render: (row) => (
                <div className="space-y-2">
                    {row.project_subparts?.length > 0 ? (
                        row.project_subparts.map((subpart, idx) => (
                            <div key={idx} className="bg-gray-100 p-2 rounded-md shadow-sm">
                                <div className="text-sm font-semibold">{subpart.project_subpart_name}</div>
                                <div className="text-xs text-gray-600">Deadline: {subpart.dead_line}</div>
                                <div className="text-xs text-gray-600">Hours: {subpart.hours_elapsed ?? 0}</div>
                                <div className="text-xs text-gray-600">Done: {subpart.is_done ? "✅" : "❌"}</div>
                            </div>
                        ))
                    ) : (
                        <div className="text-xs text-gray-400">No Subparts</div>
                    )}
                </div>
            )
        },
        {accessor: "created_by_name", header: "Created By"},
        {accessor: "created_at", header: "Created Date"},
        {accessor: "updated_at", header: "Updated Date"},
    ];

    const userRole = JSON.parse(localStorage.getItem("userData"))?.role || "Employee";

    return (
        <div className="p-6">
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <svg
                        className="animate-spin h-10 w-10 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                </div>
            ) : (
                <>
                    <AdvancedTable
                        title="Archived Project List"
                        columns={columns}
                        data={projects}
                        userRole={userRole}
                        editRoles={["Admin", "Super Admin"]}
                        onEdit={(row) => {
                            setSelectedProject(row);
                            setEditModalOpen(true);
                        }}
                        onView={(row) => {
                            setViewProject(row);
                            setViewModalOpen(true);
                        }}
                    />

                    {/* Edit Project Modal */}
                    <EditProjectModal
                        isOpen={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        project={selectedProject || {}}
                        onSave={async (updatedProject) => {
                            try {
                                await axios.put(`${API_URL}projects/update/${updatedProject.id}`, {
                                    project_name: updatedProject.project_name,
                                    total_estimate_hrs: updatedProject.total_estimate_hrs,
                                    total_elapsed_hrs: updatedProject.total_elapsed_hrs,
                                    assigned_ids: updatedProject.assigned_ids,
                                    project_subparts: updatedProject.project_subparts,
                                    is_completed: updatedProject.is_completed,
                                });
                                toast.success("Project updated successfully!");
                                setEditModalOpen(false);
                                fetchProjects();
                            } catch (err) {
                                console.error("Failed to update project:", err);
                                toast.error("Failed to update project.");
                            }
                        }}
                    />

                    {/* View Project Modal */}
                    <ViewProjectModal
                        isOpen={viewModalOpen}
                        onClose={() => setViewModalOpen(false)}
                        project={viewProject}
                    />

                    {/* Add Project Modal */}
                    <AddProjectModal
                        isOpen={addModalOpen}
                        onClose={() => setAddModalOpen(false)}
                        onAdded={fetchProjects}
                    />
                </>
            )}
        </div>
    );
}