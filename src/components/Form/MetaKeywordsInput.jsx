// 'use client'

// import { useState } from "react";
// import { Controller } from "react-hook-form";

// export const MetaKeywordsInput = ({ control, setValue, name, label, rules, errors, keywords, setKeywords }) => {
//   const [inputValue, setInputValue] = useState('');

//   // Handle changes to the input field
//   const handleChange = (e) => {
//     const value = e.target.value;

//     if (value.endsWith(',')) {
//       const keyword = value.slice(0, -1).trim();

//       if (keyword) {
//         setKeywords((prev) => [...prev, keyword]);
//         setValue(name, [...keywords, keyword].join(', '));
//         setInputValue('');
//       }
//     } else {
//       setInputValue(value);
//     }
//   };

//   // Handle keyword deletion
//   const handleDelete = (keyword) => {
//     const newKeywords = keywords.filter((kw) => kw !== keyword);
//     setKeywords(newKeywords);
//     setValue(name, newKeywords.join(', '));
//   };

//   return (
//     <div className="w-full ">
//       <Controller
//         control={control}
//         name={name}
//         rules={rules}
//         render={({ field }) => (
//           <>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               {label}
//             </label>
//             <input
//               {...field}
//               type="text"
//               placeholder="Keywords separated by commas"
//               className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 
//                 ${errors[name] ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-indigo-400"}`}
//               onChange={handleChange}
//               value={inputValue}
//             />
//             {errors[name] && (
//               <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
//             )}

//             {/* Chips */}
//             <div className="mt-3 flex flex-wrap gap-2">
//               {keywords.map((keyword, index) => (
//                 <span
//                   key={index}
//                   className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 text-sm px-3 py-1"
//                 >
//                   {keyword}
//                   <button
//                     type="button"
//                     onClick={() => handleDelete(keyword)}
//                     className="ml-2 text-indigo-500 hover:text-red-500 focus:outline-none"
//                   >
//                     ✕
//                   </button>
//                 </span>
//               ))}
//             </div>
//           </>
//         )}
//       />
//     </div>
//   );
// };



'use client';

import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';

export const MetaKeywordsInput = ({ control, setValue, name, label, rules, errors, keywords, setKeywords }) => {
  const [inputValue, setInputValue] = useState('');

  // Sync field value with keywords on mount and when keywords change
  useEffect(() => {
    setValue(name, keywords.join(', '), { shouldValidate: true });
  }, [keywords, name, setValue]);

  // Handle changes to the input field
  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.endsWith(',')) {
      const keyword = value.slice(0, -1).trim();
      if (keyword && !keywords.includes(keyword)) {
        const newKeywords = [...keywords, keyword];
        setKeywords(newKeywords);
        setInputValue('');
      }
    }
  };

  // Handle key down to support Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const keyword = inputValue.trim();
      if (keyword && !keywords.includes(keyword)) {
        const newKeywords = [...keywords, keyword];
        setKeywords(newKeywords);
        setInputValue('');
      }
    }
  };

  // Handle keyword deletion
  const handleDelete = (keyword) => {
    const newKeywords = keywords.filter((kw) => kw !== keyword);
    setKeywords(newKeywords);
  };

  return (
    <div className="w-full">
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field }) => (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type="text"
              placeholder="Keywords separated by commas"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 
                ${errors[name] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'}`}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              value={inputValue}
            />
            {errors[name] && (
              <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
            )}

            {/* Chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 text-sm px-3 py-1"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleDelete(keyword)}
                    className="ml-2 text-indigo-500 hover:text-red-500 focus:outline-none"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </>
        )}
      />
    </div>
  );
};