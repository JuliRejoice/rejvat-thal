import { Search } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface InvoiceFilterProps {
  onFilterChange: (filters: {
    searchQuery: string;
    startDate: Date | null;
    endDate: Date | null;
    preset: string;
  }) => void;
  setSearchQuery: (query: string) => void;
  searchQuery: string;
}

const InvoiceFilter: React.FC<InvoiceFilterProps> = ({
  onFilterChange,
  setSearchQuery,
  searchQuery,
}) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [preset, setPreset] = useState("All");
  const [startDate, endDate] = dateRange;
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const didMount = useRef(false);

  // Debounce effect for searching
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    onFilterChange({ searchQuery: debouncedSearch, startDate, endDate, preset });
  }, [debouncedSearch, startDate, endDate, preset]);

  const handleClear = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setDateRange([null, null]);
    setPreset("All");
    onFilterChange({
      searchQuery: "",
      startDate: null,
      endDate: null,
      preset: "All",
    });
  };

  //  Handle preset changes (Last7Days, LastMonth, etc.)
  const handlePresetChange = (value: string) => {
  const today = new Date();
  let newRange: [Date | null, Date | null] = [null, null];

  if (value === "Last7Days") {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    newRange = [start, end];
  } 
  else if (value === "LastMonth") {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() - 1;
    
    // First day of last month
    const firstDayLastMonth = new Date(year, month, 1);
    
    // Last day of last month (by setting day to 0 of current month)
    const lastDayLastMonth = new Date(year, month + 1, 0);
    
    // Set time to end of day
    lastDayLastMonth.setHours(23, 59, 59, 999);
    
    newRange = [firstDayLastMonth, lastDayLastMonth];
  } 
  else if (value === "All") {
    newRange = [null, null];
  }

  setPreset(value);
  setDateRange(newRange);
};


const handleDateChange = (update: [Date | null, Date | null]) => {
  let [start, end] = update;

  if (start) {
    // Create date in local timezone
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  }
  if (end) {
    // Set to end of day in local timezone
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
  }

  setDateRange([start, end]);
  setPreset("Custom");
};


  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 🔍 Search */}
      <div className="relative flex-1 sm:flex-initial">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full sm:w-64"
        />
      </div>

      {/* ⏱ Preset Dropdown */}
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="Last7Days">Last 7 Days</SelectItem>
          <SelectItem value="LastMonth">Last Month</SelectItem>
        </SelectContent>
      </Select>

      {/* 📅 Date Picker */}
      <div className="relative">
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          isClearable={false}
          placeholderText="Select date range"
          dateFormat="dd/MM/yyyy"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={
            startDate && endDate
              ? `${startDate.toLocaleDateString("en-GB")} - ${endDate.toLocaleDateString("en-GB")}`
              : startDate
              ? startDate.toLocaleDateString("en-GB")
              : ""
          }
        />
      </div>

      {/* 🧼 Clear Button */}
      <button
        onClick={handleClear}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all"
      >
        Clear
      </button>
    </div>
  );
};

export default InvoiceFilter;
