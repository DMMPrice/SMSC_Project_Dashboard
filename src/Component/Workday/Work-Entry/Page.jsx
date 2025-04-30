// src/Component/Workday/Work-Entry/IndividualWorkEntryTable.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import {API_URL} from "@/config.js";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import InfoCard from "@/Component/Utils/InfoCard.jsx";
import {FiClipboard, FiClock, FiCheckCircle} from "react-icons/fi";
import WorkEntryForm from "../WorkEntryForm.jsx";
import WorkEntryFilter from "../WorkEntryFilter.jsx";
import WorkEntryEditModal from "../WorkEntryEditModal.jsx";
import CommonModal from "@/Component/Utils/CommonModal.jsx";

export default function IndividualWorkEntryTable() {
    const {role, id: userId} = JSON.parse(
        localStorage.getItem("userData") || "{}"
    );

    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [employeesList, setEmployeesList] = useState([]);     // for name dropdown
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchDate, setSearchDate] = useState(null);

    // 1️⃣ load user list, then fetch entries using that map
    useEffect(() => {
        (async () => {
            try {
                const usersResp = await axios.get(`${API_URL}users/`);
                const userList = usersResp.data || [];
                // dropdown options
                setEmployeesList(
                    userList.map((u) => ({value: u.id, label: u.full_name}))
                );
                await fetchEntries(userList);
            } catch (err) {
                console.error(err);
                setErrorMessage("Failed to load employees.");
                setErrorModalOpen(true);
                await fetchEntries([]);
            }
        })();
    }, []);

    // fetch entries + annotate
    const fetchEntries = async (userList) => {
        try {
            setIsLoading(true);
            let resp;
            if (role === "Admin" || role === "Super Admin") {
                resp = await axios.get(`${API_URL}work-day/all`);
            } else {
                resp = await axios.get(`${API_URL}work-day/filter`, {
                    params: {user_id: userId, assigned_to: userId},
                });
            }
            const raw = resp.data.entries || [];

            const userMap = (userList || []).reduce((m, u) => {
                m[u.id] = u.full_name;
                return m;
            }, {});

            const annotated = raw
                .map((e) => ({
                    ...e,
                    assigned_by_name:
                        userMap[e.assigned_by] || `Unknown (${e.assigned_by})`,
                    assigned_to_name:
                        userMap[e.assigned_to] || `Unknown (${e.assigned_to})`,
                }))
                .sort((a, b) => new Date(b.work_date) - new Date(a.work_date));

            setEntries(annotated);
            setFilteredEntries(annotated);
        } catch (err) {
            console.error(err);
            setErrorMessage("Failed to load entries.");
            setErrorModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    // 2️⃣ apply both date + employee filters
    const handleApplyFilters = () => {
        let fr = [...entries];
        if (searchDate) {
            const fmt = searchDate.toISOString().split("T")[0];
            fr = fr.filter((e) => e.work_date === fmt);
        }
        if (selectedEmployee) {
            fr = fr.filter((e) => e.assigned_to === selectedEmployee);
        }
        setFilteredEntries(fr);
    };
    const handleClearFilters = () => {
        setSearchDate(null);
        setSelectedEmployee(null);
        setFilteredEntries(entries);
    };

    // 3️⃣ modals
    const toggleAddModal = () => setIsModalOpen((v) => !v);
    const openEditModal = (e) => {
        setSelectedEntry(e);
        setEditModalOpen(true);
    };
    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedEntry(null);
    };

    // 4️⃣ stats
    const totalEntries = filteredEntries.length;
    const totalHours = filteredEntries
        .reduce((sum, e) => sum + parseFloat(e.hours_elapsed || 0), 0)
        .toFixed(2);
    const avgHours = totalEntries
        ? (totalHours / totalEntries).toFixed(2)
        : "0.00";
    const doneCount = filteredEntries.filter((e) => e.is_done).length;
    const pendingCount = totalEntries - doneCount;

    let dpBgColor, dpIconColor;
    if (pendingCount === 0) {
        dpBgColor = "bg-green-500";
        dpIconColor = "text-green-600";
    } else if (pendingCount > doneCount) {
        dpBgColor = "bg-red-500";
        dpIconColor = "text-red-600";
    } else {
        dpBgColor = "bg-yellow-500";
        dpIconColor = "text-yellow-600";
    }

    const stats = [
        {
            header: "Total Entries",
            headerColor: "text-white",
            headerClassName: "text-lg",
            value: totalEntries,
            icon: <FiClipboard/>,
            bgColor: "bg-blue-500",
            textColor: "text-white",
            iconBgColor: "bg-white",
            iconColor: "text-blue-600",
        },
        {
            header: "Total Hours Worked",
            headerColor: "text-white",
            headerClassName: "text-lg",
            value: totalHours,
            icon: <FiClock/>,
            bgColor: "bg-green-500",
            textColor: "text-white",
            iconBgColor: "bg-white",
            iconColor: "text-green-600",
        },
        {
            header: "Average Hours",
            headerColor: "text-white",
            headerClassName: "text-lg",
            value: avgHours,
            icon: <FiClock/>,
            bgColor: "bg-orange-500",
            textColor: "text-white",
            iconBgColor: "bg-white",
            iconColor: "text-orange-600",
        },
        {
            header: "Done / Pending",
            headerColor: "text-white",
            headerClassName: "text-lg",
            value: `${doneCount} / ${pendingCount}`,
            icon: <FiCheckCircle/>,
            bgColor: dpBgColor,
            textColor: "text-white",
            iconBgColor: "bg-white",
            iconColor: dpIconColor,
        },
    ];

    // 5️⃣ table
    const columns = [
        {header: "Work Date", accessor: "work_date"},
        {header: "Project Name", accessor: "project_name"},
        {header: "Project Subpart", accessor: "project_subpart"},
        {header: "Hours Elapsed", accessor: "hours_elapsed"},
        {
            header: "Is Done",
            accessor: "is_done",
            render: (row) => (
                <span className={row.is_done ? "text-green-600" : "text-red-500"}>
          {row.is_done ? "Done" : "Not Done"}
        </span>
            ),
        },
        {
            header: "Issues",
            accessor: "issues",
            render: (row) =>
                row.issues?.length ? (
                    <div className="flex flex-col gap-1">
                        {row.issues.map((i, idx) => (
                            <div
                                key={idx}
                                className="text-xs bg-gray-100 rounded px-2 py-1"
                            >
                                <strong>{i.severity}</strong>: {i.issue}
                            </div>
                        ))}
                    </div>
                ) : (
                    <span className="text-gray-400">None</span>
                ),
        },
        {header: "Assigned By", accessor: "assigned_by_name"},
        {header: "Assigned To", accessor: "assigned_to_name"},
        {
            header: "Actions",
            accessor: "actions",
            render: (row) => (
                <button
                    onClick={() => openEditModal(row)}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                >
                    Edit
                </button>
            ),
        },
    ];

    return (
        <div className="p-6 relative">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                </div>
            )}

            <h2 className="text-2xl font-bold text-blue-700 mb-4">
                My Work Entries
            </h2>

            <WorkEntryFilter
                userRole={role}
                stats={stats}
                employees={employeesList}
                selectedEmployee={selectedEmployee}
                onEmployeeChange={setSelectedEmployee}
                searchDate={searchDate}
                setSearchDate={setSearchDate}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                onAddNew={toggleAddModal}
            />

            {!isLoading && (
                <CommonTable
                    title="Work Entries"
                    columns={columns}
                    data={filteredEntries}
                />
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
                        <WorkEntryForm
                            toggleModal={toggleAddModal}
                            fetchEntries={() => fetchEntries(employeesList)}
                        />
                    </div>
                </div>
            )}

            {editModalOpen && (
                <WorkEntryEditModal
                    isOpen={editModalOpen}
                    entry={selectedEntry}
                    onClose={closeEditModal}
                    onUpdated={() => {
                        fetchEntries(employeesList);
                        closeEditModal();
                    }}
                />
            )}

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