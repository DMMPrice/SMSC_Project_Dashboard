// ✅ Updated App.jsx
import React, { useEffect, useState } from "react";
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
import Dashboard from "./Component/Demand_Dashboard/Dashboard";

import Plants from "./Component/Plants List/main";
import SingleDemand from "./Component/Demand/main";
import Banking from "./Component/Banking/main";
import GenerationPlant from "./Component/GenerationPlant/main";
import Menu from "./Component/Menu/Menu";
import EmployeeProfile from "./Component/EmployeeProfile/EmployeeProfile";
import AddEmployeeForm from "./Component/AddEmployeeForm/AddEmployeeForm";
import WorkEntryForm from "./Component/WorkEntryForm/WorkEntryForm";
import WorkEntryTable from "./Component/WorkEntryTable/WorkEntryTable";
import EmployeeListTable from "./Component/EmployeeListTable/EmployeeListTable";
import IndividualWorkEntryTable from "./Component/IndividualworkEntryTable/IndividualworkEntryTable";
import ManualAttendanceTable from "./Component/ManualAttendanceTable/ManualAttendanceTable";


const PrivateRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/signin" replace />;
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
      {isAuthenticated && <NavBar setIsAuthenticated={setIsAuthenticated} />}

      <Routes>
        <Route path="/" element={<LandingPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signin" element={<LandingPage setIsAuthenticated={setIsAuthenticated} />} />

        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} isAuthenticated={isAuthenticated} />} />
        <Route path="/purchase" element={<PrivateRoute element={<AddEmployeeForm />} isAuthenticated={isAuthenticated} />} />
        <Route path="/block-purchase" element={<PrivateRoute element={<SingleDemand />} isAuthenticated={isAuthenticated} />} />
        <Route path="/menu" element={<PrivateRoute element={<Menu />} isAuthenticated={isAuthenticated} />} />
        <Route path="/plants" element={<PrivateRoute element={<Plants />} isAuthenticated={isAuthenticated} />} />
        <Route path="/banking" element={<PrivateRoute element={<Banking />} isAuthenticated={isAuthenticated} />} />
        <Route path="/generation-plants" element={<PrivateRoute element={<GenerationPlant />} isAuthenticated={isAuthenticated} />} />

        <Route path="/admin/employees/:employee_id" element={<EmployeeProfile />} />

        <Route path="/admin/employees" element={<PrivateRoute element={<EmployeeListTable />} isAuthenticated={isAuthenticated} />} />

        <Route path="/work-entry" element={<PrivateRoute element={<WorkEntryForm />} isAuthenticated={isAuthenticated} />} />
        <Route path="/work-entries" element={<PrivateRoute element={<WorkEntryTable />} isAuthenticated={isAuthenticated} />} />
        <Route path="/work-entry/:employee_id" element={<PrivateRoute element={<IndividualWorkEntryTable />} isAuthenticated={isAuthenticated} />} />
        <Route path="/attendance" element={<PrivateRoute element={<ManualAttendanceTable />} isAuthenticated={isAuthenticated} />} />



        <Route path="*" element={<Error404 />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
