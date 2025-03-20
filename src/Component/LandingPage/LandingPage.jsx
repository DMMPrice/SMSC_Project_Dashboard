import React from "react";
import SignInForm from "../SignInForm/SignInForm";
import Logo from "../../assets/logo.svg";

const LandingPage = ({ setIsAuthenticated }) => {
  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden flex-col justify-center items-center">
      {/* Centered Login Form */}
      <div className="bg-white p-10 rounded-lg shadow-lg border w-[450px] text-center">
        <h1 className="text-2xl font-bold mb-4">
          Welcome to SM Service Portal
        </h1>

        {/* Centered Logo */}
        <img src={Logo} alt="SM Logo" className="mb-4 w-32 h-auto mx-auto" />

        {/* Sign-In Form */}
        <SignInForm setIsAuthenticated={setIsAuthenticated} />
      </div>
    </div>
  );
};

export default LandingPage;
