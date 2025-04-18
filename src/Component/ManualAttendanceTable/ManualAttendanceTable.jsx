import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { API_URL } from "../../config";

const ManualAttendanceTable = () => {
  const [rows, setRows] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState(null); // index to delete
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}attendance/all`)
      .then((res) => {
        const formatted = res.data.map((r) => ({
          ...r,
          date: r.date.split("-").reverse().join("-"),
          date_text: r.date,
          submitted: true,
          showTick: true,
        }));
        setRows(formatted);
      })
      .catch((err) => console.error("Failed to fetch attendance:", err));
  }, []);

  useEffect(() => {
    rows.forEach((row, index) => {
      if (row.employee_id && !row.name && !row.submitted) {
        axios.get(`${API_URL}employees/profile/id/${row.employee_id.trim()}`)
          .then((res) => {
            const updated = [...rows];
            updated[index].name = res.data.full_name;
            if (updated[index].date_text) {
              updated[index].title = `${updated[index].employee_id}-${updated[index].date_text}`;
            }
            setRows(updated);
          })
          .catch(() => {
            const updated = [...rows];
            updated[index].name = "Invalid ID";
            setRows(updated);
          });
      }
    });
  }, [rows]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    if (field === "date") {
      const dateObj = new Date(value);
      updated[index].month = dateObj.toLocaleString("default", { month: "long" });
      updated[index].date_text = format(dateObj, "dd-MM-yyyy");
      if (updated[index].employee_id) {
        updated[index].title = `${updated[index].employee_id}-${updated[index].date_text}`;
      }
    }

    if (updated[index].in_time && updated[index].out_time) {
      const [h1, m1] = updated[index].in_time.split(":");
      const [h2, m2] = updated[index].out_time.split(":");
      const diff = (parseInt(h2) * 60 + parseInt(m2)) - (parseInt(h1) * 60 + parseInt(m1));
      updated[index].working_hours = (diff / 60).toFixed(2);
    }

    setRows(updated);
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        date: "",
        employee_id: "",
        name: "",
        in_time: "",
        out_time: "",
        working_hours: "",
        month: "",
        title: "",
        date_text: "",
        submitted: false,
        showTick: false,
      },
    ]);
  };

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = () => {
    const row = rows[deleteIndex];
    if (row.submitted && row.id) {
      axios.delete(`${API_URL}attendance/delete/${row.id}`)
        .then(() => {
          const updated = [...rows];
          updated.splice(deleteIndex, 1);
          setRows(updated);
          setShowConfirm(false);
          setDeleteIndex(null);
        })
        .catch(() => alert("❌ Failed to delete from server."));
    } else {
      const updated = [...rows];
      updated.splice(deleteIndex, 1);
      setRows(updated);
      setShowConfirm(false);
      setDeleteIndex(null);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      ["Title", "Date", "Month", "Emp ID", "Name", "In", "Out", "Working Hours"],
      ...rows.map((r) =>
        [
          r.title,
          r.date_text,
          r.month,
          r.employee_id,
          r.name,
          r.in_time,
          r.out_time,
          r.working_hours,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "manual_attendance.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitRow = (index) => {
    const row = rows[index];
    const required = ["title", "date", "month", "employee_id", "name", "in_time", "out_time", "working_hours"];
    const missing = required.filter((f) => !row[f]);
    if (missing.length) {
      alert(`❌ Cannot submit. Missing fields:\n${missing.join(", ")}`);
      return;
    }

    axios.post(`${API_URL}attendance/submit`, { rows: [row] })
      .then(() => {
        const updated = [...rows];
        updated[index].submitted = true;
        updated[index].showTick = true;
        setRows(updated);
      })
      .catch(() => alert("❌ Submission failed"));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <button onClick={handleAddRow} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add Row</button>
          <button onClick={handleDownloadCSV} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Download CSV</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow border">
          <thead className="bg-gray-100 text-left">
            <tr>
              {["Title","Date","Month","Emp ID","Name","In","Out","Working Hours","Submit","Delete"].map(col => (
                <th key={col} className="p-2 border">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border p-2">{row.title}</td>
                <td className="border p-2">
                  <input type="date" value={row.date} onChange={(e) => handleChange(i, "date", e.target.value)} className="p-1 border rounded" disabled={row.submitted} />
                </td>
                <td className="border p-2">{row.month}</td>
                <td className="border p-2">
                  <input type="text" value={row.employee_id} onChange={(e) => handleChange(i, "employee_id", e.target.value)} className="p-1 border rounded" disabled={row.submitted} />
                </td>
                <td className="border p-2">{row.name}</td>
                <td className="border p-2">
                  <input type="time" value={row.in_time} onChange={(e) => handleChange(i, "in_time", e.target.value)} className="p-1 border rounded" disabled={row.submitted} />
                </td>
                <td className="border p-2">
                  <input type="time" value={row.out_time} onChange={(e) => handleChange(i, "out_time", e.target.value)} className="p-1 border rounded" disabled={row.submitted} />
                </td>
                <td className="border p-2 text-center">{row.working_hours}</td>
                <td className="border p-2 text-center">
                  {row.submitted ? (
                    <span className="text-green-600 text-xl">✔️</span>
                  ) : (
                    <button onClick={() => handleSubmitRow(i)} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Submit</button>
                  )}
                </td>
                <td className="border p-2 text-center">
                  <svg onClick={() => confirmDelete(i)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-red-500 hover:text-red-600 cursor-pointer">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-.867 12.142A2 2 0 0116.138 20H7.862a2 2 0 01-1.995-1.858L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <p className="text-lg font-semibold mb-4">Are you sure you want to delete this row?</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleDeleteConfirmed} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Yes</button>
              <button onClick={() => setShowConfirm(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualAttendanceTable;
