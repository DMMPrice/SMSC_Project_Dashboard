// src/Component/Utils/ResetPasswordForm.jsx
import React, {useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import InputField from "@/Component/Utils/InputField.jsx";
import {API_URL} from "@/config.js";

export default function ResetPasswordForm({setIsAuthenticated}) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("userData");
    const userId = storedUser ? JSON.parse(storedUser).id : null;
    const creds = localStorage.getItem("userCredentials");
    const {password: storedPassword} = creds ? JSON.parse(creds) : {};

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (currentPassword !== storedPassword) {
            setError("Current password is incorrect.");
            return;
        }
        if (!newPassword || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await axios.put(
                `${API_URL}users/${userId}/password`,
                {old_password: currentPassword, new_password: newPassword},
                {headers: {"Content-Type": "application/json"}}
            );

            toast.success("Password reset successful! Logging out…");

            // clear everything, update auth state, then navigate
            setTimeout(() => {
                localStorage.removeItem("userData");
                localStorage.removeItem("userCredentials");
                setIsAuthenticated(false);
                navigate("/signin");
            }, 1200);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                "Could not reset password. Please try again.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return <p className="text-red-500">Please sign in first.</p>;
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-6"
        >
            <h2 className="text-2xl font-semibold">Reset Password</h2>

            <InputField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <InputField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />

            <InputField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
            >
                {loading ? "Resetting…" : "Reset Password"}
            </Button>
        </form>
    );
}