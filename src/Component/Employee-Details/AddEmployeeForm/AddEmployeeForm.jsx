import React, {useState, useEffect} from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {API_URL} from '@/config.js';
import {toast} from 'react-toastify';
import CustomSelect from '@/Component/Utils/CustomSelect.jsx';
import BasicDatePicker from '@/Component/Utils/DateTimePicker.jsx';
import CommonModal from '@/Component/Utils/CommonModal.jsx';

export default function AddEmployeeForm() {
    const [form, setForm] = useState({
        employee_id: '',
        full_name: '',
        email: '',
        password: '',
        phone: '',
        work_position: '',
        date_of_birth: null,  // holds Dayjs or null
        address: '',
        fathers_name: '',
        aadhar_no: '',
        profile_photo: '',
        role: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showCredModal, setShowCredModal] = useState(false);
    const [newCredentials, setNewCredentials] = useState({employee_id: '', password: ''});
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => setModalConfig(c => ({...c, isOpen: false}))
    });

    const roleOptions = ['Manager', 'Admin', 'Employee', 'Attendance Team'];
    const positionOptions = ['Manager', 'Employee', 'Director'];

    useEffect(() => {
        const generatePassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            return Array.from({length: 8}, () =>
                chars.charAt(Math.floor(Math.random() * chars.length))
            ).join('');
        };
        setForm(f => ({...f, password: generatePassword()}));
        const timer = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = e => {
        const {name, value, files} = e.target;
        if (name === 'profile_photo') {
            const reader = new FileReader();
            reader.onload = () => {
                setForm(f => ({...f, profile_photo: reader.result.split(',')[1]}));
            };
            if (files[0]) reader.readAsDataURL(files[0]);
        } else {
            setForm(f => ({...f, [name]: value}));
        }
    };

    const validateForm = () => {
        const required = [
            'employee_id',
            'full_name',
            'email',
            'phone',
            'work_position',
            'date_of_birth',
            'address',
            'fathers_name',
            'aadhar_no',
            'role'
        ];
        for (let field of required) {
            if (!form[field] || (field === 'date_of_birth' && form.date_of_birth === null)) {
                setModalConfig({
                    isOpen: true,
                    title: 'Validation Error',
                    message: 'Please fill all required fields.',
                    onConfirm: () => setModalConfig(c => ({...c, isOpen: false}))
                });
                return false;
            }
        }
        if (!/^\d{10}$/.test(form.phone)) {
            setModalConfig({
                isOpen: true,
                title: 'Invalid Phone',
                message: 'Phone number must be exactly 10 digits.',
                onConfirm: () => setModalConfig(c => ({...c, isOpen: false}))
            });
            return false;
        }
        if (!/^\d{12}$/.test(form.aadhar_no)) {
            setModalConfig({
                isOpen: true,
                title: 'Invalid Aadhar',
                message: 'Aadhar number must be exactly 12 digits.',
                onConfirm: () => setModalConfig(c => ({...c, isOpen: false}))
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                // ← changed to YYYY-MM-DD
                date_of_birth: form.date_of_birth.format('YYYY-MM-DD')
            };
            const res = await axios.post(`${API_URL}/users/`, payload, {
                headers: {'Content-Type': 'application/json'}
            });
            toast.success('Employee added successfully!');
            setNewCredentials({employee_id: res.data.employee_id, password: form.password});
            setShowCredModal(true);
        } catch (err) {
            console.error('Error adding employee:', err);
            const msg = err.response?.data?.message || err.message;
            toast.error(`Error: ${msg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setShowCredModal(false);
        localStorage.setItem('employeeId', newCredentials.employee_id);
        window.location.href = `/admin/employees/${newCredentials.employee_id}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
            <div className="bg-white shadow-xl rounded-xl w-full max-w-5xl p-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
                    Add New Member
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-2"
                >
                    {/* Employee ID */}
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

                    {/* Auto Password */}
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

                    {/* Other fields */}
                    {['full_name', 'email', 'phone', 'address', 'fathers_name', 'aadhar_no'].map(field => (
                        <div key={field}>
                            <label className="block text-sm font-semibold mb-1">
                                {field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </label>
                            <input
                                type="text"
                                name={field}
                                value={form[field]}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    ))}

                    {/* Date of Birth */}
                    <div className="h-14">
                        <label className="block text-sm font-semibold mb-1">Date of Birth</label>
                        <BasicDatePicker
                            label="YYYY-MM-DD"
                            value={form.date_of_birth}
                            onChange={val => setForm(f => ({...f, date_of_birth: val}))}
                        />
                    </div>

                    {/* Work Position */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Work Position</label>
                        <CustomSelect
                            options={positionOptions}
                            value={form.work_position}
                            onChange={val => setForm(f => ({...f, work_position: val}))}
                            placeholder="Select Position"
                            className="mt-1"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Role</label>
                        <CustomSelect
                            options={roleOptions}
                            value={form.role}
                            onChange={val => setForm(f => ({...f, role: val}))}
                            placeholder="Select Role"
                            className="mt-1"
                        />
                    </div>

                    {/* Profile Photo */}
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

                    {/* Photo Preview */}
                    {form.profile_photo && (
                        <div className="md:col-span-2 flex justify-center">
                            <img
                                src={`data:image/jpeg;base64,${form.profile_photo}`}
                                alt="Preview"
                                className="mt-2 w-24 h-24 object-cover rounded-full"
                            />
                        </div>
                    )}

                    {/* Submit */}
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

            {/* Credential Confirmation Modal */}
            <CommonModal
                isOpen={showCredModal}
                title="Account Created"
                message={`Login ID: ${newCredentials.employee_id}\nPassword: ${newCredentials.password}`}
                onClose={handleModalClose}
                onConfirm={handleModalClose}
                confirmText="OK"
                cancelText="Cancel"
            />

            {/* Validation/Error Modal */}
            <CommonModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onClose={modalConfig.onConfirm}
                onConfirm={modalConfig.onConfirm}
                confirmText="OK"
                cancelText="Cancel"
            />
        </div>
    );
}