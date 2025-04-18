import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import WorkEntryForm from "../WorkEntryForm/WorkEntryForm";

const IndividualWorkEntryTable = () => {
  const { employee_id } = useParams();
  const idToUse = employee_id || localStorage.getItem("employeeId");

  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}work/all`);
      const userEntries = res.data.filter(
        (entry) => entry.employee_id === idToUse
      );

      setEntries(userEntries);
      setFilteredEntries(userEntries);
    } catch (err) {
      console.error("❌ Failed to fetch work entries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [employee_id]);

  const handleSearchByDate = () => {
    const filtered = entries.filter((entry) =>
      searchDate ? entry.date === searchDate : true
    );
    setFilteredEntries(filtered);
  };

  const handleClear = () => {
    setSearchDate("");
    setFilteredEntries(entries);
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="p-6 relative">
      {/* Spinner Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-white bg-opacity-80">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Page Content */}
      <h2 className="text-xl font-bold mb-4 text-blue-700">My Work Entries</h2>

      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
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
        </div>

        <button
          onClick={toggleModal}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Add New Work Entry
        </button>
      </div>

      {/* Work Entry Table */}
      {!isLoading && (
        <div className="overflow-x-auto animate-fade-slide">
          <table className="min-w-full bg-white border rounded shadow-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
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
                    <td className="p-2 border text-center">{entry.date}</td>
                    <td className="p-2 border text-center">
                      {entry.expected_date_of_delivery || "—"}
                    </td>
                    <td className="p-2 border text-center">{entry.work_status}</td>
                    <td className="p-2 border">{entry.tasks}</td>
                    <td className="p-2 border text-center">{entry.issue || "None"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 p-4">
                    No entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Work Entry Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 animate-fade-slide">
            <WorkEntryForm
              toggleModal={toggleModal}
              fetchEntries={fetchEntries}
              employeeId={idToUse}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualWorkEntryTable;
