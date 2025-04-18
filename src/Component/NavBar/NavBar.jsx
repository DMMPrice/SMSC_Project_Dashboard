import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "@/assets/logo.svg";
import { FaRegFaceSmileBeam } from "react-icons/fa6"; // Smile icon
import "./NavBar.css";

export default function NavBar({ setIsAuthenticated }) {
  const navRef = useRef();
  const navigate = useNavigate();

  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [isAuthenticated, setIsAuth] = useState(localStorage.getItem("isAuthenticated"));

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    if (typeof setIsAuthenticated === "function") {
      setIsAuthenticated(false);
    }
    navigate("/signin");
  };

  useEffect(() => {
    const updateUserInfo = () => {
      setUserName(localStorage.getItem("userName"));
      setIsAuth(localStorage.getItem("isAuthenticated"));
    };

    window.addEventListener("storage", updateUserInfo);
    window.addEventListener("userInfoUpdated", updateUserInfo);

    return () => {
      window.removeEventListener("storage", updateUserInfo);
      window.removeEventListener("userInfoUpdated", updateUserInfo);
    };
  }, []);

  return (
    <nav ref={navRef} className="bg-white w-full top-0 z-50 transition-shadow duration-300">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <a href="/menu" className="flex items-center">
            <img src={Logo} width={100} height={10} alt="Dashboard logo" />
          </a>

          {/* Buttons: Menu, Greeting, and Logout */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && userName && (
              <div className="greeting">
                {/* <FaRegFaceSmileBeam className="text-yellow-500" /> */}
                <span className="text-lg font-semibold text-blue-700">Hi, {userName}!</span>
              </div>
            )}

            <Link
              to="/menu"
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Menu
            </Link>
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-black text-white rounded hover:bg-gray-900 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
