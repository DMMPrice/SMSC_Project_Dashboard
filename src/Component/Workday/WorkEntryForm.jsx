import React, {useState} from "react";
import axios from "axios";
import {API_URL} from "@/config.js";
import CustomDatePicker from "@/Component/Utils/CustomDatePicker.jsx";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "react-toastify";

const WorkEntryForm = ({toggleModal, fetchEntries}) => {
    const employeeId = JSON.parse(localStorage.getItem("userData"))?.employee_id;

    const [form, setForm] = useState({
        date: null,
        expected_date_of_delivery: null,
        work_status: "",
        tasks: "",
        issue: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post(`${API_URL}work/submit`, {
                ...form,
                date: form.date?.toISOString().split("T")[0],
                expected_date_of_delivery: form.expected_date_of_delivery?.toISOString().split("T")[0],
                employee_id: employeeId,
            });

            await fetchEntries();
            toast.success("Work entry submitted");
            toggleModal();
        } catch (err) {
            toast.error((err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-blue-700 text-center mb-2">Submit Work Entry</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomDatePicker
                    label="Work Entry Date"
                    selected={form.date}
                    onChange={(value) => setForm({...form, date: value})}
                />

                <CustomDatePicker
                    label="Expected Delivery"
                    selected={form.expected_date_of_delivery}
                    onChange={(value) => setForm({...form, expected_date_of_delivery: value})}
                />

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Work Status</label>
                    <CustomSelect
                        value={form.work_status}
                        onChange={(value) => setForm({...form, work_status: value})}
                        options={["Working", "Completed"]}
                        placeholder="Select status"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Issue</label>
                    <CustomSelect
                        value={form.issue}
                        onChange={(value) => setForm({...form, issue: value})}
                        options={["Yes", "No"]}
                        placeholder="Select"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Tasks</label>
                    <Textarea
                        name="tasks"
                        value={form.tasks}
                        onChange={handleChange}
                        rows={3}
                        required
                        className="text-sm"
                        placeholder="Describe your tasks"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`py-2 text-sm text-white font-semibold rounded-md ${
                        isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
                <button
                    type="button"
                    onClick={toggleModal}
                    disabled={isSubmitting}
                    className="py-2 text-sm text-white font-semibold bg-gray-400 rounded-md hover:bg-gray-500"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default WorkEntryForm;