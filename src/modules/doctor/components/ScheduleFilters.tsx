import { Filter } from "lucide-react";

interface ScheduleFiltersProps {
  activeFilter: "all" | "upcoming" | "today" | "completed" | "emergency" | "critical";
  onFilterChange: (filter: "all" | "upcoming" | "today" | "completed" | "emergency" | "critical") => void;
}

export default function ScheduleFilters({ activeFilter, onFilterChange }: ScheduleFiltersProps) {
  const filters = [
    { value: "all" as const, label: "All Schedules" },
    { value: "upcoming" as const, label: "Upcoming" },
    { value: "today" as const, label: "Today" },
    { value: "completed" as const, label: "Completed" },
    { value: "emergency" as const, label: "Emergency" },
    { value: "critical" as const, label: "Critical Priority" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 text-gray-600 mr-2">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filter:</span>
      </div>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === filter.value
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
