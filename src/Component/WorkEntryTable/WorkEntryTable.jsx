import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { FaSearch } from "react-icons/fa";

const WorkEntryTable = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  const [searchIdOrName, setSearchIdOrName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole !== "Admin" && userRole !== "Manager") return;

    axios
      .get(`${API_URL}work/all`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setEntries(sorted);
        setFilteredEntries(sorted);
        setLoading(false);
        setTimeout(() => setAnimate(true), 50);
      })
      .catch((err) => {
        console.error("Failed to fetch work entries:", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = () => {
    const keyword = searchIdOrName.toLowerCase().trim();
    const filtered = entries.filter((entry) => {
      const matchNameOrId =
        entry.full_name.toLowerCase().includes(keyword) ||
        entry.employee_id.toString().toLowerCase().includes(keyword);
      return matchNameOrId;
    });
    setFilteredEntries(filtered);
  };

  const handleSearchByDate = () => {
    const date = searchDate.trim();
    const filtered = entries.filter((entry) => {
      return date ? entry.date === date : true;
    });
    setFilteredEntries(filtered);
  };

  const handleClear = () => {
    setSearchIdOrName("");
    setSearchDate("");
    setFilteredEntries(entries);
  };

  // ✅ Download CSV
  const handleDownloadCSV = () => {
    const headers = [
      "Employee ID",
      "Full Name",
      "Date",
      "Expected Delivery",
      "Work Status",
      "Tasks",
      "Issue",
    ];

    const csvRows = filteredEntries.map((entry) =>
      [
        entry.employee_id,
        entry.full_name,
        entry.date,
        entry.expected_date_of_delivery || "—",
        entry.work_status,
        `"${entry.tasks.replace(/"/g, '""')}"`,
        entry.issue || "None",
      ].join(",")
    );

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "work_entries.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  if (userRole !== "Admin" && userRole !== "Manager") {
    return <p className="text-center mt-10 text-red-500">Unauthorized</p>;
  }

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

      {/* 🔍 Search by Full Name or Employee ID */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center border p-0.5 rounded-md w-64">
            <FaSearch className="text-gray-600 mr-3" />
            <input
              type="text"
              placeholder="Search by name or Employee ID"
              value={searchIdOrName}
              onChange={(e) => setSearchIdOrName(e.target.value)}
              className="p-2 border-none w-full outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {/* Search by Date and Download */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="p-2 border rounded-md"
          />
          <button
            onClick={handleSearchByDate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search by Date
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
          >
            Reset
          </button>
          <button
            onClick={handleDownloadCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">Employee ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Work Entry Date</th>
              <th className="p-2 border">Expected Delivery</th>
              <th className="p-2 border">Work Status</th>
              <th className="p-2 border">Tasks</th>
              <th className="p-2 border">Issue</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="p-2 border text-center">{entry.employee_id}</td>
                  <td className="p-2 border">{entry.full_name}</td>
                  <td className="p-2 border text-center">{entry.date}</td>
                  <td className="p-2 border text-center">
                    {entry.expected_date_of_delivery || "—"}
                  </td>
                  <td className="p-2 border text-center">{entry.work_status}</td>
                  <td className="p-2 border">{entry.tasks}</td>
                  <td className="p-2 border text-center">
                    {entry.issue || "None"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 p-4">
                  No entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkEntryTable;
