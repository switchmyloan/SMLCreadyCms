import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

const DebouncedInput = ({
  value: initialValue,
  onChange,
  onSearch,
  debounce = 500, // Reduced for better feel
  placeholder = "Search...",
}) => {
  const [value, setValue] = useState(initialValue);
  const isFirstRender = useRef(true);

  // 1. Only sync from parent if the value is externally changed (like a reset)
  useEffect(() => {
    if (initialValue !== value) {
      setValue(initialValue);
    }
  }, [initialValue]);

  // 2. Debounce logic: Only call onChange/onSearch
  useEffect(() => {
    // Skip the very first render to prevent immediate API/Filter calls
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      // Only trigger if the value is different from what the parent has
      onChange(value); 
      if (onSearch) onSearch(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce]); // Removed onChange/onSearch from dependencies to stop loops

  return (
    <div className="relative flex items-center w-full sm:w-64">
      <input
        type="text"
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-gray-300 px-5 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
      />
      <div className="absolute right-3 text-gray-400">
        <Search size={18} />
      </div>
    </div>
  );
};

export default DebouncedInput;