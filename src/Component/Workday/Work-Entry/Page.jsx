import React, {useEffect, useState, useRef} from "react";
import axios from "axios";
import {API_URL} from "@/config.js";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import WorkEntryForm from "../WorkEntryForm.jsx";
import WorkEntryFilter from "../Work-Entry/WorkEntryFilter.jsx";
import WorkEntryEditModal from "../Work-Entry/WorkEntryEditModal.jsx";
import CommonModal from "@/Component/Utils/CommonModal.jsx";

export default function IndividualWorkEntryTable() {
    const stored = localStorage.getItem("userData");
    const {role, employee_id, id: userId} = stored ? JSON.parse(stored) : {};

    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [selectedEntry, setSelectedEntry] = useState(null);
    const [searchDate, setSearchDate] = useState(null);

    const fetchUserName = async (userId) => {
        try {
            const res = await axios.get(`${API_URL}users/${userId}`);
            return res.data?.full_name || `Unknown (${userId})`;
        } catch (err) {
            console.error(`❌ Failed to fetch user for ID ${userId}`, err);
            return `Unknown (${userId})`;
        }
    };

    const fetchEntries = async () => {
        try {
            setIsLoading(true);

            let res;
            if (role === "Admin" || role === "Super Admin") {
                res = await axios.get(`${API_URL}work-day/all`);
                res = res.data.entries;
            } else {
                res = await axios.get(`${API_URL}work-day/filter`, {params: {user_id: userId}});
                res = res.data.entries;
            }

            const enhanced = await Promise.all(
                res.map(async (entry) => {
                    const assignedByName = await fetchUserName(entry.assigned_by);
                    const assignedToName = await fetchUserName(entry.assigned_to);

                    return {
                        ...entry,
                        assigned_by_name: assignedByName,
                        assigned_to_name: assignedToName
                    };
                })
            );

            const sorted = enhanced.sort((a, b) => new Date(b.work_date) - new Date(a.work_date));

            setEntries(sorted);
            setFilteredEntries(sorted);
        } catch (err) {
            console.error("❌ Failed to fetch entries:", err);
            setErrorMessage("Failed to fetch Work Entries. Try again later.");
            setErrorModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const handleSearchByDate = () => {
        if (!searchDate) {
            setFilteredEntries(entries);
        } else {
            const searchFormatted = searchDate.toISOString().split("T")[0];
            const filtered = entries.filter((entry) => entry.work_date === searchFormatted);
            setFilteredEntries(filtered);
        }
    };

    const handleClear = () => {
        setSearchDate(null);
        setFilteredEntries(entries);
    };

    const toggleModal = () => setIsModalOpen((prev) => !prev);

    const columns = [
        {
            header: "Work Date",
            accessor: "work_date",
        },
        {
            header: "Project Name",
            accessor: "project_name",
        },
        {
            header: "Project Subpart",
            accessor: "project_subpart",
        },
        {
            header: "Hours Elapsed",
            accessor: "hours_elapsed",
        },
        {
            header: "Is Done",
            accessor: "is_done",
            filterType: "multi-select",
            options: ["Done", "Not Done"],
            render: (row) => (
                <span className={`text-xs font-bold ${row.is_done ? "text-green-600" : "text-red-500"}`}>
                    {row.is_done ? "Done" : "Not Done"}
                </span>
            ),
        },
        {
            header: "Issues",
            accessor: "issues",
            render: (row) => {
                if (!row.issues || row.issues.length === 0) return <span className="text-gray-400">None</span>;

                return (
                    <div className="flex flex-col gap-1">
                        {row.issues.map((issueObj, idx) => (
                            <div key={idx} className="text-xs bg-gray-100 rounded px-2 py-1">
                                <strong>{issueObj.severity}</strong>: {issueObj.issue}
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            header: "Assigned By",
            accessor: "assigned_by_name",
        },
        {
            header: "Assigned To",
            accessor: "assigned_to_name",
        },
    ];

    return (
        <div className="p-6 relative">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                    <div
                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <h2 className="text-2xl font-bold text-blue-700 mb-4">My Work Entries</h2>

            <WorkEntryFilter
                searchDate={searchDate}
                setSearchDate={setSearchDate}
                onSearch={handleSearchByDate}
                onClear={handleClear}
                onAddNew={toggleModal}
            />

            {!isLoading && (
                <CommonTable
                    title="Work Entries"
                    columns={columns}
                    data={filteredEntries}
                    userRole={role}
                    editRoles={["Admin", "Super Admin"]}
                    onEdit={(row) => {
                        setSelectedEntry(row);
                        setEditModalOpen(true);
                    }}
                />
            )}

            {/* Add Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
                        <WorkEntryForm toggleModal={toggleModal} fetchEntries={fetchEntries}/>
                    </div>
                </div>
            )}

            {/* Edit Entry Modal */}
            {editModalOpen && (
                <WorkEntryEditModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    entry={selectedEntry || {}}
                    onUpdated={fetchEntries}
                />
            )}

            {/* Error Modal */}
            {errorModalOpen && (
                <CommonModal
                    isOpen={errorModalOpen}
                    onClose={() => setErrorModalOpen(false)}
                    title="Error"
                    message={errorMessage}
                    confirmText="OK"
                    cancelText=""
                    onConfirm={() => setErrorModalOpen(false)}
                />
            )}
        </div>
    );
}