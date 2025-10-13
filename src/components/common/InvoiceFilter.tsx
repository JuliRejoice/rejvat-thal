import { Search } from "lucide-react";
import React, { useState, useEffect } from "react";
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
}

const InvoiceFilter: React.FC<InvoiceFilterProps> = ({ onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [preset, setPreset] = useState("All");
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    onFilterChange({ searchQuery, startDate, endDate, preset });
  }, [searchQuery, startDate, endDate, preset, onFilterChange]);

  const handleClear = () => {
    setSearchQuery("");
    setDateRange([null, null]);
    setPreset("All");
    onFilterChange({
      searchQuery: "",
      startDate: null,
      endDate: null,
      preset: "All",
    });
  };

  const handlePresetChange = (value: string) => {
    const today = new Date();
    let newRange: [Date | null, Date | null] = [null, null];

    if (value === "Last7Days") {
      const last7 = new Date();
      last7.setDate(today.getDate() - 6);
      newRange = [last7, today];
    } else if (value === "LastMonth") {
      const firstDayLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const lastDayLastMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );
      newRange = [firstDayLastMonth, lastDayLastMonth];
    } else if (value === "All") {
      newRange = [null, null];
    }

    setPreset(value);
    setDateRange(newRange);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 sm:flex-initial">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full sm:w-64"
        />
      </div>

      {/* Preset Dropdown */}
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

      {/* Date Picker */}
      <div className="relative">
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update: [Date | null, Date | null]) => {
            setDateRange(update);
            setPreset("Custom");
          }}
          isClearable={false}
          placeholderText="Select date range"
          dateFormat="dd/MM/yyyy"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={
            startDate && endDate
              ? `${startDate.toLocaleDateString(
                  "en-GB"
                )} - ${endDate.toLocaleDateString("en-GB")}`
              : startDate
              ? startDate.toLocaleDateString("en-GB")
              : ""
          }
        />
      </div>

      {/* Clear Button */}
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
