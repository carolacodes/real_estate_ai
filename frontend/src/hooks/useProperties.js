import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProperties, searchProperties } from '../api/properties.api.js';
import { readPropertyQuery } from '../utils/propertyQuery.js';

export default function useProperties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = readPropertyQuery(searchParams);
  const paramsKey = JSON.stringify({ ...query.filters, page: query.page, limit: query.limit, sort: query.sort });
  const hasFilters = Object.keys(query.filters).length > 0;
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${paramsKey}:${attempt}`;
  const [result, setResult] = useState(null);
  useEffect(() => {
    let active = true;
    const params = JSON.parse(paramsKey);
    const load = hasFilters ? searchProperties : getProperties;
    load(params).then(response => {
      const pagination = response.pagination;
      if (!Array.isArray(response.data) || !pagination || !Number.isSafeInteger(pagination.total) || !Number.isSafeInteger(pagination.totalPages) || !Number.isSafeInteger(pagination.page) || !Number.isSafeInteger(pagination.limit) || pagination.total < 0 || pagination.totalPages < 0 || pagination.page < 1 || pagination.limit < 1) throw new Error('Invalid properties response');
      if (active) setResult({ key: requestKey, properties: response.data, pagination, error: false });
    }).catch(() => {
      if (active) setResult({ key: requestKey, properties: [], pagination: null, error: true });
    });
    return () => { active = false; };
  }, [paramsKey, hasFilters, requestKey]);

  function changeFilters(updates) {
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      for (const [name, value] of Object.entries(updates)) {
        if (value === '' || value == null) next.delete(name);
        else next.set(name, String(value));
      }
      next.set('page', '1');
      return next;
    });
  }
  function changePage(page) {
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      next.set('page', String(page));
      return next;
    });
  }
  const loading = result?.key !== requestKey;
  return {
    ...query, hasFilters, loading,
    properties: loading ? [] : result.properties,
    pagination: loading ? null : result.pagination,
    error: loading ? false : result.error,
    changeFilters, changePage,
    clearFilters: () => setSearchParams({}),
    retry: () => setAttempt(value => value + 1),
  };
}
