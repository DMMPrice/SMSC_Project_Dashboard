import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";

const WorkEntryForm = ({ toggleModal, fetchEntries, employeeId }) => {
  const [form, setForm] = useState({
    date: "",
    expected_date_of_delivery: "",
    work_status: "",
    tasks: "",
    issue: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ for loading spinner

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API_URL}work/submit`, {
        ...form,
        employee_id: employeeId,
      });

      await fetchEntries(); // ✅ Refresh both entries & filteredEntries

      alert("✅ Work entry submitted");
      toggleModal();
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-blue-700 text-center mb-2">
        Submit Work Entry
      </h2>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Work Entry Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Expected Delivery</label>
        <input
          type="date"
          name="expected_date_of_delivery"
          value={form.expected_date_of_delivery}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Work Status</label>
        <select
          name="work_status"
          value={form.work_status}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md text-sm"
        >
          <option value="">Select status</option>
          <option value="Working">Working</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Tasks</label>
        <textarea
          name="tasks"
          value={form.tasks}
          onChange={handleChange}
          rows={3}
          required
          className="w-full p-2 border rounded-md text-sm"
          placeholder="Describe your tasks"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Issue</label>
        <select
          name="issue"
          value={form.issue}
          onChange={handleChange}
          className="w-full p-2 border rounded-md text-sm"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      <div className="flex justify-between gap-4 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 text-sm text-white font-semibold rounded-md ${
            isSubmitting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          onClick={toggleModal}
          disabled={isSubmitting}
          className="w-full py-2 text-sm text-white font-semibold bg-gray-400 rounded-md hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default WorkEntryForm;
