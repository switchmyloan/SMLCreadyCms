const defaultPeriods = [
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_quarter', label: 'This Quarter' },
  { id: 'ytd', label: 'Year to Date' },
];

const PeriodSelector = ({ activePeriod, onChange, periods = defaultPeriods }) => {
  return (
    <div className="inline-flex bg-gray-100 p-1 rounded-lg">
      {periods.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            activePeriod === p.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;
