import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import InputField from "../Utils/InputField";

const SignInForm = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        navigate("/menu");
      } else {
        setError(data.message || "Invalid email or password");
        setIsAuthenticated(false);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center w-[350px] justify-center p-6 rounded-lg shadow-md">
      <form
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto p-6 bg-transparent rounded-lg flex flex-col gap-4 w-[350px]"
      >
        <h2 className="text-xl font-semibold text-center text-gray-700">Sign In</h2>

        <InputField
          label="Email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
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
