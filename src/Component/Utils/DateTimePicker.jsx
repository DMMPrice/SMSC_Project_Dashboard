// src/Component/Utils/DateTimePicker.jsx
import React from "react";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function BasicDatePicker({label, value, onChange}) {
    // if they passed a string, turn it into dayjs; if null, pass null
    const parsedValue = value ? dayjs(value) : null;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                label={label}
                value={parsedValue}
                onChange={(newVal) => {
                    // newVal is a Dayjs — hand it back upstream
                    onChange(newVal);
                }}
                slotProps={{
                    textField: {fullWidth: true, size: "small"}
                }}
            />
        </LocalizationProvider>
    );
}