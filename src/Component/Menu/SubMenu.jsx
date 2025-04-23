import React from "react";
import {useNavigate, useParams} from "react-router-dom";
import menuItems from "@/config/menuConfig.jsx";

const SubMenu = () => {
    const navigate = useNavigate();
    const {menuKey} = useParams();
    const userRole = JSON.parse(localStorage.getItem("userData"))?.role || "guest";

    const menu = menuItems.find((item) => item.key === menuKey);
    const subItems = menu?.submenu?.filter((sub) =>
        sub.allowedRoles ? sub.allowedRoles.includes(userRole) : true
    ) || [];

    return (
        <div className="min-h-screen p-6 flex flex-col items-center">
            <button
                onClick={() => navigate("/menu")}
                className="self-start mb-6 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
            >
                ← Back to Menu
            </button>

            {!subItems.length ? (
                <div className="text-center text-red-500 text-lg font-medium mt-12">
                    You do not have permission to view this section.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
                    {subItems.map((item) => (
                        <div
                            key={item.title}
                            onClick={() => navigate(item.path)}
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-5 rounded-lg shadow hover:shadow-lg cursor-pointer text-center font-medium text-gray-800 dark:text-white transition-all flex flex-col items-center justify-center gap-2"
                        >
                            <div className="text-3xl text-blue-800 dark:text-blue-800">{item.icon}</div>
                            <div>{item.title}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubMenu;