// ✅ Updated App.jsx
import React, {useEffect, useState} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import "./App.css";
import NavBar from "./Component/NavBar/NavBar";
import Footer from "./Component/Footer/Footer";
import LandingPage from "./Component/LandingPage/LandingPage";
import Error404 from "./Component/Utils/error";
import Menu from "./Component/Menu/Menu";
import SubMenu from "./Component/Menu/SubMenu.jsx"
import EmployeeProfile from "./Component/Employee-Details/EmployeeProfile/EmployeeProfile";
import AddEmployeeForm from "./Component/Employee-Details/AddEmployeeForm/AddEmployeeForm";
import WorkEntryTable from "./Component/Workday/Work-Entry-Employee/WorkEntryTable";
import EmployeeListTable from "./Component/Employee-Details/EmployeeListTable/EmployeeListTable";
import IndividualWorkEntryTable from "./Component/Workday/Work-Entry/Page.jsx";
import ManualAttendanceTable from "./Component/Attendance/ManualAttendanceTable/ManualAttendanceTable";
import ComingSoon from "@/Component/Utils/ComingSoon.jsx";
import {ToastContainer} from "react-toastify";


const PrivateRoute = ({element, isAuthenticated}) => {
    return isAuthenticated ? element : <Navigate to="/signin" replace/>;
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const storedAuth = localStorage.getItem("isAuthenticated");
        return storedAuth ? JSON.parse(storedAuth) : false;
    });

    useEffect(() => {
        localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
    }, [isAuthenticated]);

    return (
        <>
            <Router>
                {isAuthenticated && <NavBar setIsAuthenticated={setIsAuthenticated}/>}

                <Routes>
                    <Route
                        path="/"
                        element={isAuthenticated ? <Navigate to="/menu"/> :
                            <LandingPage setIsAuthenticated={setIsAuthenticated}/>}
                    />
                    <Route
                        path="/signin"
                        element={isAuthenticated ? <Navigate to="/menu"/> :
                            <LandingPage setIsAuthenticated={setIsAuthenticated}/>}
                    />


                    <Route path="/menu" element={<PrivateRoute element={<Menu/>} isAuthenticated={isAuthenticated}/>}/>
                    <Route path="/menu/:menuKey"
                           element={<PrivateRoute element={<SubMenu/>} isAuthenticated={isAuthenticated}/>}/>\

                    {/* Employee Routes */}
                    <Route path="/add-employee"
                           element={<PrivateRoute element={<AddEmployeeForm/>} isAuthenticated={isAuthenticated}/>}/>
                    <Route path="/employees/profile" element={<EmployeeProfile/>} isAuthenticated={isAuthenticated}/>
                    <Route path="/employees/all"
                           element={<PrivateRoute element={<EmployeeListTable/>} isAuthenticated={isAuthenticated}/>}/>

                    {/* Work Day Routes */}

                    <Route path="/work-entries-employee"
                           element={<PrivateRoute element={<WorkEntryTable/>} isAuthenticated={isAuthenticated}/>}/>
                    <Route path="/work-entry/" element={<PrivateRoute element={<IndividualWorkEntryTable/>}
                                                                      isAuthenticated={isAuthenticated}/>}/>

                    {/* Attendance Routes */}

                    <Route path="/attendance"
                           element={<PrivateRoute element={<ManualAttendanceTable/>}
                                                  isAuthenticated={isAuthenticated}/>}/>
                    <Route
                        path="/dev"
                        element={<PrivateRoute element={<ComingSoon/>} isAuthenticated={isAuthenticated}/>}
                    />

                    <Route path="*" element={<Error404/>}/>
                </Routes>

                <Footer/>
            </Router>
            <ToastContainer position="top-right" autoClose={3000}/>
        </>
    );
}

export default App;
