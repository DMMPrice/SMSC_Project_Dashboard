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
import EmployeeProfile from "./Component/EmployeeProfile/EmployeeProfile";
import AddEmployeeForm from "./Component/AddEmployeeForm/AddEmployeeForm";
import WorkEntryForm from "./Component/WorkEntryForm/WorkEntryForm";
import WorkEntryTable from "./Component/WorkEntryTable/WorkEntryTable";
import EmployeeListTable from "./Component/EmployeeListTable/EmployeeListTable";
import IndividualWorkEntryTable from "./Component/IndividualworkEntryTable/IndividualworkEntryTable";
import ManualAttendanceTable from "./Component/ManualAttendanceTable/ManualAttendanceTable";
import ComingSoon from "@/Component/Utils/ComingSoon.jsx";


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

                <Route path="/add-employee"
                       element={<PrivateRoute element={<AddEmployeeForm/>} isAuthenticated={isAuthenticated}/>}/>
                <Route path="/menu" element={<PrivateRoute element={<Menu/>} isAuthenticated={isAuthenticated}/>}/>
                <Route path="/menu/:menuKey"
                       element={<PrivateRoute element={<SubMenu/>} isAuthenticated={isAuthenticated}/>}/>
                <Route path="/admin/employees/:employee_id" element={<EmployeeProfile/>}/>

                <Route path="/admin/employees"
                       element={<PrivateRoute element={<EmployeeListTable/>} isAuthenticated={isAuthenticated}/>}/>

                <Route path="/work-entry"
                       element={<PrivateRoute element={<WorkEntryForm/>} isAuthenticated={isAuthenticated}/>}/>
                <Route path="/work-entries"
                       element={<PrivateRoute element={<WorkEntryTable/>} isAuthenticated={isAuthenticated}/>}/>
                <Route path="/work-entry/:employee_id" element={<PrivateRoute element={<IndividualWorkEntryTable/>}
                                                                              isAuthenticated={isAuthenticated}/>}/>
                <Route path="/attendance"
                       element={<PrivateRoute element={<ManualAttendanceTable/>} isAuthenticated={isAuthenticated}/>}/>
                <Route
                    path="/dev"
                    element={<PrivateRoute element={<ComingSoon/>} isAuthenticated={isAuthenticated}/>}
                />

                <Route path="*" element={<Error404/>}/>
            </Routes>

            <Footer/>
        </Router>
    );
}

export default App;
