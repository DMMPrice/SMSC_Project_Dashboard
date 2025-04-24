import React, {useEffect, useState} from "react";
import axios from "axios";
import {API_URL} from "@/config.js";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import CustomDatePicker from "@/Component/Utils/CustomDatePicker.jsx";
import {Button} from "@/components/ui/button";

const WorkEntryTable = () => {
    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [searchDate, setSearchDate] = useState(null);

    useEffect(() => {
        axios
            .get(`${API_URL}work/all`)
            .then((res) => {
                const sorted = res.data.sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                setEntries(sorted);
                setFilteredEntries(sorted);
                setTimeout(() => setAnimate(true), 50);
            })
            .catch((err) => {
                console.error("❌ Failed to fetch work entries:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleSearchByDate = () => {
        if (!searchDate) {
            setFilteredEntries(entries);
        } else {
            const formatted = searchDate.toISOString().split("T")[0];
            const filtered = entries.filter((entry) => entry.date === formatted);
            setFilteredEntries(filtered);
        }
    };

    const handleClear = () => {
        setSearchDate(null);
        setFilteredEntries(entries);
    };

    const columns = [
        {header: "Name", accessor: "full_name"},
        {header: "Date", accessor: "date"},
        {header: "Expected Delivery", accessor: "expected_date_of_delivery"},
        {header: "Work Status", accessor: "work_status"},
        {header: "Tasks", accessor: "tasks"},
        {header: "Issue", accessor: "issue"},
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
            </div>
        );
    }

    return (
        <div className={`p-6 ${animate ? "animate-fade-in" : "opacity-0"}`}>
            <h2 className="text-xl font-bold mb-4 text-blue-700">All Work Entries</h2>

            {/* Filter Section */}
            <div className="flex flex-wrap md:flex-nowrap items-end gap-4 mb-6">
                <CustomDatePicker
                    label="Filter by Date"
                    selected={searchDate}
                    onChange={setSearchDate}
                    className="w-full md:w-52"
                />
                <Button
                    className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleSearchByDate}
                >
                    Search
                </Button>
                <Button
                    className="w-full md:w-auto bg-gray-400 text-white hover:bg-gray-500"
                    onClick={handleClear}
                    variant="secondary"
                >
                    Reset
                </Button>
            </div>

            {/* Table */}
            <CommonTable
                title="Work Entries Table"
                columns={columns}
                data={filteredEntries}
            />
        </div>
    );
};

export default WorkEntryTable;