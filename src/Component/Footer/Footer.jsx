// src/Component/Utils/Footer.jsx
import React from "react";
import {Link} from "react-router-dom";
import Logo from "@/assets/logo.svg";
import {FaEnvelope, FaPhoneAlt} from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Logo & Tagline */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                        <img src={Logo} alt="Logo" className="w-28 sm:w-32 mx-auto md:mx-0"/>
                        <p className="text-gray-200 leading-snug text-sm">
                            With 10–25 years of experience, our professionals excel in large-scale projects.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center sm:text-left">
                        <h4 className="text-lg font-bold mb-2 uppercase border-b-2 border-white inline-block pb-1">
                            Quick Links
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm">
                            {[
                                {to: "/menu", label: "Dashboard"},
                                {to: "/work-entry", label: "Work Entries"},
                                {to: "/attendance", label: "Attendance"},
                                {to: "/projects/active", label: "Projects"},
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-gray-200 hover:text-white transition-colors duration-200"
                                    >
                                        • {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="text-center sm:text-left">
                        <h4 className="text-lg font-bold mb-2 uppercase border-b-2 border-white inline-block pb-1">
                            Contact Us
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-200">
                            <li className="flex justify-center sm:justify-start items-center gap-1">
                                <FaEnvelope className="text-white"/> contact-us@smscmep.com
                            </li>
                            <li className="flex justify-center sm:justify-start items-center gap-1">
                                <FaPhoneAlt className="text-white"/> +91 79080 00345
                            </li>
                            <li className="text-center sm:text-left">
                                1st Floor, Purbachal Canal South Road, Kolkata: 78
                            </li>
                        </ul>
                    </div>

                    {/* Our Office */}
                    <div className="text-center sm:text-left">
                        <h4 className="text-lg font-bold mb-2 uppercase border-b-2 border-white inline-block pb-1">
                            Our Office
                        </h4>
                        <p className="mt-2 text-gray-200 text-sm leading-snug max-w-xs mx-auto sm:mx-0">
                            We’re located in the heart of Kolkata, ready to support you all week long.
                        </p>
                    </div>
                </div>

                <div className="mt-6 border-t border-white border-opacity-20 pt-4">
                    <div className="text-center text-gray-300 text-xs">
                        &copy; {new Date().getFullYear()}{" "}
                        <Link
                            to="https://www.smscmep.com"
                            className="underline hover:text-white transition-colors duration-200"
                        >
                            SMSC
                        </Link>
                        . All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}