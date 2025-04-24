import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "@/assets/logo.svg";
import CommonModal from "@/Component/Utils/CommonModal"; // ✅ Import the modal

export default function NavBar({ setIsAuthenticated }) {
    const navRef = useRef();
    const navigate = useNavigate();

    const [userFullName, setUserFullName] = useState("");
    const [isAuthenticated, setIsAuth] = useState(localStorage.getItem("isAuthenticated"));
    const [showLogoutModal, setShowLogoutModal] = useState(false); // ✅ State for modal

    const confirmLogout = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userData");
        localStorage.removeItem("employeeId");
        if (typeof setIsAuthenticated === "function") {
            setIsAuthenticated(false);
        }
        navigate("/signin");
    };

    useEffect(() => {
        const updateUserInfo = () => {
            const userData = JSON.parse(localStorage.getItem("userData"));
            setUserFullName(userData?.full_name || "");
            setIsAuth(localStorage.getItem("isAuthenticated"));
        };

        updateUserInfo(); // run initially

        window.addEventListener("storage", updateUserInfo);
        window.addEventListener("userInfoUpdated", updateUserInfo);

        return () => {
            window.removeEventListener("storage", updateUserInfo);
            window.removeEventListener("userInfoUpdated", updateUserInfo);
        };
    }, []);

    return (
        <>
            <nav ref={navRef} className="bg-white w-full top-0 z-50 transition-shadow duration-300">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="flex justify-between items-center py-2">
                        {/* Logo */}
                        <a href="/menu" className="flex items-center">
                            <img src={Logo} width={100} height={10} alt="Dashboard logo" />
                        </a>

                        {/* Buttons: Menu, Greeting, and Logout */}
                        <div className="flex items-center space-x-4">
                            {isAuthenticated && userFullName && (
                                <div className="greeting">
                  <span className="text-lg font-semibold text-blue-700">
                    Hi, {userFullName.split(" ")[0]}!
                  </span>
                                </div>
                            )}

                            <Link
                                to="/menu"
                                className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Menu
                            </Link>
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="py-2 px-4 bg-black text-white rounded hover:bg-gray-900 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ✅ Logout Confirmation Modal */}
            <CommonModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                confirmText="Logout"
                cancelText="Cancel"
            />
        </>
    );
}