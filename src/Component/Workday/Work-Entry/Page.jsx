import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {API_URL} from "@/config.js";
import WorkEntryForm from "../WorkEntryForm.jsx";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import WorkEntryFilter from "../Work-Entry/WorkEntryFilter.jsx";

const IndividualWorkEntryTable = () => {
    const employee_id = JSON.parse(localStorage.getItem("userData"))?.employee_id;

    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [searchDate, setSearchDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const modalRef = useRef(null);

    const fetchEntries = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${API_URL}work/by-employee`, {
                params: {employee_id},
            });

            const sorted = res.data.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

            setEntries(sorted);
            setFilteredEntries(sorted);
        } catch (err) {
            console.error("❌ Failed to fetch work entries:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (employee_id) fetchEntries();
    }, [employee_id]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isModalOpen) {
                toggleModal();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isModalOpen]);

    const handleSearchByDate = () => {
        if (!searchDate) {
            setFilteredEntries(entries);
        } else {
            const searchFormatted = searchDate.toISOString().split("T")[0];
            const filtered = entries.filter((entry) => entry.date === searchFormatted);
            setFilteredEntries(filtered);
        }
    };

    const handleClear = () => {
        setSearchDate(null);
        setFilteredEntries(entries);
    };

    const toggleModal = () => setIsModalOpen((prev) => !prev);

    const columns = [
        {header: "Work Entry Date", accessor: "date"},
        {header: "Expected Delivery", accessor: "expected_date_of_delivery"},
        {header: "Work Status", accessor: "work_status"},
        {header: "Tasks", accessor: "tasks"},
        {header: "Issue", accessor: "issue"},
    ];

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            toggleModal();
        }
    };

    return (
        <div className="p-6 relative">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-white bg-opacity-80">
                    <div
                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <h2 className="text-xl font-bold mb-4 text-blue-700">My Work Entries</h2>

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
                />
            )}

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center"
                    tabIndex={-1}
                    onKeyDown={(e) => e.key === "Escape" && toggleModal()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="bg-white rounded-lg p-6 shadow-lg w-full max-w-2xl"
                        onClick={(e) => e.stopPropagation()} // 👈 prevent closing on internal clicks
                    >
                        <WorkEntryForm toggleModal={toggleModal} fetchEntries={fetchEntries}/>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IndividualWorkEntryTable;