import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const AddEmployeeForm = () => {
  const [form, setForm] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    password: '',
    phone: '',
    work_position: '',
    date_of_birth: '',
    address: '',
    fathers_name: '',
    aadhar_no: '',
    profile_photo: '',
    role: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      return Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };

    setForm((prev) => ({
      ...prev,
      password: generatePassword()
    }));

    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_photo') {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, profile_photo: reader.result.split(',')[1] }));
      };
      if (files[0]) reader.readAsDataURL(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const parts = date.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return date;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        date_of_birth: formatDate(form.date_of_birth)
      };

      const res = await axios.post(`${API_URL}employees/add`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      alert(`✅ Employee added! Password: ${form.password}`);
      localStorage.setItem('employeeId', res.data.employee_id);
      window.location.href = `/admin/employees/${res.data.employee_id}`;

    } catch (err) {
      console.error('❌ Error:', err);
      const msg = err.response?.data?.message || err.message || 'Something went wrong!';
      alert('❌ Error: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      {loading ? (
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl w-full max-w-5xl h-full overflow-hidden p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">Add New Member</h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-2"
          >
            <div>
              <label className="block text-sm font-semibold mb-1">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Auto Password</label>
              <input
                type="text"
                name="password"
                value={form.password}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            {[
              'full_name', 'email', 'phone', 'work_position',
              'date_of_birth', 'address', 'fathers_name', 'aadhar_no'
            ].map((name) => (
              <div key={name}>
                <label className="block text-sm font-semibold mb-1">
                  {name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </label>
                <input
                  type={name === 'date_of_birth' ? 'date' : 'text'}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Role</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Profile Photo</label>
              <input
                type="file"
                name="profile_photo"
                accept="image/*"
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {form.profile_photo && (
              <div className="md:col-span-2 flex justify-center">
                <img
                  src={`data:image/jpeg;base64,${form.profile_photo}`}
                  alt="Preview"
                  className="mt-2 w-24 h-24 object-cover rounded-full"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white py-2 rounded-lg mt-2 ${
                  isSubmitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddEmployeeForm;
