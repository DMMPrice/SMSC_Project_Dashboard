import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdManageSearch,
  MdIncompleteCircle,
  MdWork,
  MdOutlineViewAgenda,
  MdFormatListBulletedAdd,
} from "react-icons/md";
import { FaUserPlus, FaUserEdit } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoPeopleSharp } from "react-icons/io5";
import { BsTextParagraph } from "react-icons/bs";
import { GoGraph } from "react-icons/go";
import { VscGraph } from "react-icons/vsc";
import { MdPresentToAll } from "react-icons/md";
import { MdOutlineSpellcheck } from "react-icons/md";

const Menu = () => {
  const [role, setRole] = useState("Employee");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [openMenus, setOpenMenus] = useState({});
  const menuRef = useRef(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedUserId = localStorage.getItem("userId");
    const storedName = localStorage.getItem("userName");

    if (storedRole) setRole(storedRole);
    if (storedUserId) setUserId(storedUserId);
    if (storedName) setUserName(storedName.split(" ")[0]);
  }, []);

  const menuItems = [
    {
      title: "Employee Details",
      icon: <MdManageSearch className="h-10 w-10 text-blue-600" />,
      allowedRoles: ["Admin", "Manager", "Employee"],
      submenu: [
        {
          title: "View Profile",
          path: `/admin/employees/${localStorage.getItem("employeeId")}`,
          icon: <CgProfile className="h-6 w-6 text-blue-600" />,
        },
        ...(role === "Admin" || role === "Manager"
          ? [
              {
                title: "All Employees",
                path: "/admin/employees",
                icon: <IoPeopleSharp className="h-6 w-6 text-blue-600" />,
              },
            ]
          : []),
      ],
    },
    {
      title: "Create Member",
      icon: <FaUserEdit className="h-10 w-10 text-yellow-600" />,
      allowedRoles: ["Admin", "Manager"],
      submenu: [
        {
          title: "Add New Member",
          path: "/purchase",
          icon: <FaUserPlus className="h-6 w-6 text-yellow-600" />,
        },
      ],
    },
    
    {
      title: "Work Day Entries",
      icon: <MdWork className="h-10 w-10 text-indigo-600" />,
      allowedRoles: ["Admin", "Manager", "Employee"],
      submenu: [
        
        {
          title: "Submit Entry",
          path: `/work-entry/${localStorage.getItem("employeeId")}`,
          icon: <MdFormatListBulletedAdd className="h-6 w-6 text-indigo-600" />,
        },
        ...(role === "Admin" || role === "Manager"
          ? [
              {
                title: "View All Entries",
                path: "/work-entries",
                icon: <MdOutlineViewAgenda className="h-6 w-6 text-indigo-600" />,
              },
             
            ]
          : []),
      ],
    },


    {
      title: "Attendance",
      icon: <MdOutlineSpellcheck className="h-10 w-10 text-green-600" />,
      allowedRoles: ["Admin", "Manager", "Employee"],
      submenu: [
        
        
        ...(role === "Admin" || role === "Manager"
          ? [
              {
                title: "Fill Attendance",
                path: "/attendance",
                icon: <MdPresentToAll className="h-6 w-6 text-green-600" />,
              },
            ]
          : []),
      ],
    },

    {
      title: "Project Status",
      icon: <VscGraph className="h-10 w-10 text-red-600" />,
      allowedRoles: ["Admin", "Manager", "Employee"],
      submenu: [
        {
          title: "View All Projects",
          path: "/plants",
          icon: <BsTextParagraph className="h-6 w-6 text-red-600" />,
        },
        {
          title: "Ongoing Projects",
          path: "/banking",
          icon: <GoGraph className="h-6 w-6 text-red-600" />,
        },
        {
          title: "Completed Projects",
          path: "/generation-plants",
          icon: <MdIncompleteCircle className="h-6 w-6 text-red-600" />,
        },
      ],
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(role)
  );

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenus({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col items-center px-4 py-10 bg-transparent">
      {/* Removed Greeting */}

      {/* Menu Grid */}
      <div className="w-full flex justify-center" ref={menuRef}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredMenuItems.map((item, index) => (
            <div key={index} className="relative w-full max-w-[260px]">
              <div
                onClick={() => toggleMenu(index)}
                className="flex flex-col items-center bg-white p-6 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                {item.icon}
                <p className="mt-2 text-lg font-semibold text-gray-800 text-center flex items-center">
                  {item.title}
                  {openMenus[index] ? (
                    <MdKeyboardArrowUp className="ml-1" />
                  ) : (
                    <MdKeyboardArrowDown className="ml-1" />
                  )}
                </p>
              </div>

              {item.submenu && openMenus[index] && (
                <div
                  className="absolute left-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-full min-w-[180px] p-2 space-y-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.submenu.map((subItem, subIndex) => (
                    <Link key={subIndex} to={subItem.path} className="block">
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all">
                        {subItem.icon}
                        <p className="text-md font-medium text-gray-700">
                          {subItem.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;
