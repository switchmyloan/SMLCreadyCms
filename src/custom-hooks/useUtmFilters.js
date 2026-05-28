import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getUtmOptions } from '../api-services/Modules/Leads';

// Module-level cache so each page navigation doesn't re-fetch the UTM
// option lists. Stays consistent with the "no live aggregates on GET"
// rule — fetched once per page-load and reused.
let cachedOptions = null;
let inFlight = null;

const fetchOptionsOnce = () => {
  if (cachedOptions) return Promise.resolve(cachedOptions);
  if (inFlight) return inFlight;
  inFlight = getUtmOptions()
    .then((response) => {
      const payload = response?.data?.data || {};
      cachedOptions = {
        sources: Array.isArray(payload.sources) ? payload.sources : [],
        mediums: Array.isArray(payload.mediums) ? payload.mediums : [],
      };
      return cachedOptions;
    })
    .catch(() => ({ sources: [], mediums: [] }))
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
};

const toFilterOptions = (values) => [
  { label: 'All', value: '' },
  ...values.map((v) => ({ label: v, value: v })),
];

// Shared UTM filter state + dropdown options for the leads pages.
// Pass `onChange({ utmSource, utmMedium })` and it'll fire when either
// changes. Returns:
//   - utmSource / utmMedium current values
//   - dynamic-filter entries to splice into `dynamicFilters`
export const useUtmFilters = ({ onChange }) => {
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [options, setOptions] = useState({ sources: [], mediums: [] });

  // Guard against StrictMode double-fire — fetch only once.
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    let active = true;
    fetchOptionsOnce().then((opts) => {
      if (active) setOptions(opts);
    });
    return () => {
      active = false;
    };
  }, []);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleSource = useCallback((value) => {
    setUtmSource(value);
    onChangeRef.current?.({ utmSource: value, utmMedium });
  }, [utmMedium]);

  const handleMedium = useCallback((value) => {
    setUtmMedium(value);
    onChangeRef.current?.({ utmSource, utmMedium: value });
  }, [utmSource]);

  const filterEntries = useMemo(
    () => [
      {
        key: 'utmSource',
        label: 'UTM Source',
        activeValue: utmSource,
        options: toFilterOptions(options.sources),
        onChange: handleSource,
      },
      {
        key: 'utmMedium',
        label: 'UTM Medium',
        activeValue: utmMedium,
        options: toFilterOptions(options.mediums),
        onChange: handleMedium,
      },
    ],
    [utmSource, utmMedium, options, handleSource, handleMedium]
  );

  return { utmSource, utmMedium, filterEntries };
};
