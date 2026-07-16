import { useState, useEffect, useCallback, useRef } from 'react';
export default function useApi(fetcher, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (mounted.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await fetcher();
      if (mounted.current) setData(result);
    } catch (err) {
      if (mounted.current) setError(err.message || 'Something went wrong.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
