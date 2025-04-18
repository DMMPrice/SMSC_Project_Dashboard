import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeeProfile.css';
import { useParams } from 'react-router-dom';

const EmployeeProfile = () => {
  const { employee_id } = useParams();
  const role = localStorage.getItem("userRole");

  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flip, setFlip] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isAdminOrManager = role === 'Admin' || role === 'Manager';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/employees/profile/id/${employee_id}`);
        const data = res.data;
        setEmployee(data);
        setForm(data);
        setTimeout(() => setLoaded(true), 300);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employee_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:5000/employees/update/by-code/${form.employee_id}`, form);
      alert("Profile updated!");
      setEditMode(false);
      setEmployee(form);

      // ✅ Update localStorage and notify NavBar
      localStorage.setItem("userName", form.full_name);
      window.dispatchEvent(new Event("userInfoUpdated"));

    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setForm(prev => ({ ...prev, profile_photo: base64 }));
      setEmployee(prev => ({ ...prev, profile_photo: base64 }));
    };
    if (file) reader.readAsDataURL(file);
  };

  if (loading || !form || !employee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-4 border border-gray-200 animate-fade-in overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold text-center text-blue-700 mb-4">Profile</h2>

        {(employee.profile_photo && (
          <div className="flex justify-center mb-4">
            <div
              className={`flip360-container ${loaded ? 'loaded' : ''} ${flip ? 'flip' : ''}`}
              onClick={() => setFlip(!flip)}
            >
              <img
                src={`data:image/jpeg;base64,${employee.profile_photo}`}
                alt="Profile"
                className="w-28 h-28 rounded-full border-2 border-blue-500 shadow-md object-cover"
              />
            </div>
          </div>
        ))}

        <div className="profile-view-container text-gray-800 flex flex-col h-full">
          <div className="profile-content-grid">
            <div className="profile-column">
              <p><strong>Name:</strong> {employee.full_name}</p>
              <p><strong>Employee ID:</strong> {employee.employee_id}</p>
              <p><strong>Position:</strong> {employee.work_position}</p>
              <p><strong>DOB:</strong> {new Date(employee.date_of_birth).toLocaleDateString()}</p>
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Address:</strong> {employee.address}</p>
            </div>
            <div className="profile-divider" />
            <div className="profile-column">
              <p><strong>Father's Name:</strong> {employee.fathers_name}</p>
              <p><strong>Aadhar No.:</strong> {employee.aadhar_no}</p>
              <p><strong>Phone:</strong> {employee.phone}</p>
              {isAdminOrManager && <p><strong>Role:</strong> {employee.role}</p>}
              <p><strong>Password:</strong> {employee.password}</p>
            </div>
          </div>
          <div className="edit-button-container text-center mt-4">
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            >Edit Profile</button>
          </div>
        </div>
      </div>

      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl animate-fade-in">
            <h3 className="text-lg font-semibold text-center mb-4 text-blue-700">Edit Profile</h3>
            <form
              onSubmit={handleSubmit}
              className={`${isAdminOrManager ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-3'}`}
            >
              {[ 'full_name', 'email', 'phone', 'date_of_birth', 'address' ].map((name) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700">{name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
                  <input
                    type={name === 'date_of_birth' ? 'date' : 'text'}
                    name={name}
                    value={form[name] || ''}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md mt-1 text-sm"
                    required
                  />
                </div>
              ))}

              {isAdminOrManager && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                    <input
                      type="text"
                      name="fathers_name"
                      value={form.fathers_name || ''}
                      onChange={(e) => setForm({ ...form, fathers_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
                    <input
                      type="text"
                      name="aadhar_no"
                      value={form.aadhar_no || ''}
                      onChange={(e) => setForm({ ...form, aadhar_no: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Work Position</label>
                    <input
                      type="text"
                      name="work_position"
                      value={form.work_position || ''}
                      onChange={(e) => setForm({ ...form, work_position: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md mt-1 text-sm"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </div>
                </>
              )}

              <div className={`${isAdminOrManager ? 'col-span-2' : ''}`}>
                <label className="block mb-1 font-medium text-gray-600">Update Profile Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>

              <div className={`${isAdminOrManager ? 'col-span-2' : ''} flex justify-end gap-3 mt-4`}>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                <button type="button" onClick={() => setEditMode(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
