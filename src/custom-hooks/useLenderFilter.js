import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getLender } from '../api-services/Modules/LenderApi';

// Module-level cache so each page navigation doesn't re-fetch the lender
// list. Stays consistent with the "no live aggregates on GET" rule —
// fetched once per app load and reused across Web/App/All Leads pages.
let cachedLenders = null;
let inFlight = null;

const fetchLendersOnce = () => {
  if (cachedLenders) return Promise.resolve(cachedLenders);
  if (inFlight) return inFlight;
  inFlight = getLender(1, 10000, '')
    .then((response) => {
      const rows = response?.data?.data?.rows || [];
      cachedLenders = rows
        .filter((r) => r?.id && r?.name)
        .map((r) => ({ id: r.id, name: r.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return cachedLenders;
    })
    .catch(() => [])
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
};

const toFilterOptions = (lenders) => [
  { label: 'All Lenders', value: '' },
  ...lenders.map((l) => ({ label: l.name, value: String(l.id) })),
];

// Shared lender filter state + dropdown options for the leads pages.
// Pass `onChange(lenderId)` and it'll fire whenever the user picks a
// lender from the dropdown. Returns:
//   - lender (current selected lender id as string, '' when "All")
//   - filterEntry to splice into `dynamicFilters`
export const useLenderFilter = ({ onChange }) => {
  const [lender, setLender] = useState('');
  const [lenders, setLenders] = useState([]);

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    let active = true;
    fetchLendersOnce().then((opts) => {
      if (active) setLenders(opts);
    });
    return () => { active = false; };
  }, []);

  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const handleLender = useCallback((value) => {
    setLender(value);
    onChangeRef.current?.(value);
  }, []);

  const filterEntry = useMemo(() => ({
    key: 'lender',
    label: 'Lender',
    activeValue: lender,
    options: toFilterOptions(lenders),
    onChange: handleLender,
  }), [lender, lenders, handleLender]);

  return { lender, filterEntry };
};
