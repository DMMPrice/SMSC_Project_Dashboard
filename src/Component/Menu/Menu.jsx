import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import menuItems from "@/config/menuConfig.jsx"

const Menu = () => {
    const [role, setRole] = useState("Employee");
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData) {
            setRole(userData.role);
        }
    }, []);

    const filteredItems = menuItems.filter((item) =>
        item.allowedRoles.includes(role)
    );

    return (
        <div className="min-h-screen p-6 flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
                {filteredItems.map((item) => (
                    <div
                        key={item.key}
                        onClick={() => navigate(`/menu/${item.key}`)}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-lg shadow hover:shadow-lg cursor-pointer text-center transition-all flex flex-col items-center gap-3"
                    >
                        {item.icon}
                        <div className="text-lg font-medium text-gray-800 dark:text-white">
                            {item.title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Menu;