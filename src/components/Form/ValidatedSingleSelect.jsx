import React, { useState } from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";

const ValidatedSingleSelect = ({
  name,
  control,
  rules,
  label,
  options = [],
  errors,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const isError = !!errors[name];

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Select
            {...field}
            isClearable
            isLoading={isLoading}
            options={options}
            placeholder="Select option..."
            inputValue={searchQuery}
            onInputChange={(newValue, action) => {
              if (action.action === "input-change") {
                setSearchQuery(newValue);
              }
            }}
            value={options.find((opt) => opt.value === field.value) || null}
            onChange={(selected) => field.onChange(selected ? selected.value : null)}
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "38px",
                borderRadius: "0.5rem",
                borderColor: isError
                  ? "rgb(239 68 68)" // red
                  : state.isFocused
                  ? "rgb(59 130 246)" // blue
                  : "rgb(209 213 219)", // gray
                boxShadow: "none",
                "&:hover": {
                  borderColor: isError
                    ? "rgb(239 68 68)"
                    : "rgb(59 130 246)",
                },
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? "rgb(229 231 235)"
                  : state.isFocused
                  ? "rgb(243 244 246)"
                  : "transparent",
                color: "#111827",
                cursor: "pointer",
              }),
            }}
          />
        )}
      />

      {isError && (
        <p className="mt-1 text-xs text-red-500">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

export default ValidatedSingleSelect;
