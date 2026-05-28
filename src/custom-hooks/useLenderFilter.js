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
      const payload = response?.data?.data;
      // /lender admin endpoint historically returns either { rows: [...] }
      // (paginated shape) or a bare array. Handle both so the dropdown
      // doesn't silently come up empty.
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.rows)
          ? payload.rows
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
      cachedLenders = rows
        .filter((r) => r?.id && r?.name)
        .map((r) => ({ id: r.id, name: r.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return cachedLenders;
    })
    .catch((err) => {
      console.error('useLenderFilter: failed to load lenders', err);
      return [];
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
};

const toFilterOptions = (lenders) =>
  lenders.map((l) => ({ label: l.name, value: String(l.id) }));

// Shared lender filter state + dropdown options for the leads pages.
// Pass `onChange(lenderId)` and it'll fire whenever the user picks a
// lender from the dropdown. Returns:
//   - lender (current selected lender id as string, '' when "All")
//   - filterEntry to splice into `dynamicFilters`
export const useLenderFilter = ({ onChange }) => {
  // Seed from module cache so navigating back to a leads page paints
  // the dropdown immediately instead of waiting for the fetch.
  const [lender, setLender] = useState('');
  const [lenders, setLenders] = useState(() => cachedLenders || []);

  // No `fetchedRef` guard: the module-level cache + inFlight promise
  // already de-dupes the network call, and StrictMode's double-mount
  // would otherwise leave the second mount unable to populate state
  // (the first closure's `cancelled` flag gets flipped on its cleanup
  // before the promise resolves).
  useEffect(() => {
    let cancelled = false;
    fetchLendersOnce().then((opts) => {
      if (!cancelled) setLenders(opts);
    });
    return () => { cancelled = true; };
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
