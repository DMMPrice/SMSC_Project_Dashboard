import React from "react";
import CustomDatePicker from "@/Component/Utils/CustomDatePicker.jsx";
import {Button} from "@/components/ui/button";

const WorkEntryFilter = ({
                             searchDate,
                             setSearchDate,
                             onSearch,
                             onClear,
                             onAddNew
                         }) => {
    return (
        <div className="flex flex-wrap md:flex-nowrap items-end gap-4 mb-6 w-full">
            <CustomDatePicker
                label="Search by Date"
                selected={searchDate}
                onChange={setSearchDate}
                className="w-full md:w-52"
            />

            <Button
                onClick={onSearch}
                className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700"
            >
                Search
            </Button>

            <Button
                onClick={onClear}
                className="w-full md:w-auto bg-gray-400 text-white hover:bg-gray-500"
                variant="secondary"
            >
                Reset
            </Button>

            <Button
                onClick={onAddNew}
                className="w-full md:w-auto bg-green-600 text-white hover:bg-green-700"
            >
                Add New Work Entry
            </Button>
        </div>
    );
};

export default WorkEntryFilter;