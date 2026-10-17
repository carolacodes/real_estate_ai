import { useEffect, useState } from 'react';
import { getFeaturedProperties } from '../api/properties.api.js';
export default function useFeaturedProperties() {
  const [state, setState] = useState({ properties: [], loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    getFeaturedProperties().then((response) => {
      if (!Array.isArray(response.data)) throw new Error('Invalid featured properties response');
      if (active) setState({ properties: response.data, loading: false, error: null });
    }).catch((error) => {
      if (active) setState({ properties: [], loading: false, error: error.message });
    });
    return () => { active = false; };
  }, [attempt]);
  function retry() {
    setState({ properties: [], loading: true, error: null });
    setAttempt(value => value + 1);
  }
  return { ...state, retry };
}
