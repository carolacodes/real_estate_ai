import { useEffect, useState } from 'react';
import { getPropertyBySlug } from '../api/properties.api.js';

export default function useProperty(slug) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const requestKey = `${slug}:${attempt}`;
  useEffect(() => {
    let active = true;
    getPropertyBySlug(slug).then(response => {
      if (!response.data || typeof response.data !== 'object' || Array.isArray(response.data)) throw new Error('Invalid property response');
      if (active) setResult({ key: requestKey, property: response.data, error: false, notFound: false });
    }).catch(error => {
      if (active) setResult({ key: requestKey, property: null, error: error.status !== 404, notFound: error.status === 404 });
    });
    return () => { active = false; };
  }, [slug, requestKey]);
  const loading = result?.key !== requestKey;
  return {
    loading,
    property: loading ? null : result.property,
    error: loading ? false : result.error,
    notFound: loading ? false : result.notFound,
    retry: () => setAttempt(value => value + 1),
  };
}
