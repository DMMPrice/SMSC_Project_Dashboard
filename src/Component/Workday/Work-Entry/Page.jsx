// src/Component/Workday/Work-Entry/IndividualWorkEntryTable.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import {API_URL} from "@/config.js";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import WorkEntryForm from "../WorkEntryForm.jsx";
import WorkEntryFilter from "../Work-Entry/WorkEntryFilter.jsx";
import WorkEntryEditModal from "../Work-Entry/WorkEntryEditModal.jsx";
import CommonModal from "@/Component/Utils/CommonModal.jsx";

export default function IndividualWorkEntryTable() {
    const {role, id: userId} = JSON.parse(localStorage.getItem("userData") || "{}");

    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchDate, setSearchDate] = useState(null);

    const fetchEntries = async () => {
        try {
            setIsLoading(true);

            // 1️⃣ Fetch raw entries
            let resp;
            if (role === "Admin" || role === "Super Admin") {
                resp = await axios.get(`${API_URL}work-day/all`);
            } else {
                resp = await axios.get(`${API_URL}work-day/filter`, {
                    params: {
                        user_id: userId,
                        assigned_to: userId
                    }
                });
            }
            const rawEntries = resp.data.entries || [];

            // 2️⃣ Fetch all users for lookup
            const usersResp = await axios.get(`${API_URL}users/`);
            const usersList = usersResp.data || [];
            const userMap = usersList.reduce((m, u) => {
                m[u.id] = u.full_name;
                return m;
            }, {});

            // 3️⃣ Annotate and sort newest-first
            const annotated = rawEntries
                .map(e => ({
                    ...e,
                    assigned_by_name: userMap[e.assigned_by] || `Unknown (${e.assigned_by})`,
                    assigned_to_name: userMap[e.assigned_to] || `Unknown (${e.assigned_to})`
                }))
                .sort((a, b) => new Date(b.work_date) - new Date(a.work_date));

            setEntries(annotated);
            setFilteredEntries(annotated);

        } catch (err) {
            console.error("❌ Failed to fetch entries or users:", err);
            setErrorMessage("Failed to load data. Please try again later.");
            setErrorModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    // Filter by date
    const handleSearchByDate = () => {
        if (!searchDate) return setFilteredEntries(entries);
        const fmt = searchDate.toISOString().split("T")[0];
        setFilteredEntries(entries.filter(e => e.work_date === fmt));
    };
    const handleClear = () => {
        setSearchDate(null);
        setFilteredEntries(entries);
    };

    // Modals
    const toggleAddModal = () => setIsModalOpen(open => !open);
    const openEditModal = entry => {
        setSelectedEntry(entry);
        setEditModalOpen(true);
    };
    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedEntry(null);
    };

    const columns = [
        {header: "Work Date", accessor: "work_date"},
        {header: "Project Name", accessor: "project_name"},
        {header: "Project Subpart", accessor: "project_subpart"},
        {header: "Hours Elapsed", accessor: "hours_elapsed"},
        {
            header: "Is Done",
            accessor: "is_done",
            render: row => (
                <span className={`text-xs font-bold ${row.is_done ? "text-green-600" : "text-red-500"}`}>
          {row.is_done ? "Done" : "Not Done"}
        </span>
            )
        },
        {
            header: "Issues",
            accessor: "issues",
            render: row => {
                if (!row.issues?.length) return <span className="text-gray-400">None</span>;
                return (
                    <div className="flex flex-col gap-1">
                        {row.issues.map((i, idx) => (
                            <div key={idx} className="text-xs bg-gray-100 rounded px-2 py-1">
                                <strong>{i.severity}</strong>: {i.issue}
                            </div>
                        ))}
                    </div>
                );
            }
        },
        {header: "Assigned By", accessor: "assigned_by_name"},
        {header: "Assigned To", accessor: "assigned_to_name"},
        {
            header: "Actions",
            accessor: "actions",
            render: row => (
                <button
                    onClick={() => openEditModal(row)}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                >
                    Edit
                </button>
            )
        }
    ];

    return (
        <div className="p-6 relative">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                </div>
            )}

            <h2 className="text-2xl font-bold text-blue-700 mb-4">My Work Entries</h2>

            <WorkEntryFilter
                searchDate={searchDate}
                setSearchDate={setSearchDate}
                onSearch={handleSearchByDate}
                onClear={handleClear}
                onAddNew={toggleAddModal}
            />

            {!isLoading && (
                <CommonTable
                    title="Work Entries"
                    columns={columns}
                    data={filteredEntries}
                />
            )}

            {/* Add Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
                        <WorkEntryForm toggleModal={toggleAddModal} fetchEntries={fetchEntries}/>
                    </div>
                </div>
            )}

            {/* Edit Entry Modal */}
            {editModalOpen && (
                <WorkEntryEditModal
                    isOpen={editModalOpen}
                    entry={selectedEntry}
                    onClose={closeEditModal}
                    onUpdated={() => {
                        fetchEntries();
                        closeEditModal();
                    }}
                />
            )}

            {/* Error Modal */}
            {errorModalOpen && (
                <CommonModal
                    isOpen={errorModalOpen}
                    title="Error"
                    message={errorMessage}
                    confirmText="OK"
                    onConfirm={() => setErrorModalOpen(false)}
                />
            )}
        </div>
    );
}