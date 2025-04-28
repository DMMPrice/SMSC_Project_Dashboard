// src/Config/menuConfig.jsx
import {
    MdManageSearch,
    MdWork,
    MdOutlineSpellcheck,
    MdPresentToAll,
    MdFormatListBulletedAdd,
    MdOutlineViewAgenda,
    MdIncompleteCircle,
} from "react-icons/md";
import {
    FaUserPlus,
} from "react-icons/fa";
import {CgProfile} from "react-icons/cg";
import {IoPeopleSharp} from "react-icons/io5";
import {BsTextParagraph} from "react-icons/bs";
import {GoGraph} from "react-icons/go";
import {VscGraph} from "react-icons/vsc";

const menuItems = [
    {
        key: "employee-details",
        title: "Employee Details",
        icon: <MdManageSearch className="h-10 w-10 text-blue-600"/>,
        allowedRoles: ["Admin", "Manager", "Employee", "Super Admin", "Attendance Team"],
        submenu: [
            {
                title: "View Profile",
                path: `/employees/profile`,
                icon: <CgProfile className="h-6 w-6 text-blue-600"/>,
                allowedRoles: ["Admin", "Manager", "Employee", "Super Admin", "Attendance Team"],
            },
            {
                title: "All Employees",
                path: "/employees/all",
                icon: <IoPeopleSharp className="h-6 w-6 text-blue-600"/>,
                allowedRoles: ["Admin", "Manager", "Super Admin", "Attendance Team"],
            },
            {
                title: "Add New Member",
                path: "/add-employee",
                icon: <FaUserPlus className="h-6 w-6 text-yellow-600"/>,
                allowedRoles: ["Admin", "Manager", "Super Admin"],
            },
        ],
    },
    {
        key: "work-day-entries",
        title: "Work Day Entries",
        icon: <MdWork className="h-10 w-10 text-indigo-600"/>,
        allowedRoles: ["Admin", "Manager", "Employee", "Super Admin", "Attendance Team"],
        submenu: [
            {
                title: "Submit Entry",
                path: `/work-entry`,
                icon: <MdFormatListBulletedAdd className="h-6 w-6 text-indigo-600"/>,
                allowedRoles: ["Admin", "Manager", "Employee", "Super Admin", "Attendance Team"],
            },
            {
                title: "View All Entries",
                path: "/work-entries-employee",
                icon: <MdOutlineViewAgenda className="h-6 w-6 text-indigo-600"/>,
                allowedRoles: ["Admin", "Manager", "Super Admin"],
            },
        ],
    },
    {
        key: "attendance",
        title: "Attendance",
        icon: <MdOutlineSpellcheck className="h-10 w-10 text-green-600"/>,
        allowedRoles: ["Admin", "Attendance Team", "Manager", "Super Admin", "Employee"],
        submenu: [
            {
                title: "View All Entries",
                path: "/attendance",
                icon: <MdPresentToAll className="h-6 w-6 text-green-600"/>,
                allowedRoles: ["Admin", "Attendance Team", "Manager", "Super Admin", "Employee"],
            },
            {
                title: "Add Entry",
                path: '/dev',
                icon: <MdFormatListBulletedAdd className="h-6 w-6 text-green-600"/>,
                allowedRoles: ["Admin", "Attendance Team", "Manager", "Super Admin"],
            }
        ],
    },
    {
        key: "project-status",
        title: "Project Section",
        icon: <VscGraph className="h-10 w-10 text-red-600"/>,
        allowedRoles: ["Super Admin", "Admin", "Employee", "Attendance Team", "Manager"],
        submenu: [
            {
                title: "View Active Projects",
                path: "/projects/active",
                icon: <BsTextParagraph className="h-6 w-6 text-red-600"/>,
                allowedRoles: ["Super Admin", "Admin", "Employee", "Attendance Team", "Manager"],
            },
            {
                title: "Archive Projects",
                path: "/projects/archive",
                icon: <GoGraph className="h-6 w-6 text-red-600"/>,
                allowedRoles: ["Super Admin", "Admin", "Employee", "Attendance Team", "Manager"],
            },
            {
                title: "Billing Status",
                path: "/dev",
                icon: <MdIncompleteCircle className="h-6 w-6 text-red-600"/>,
                allowedRoles: ["Super Admin"],
            },
        ],
    },
];

export default menuItems;