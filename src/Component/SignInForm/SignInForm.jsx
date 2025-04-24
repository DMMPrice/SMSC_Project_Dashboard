import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import InputField from "../Utils/InputField";
import {API_URL} from "@/config.js";

const SignInForm = ({setIsAuthenticated}) => {
    const [email, setEmail] = useState("");         // ✅ using email
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ Save entire response in one object
                localStorage.setItem("userData", JSON.stringify(data));

                setIsAuthenticated(true);
                navigate("/menu");
            } else {
                setError(data.message || "Invalid credentials");
                setIsAuthenticated(false);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center w-[350px] justify-center p-6">
            <form
                onSubmit={handleSubmit}
                className="max-w-sm mx-auto p-6 bg-transparent rounded-lg flex flex-col gap-4 w-[350px]"
            >
                <h2 className="text-xl font-semibold text-center text-gray-700">Sign In</h2>

                <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <InputField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full"
                    disabled={loading}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </Button>
            </form>
        </div>
    );
};

export default SignInForm;
