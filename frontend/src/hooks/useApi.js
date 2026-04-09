import { useState, useEffect } from 'react';
import api from '../lib/api';

const API_URL = '/'; // Base URL is handled by the api instance

export function useApi(endpoint) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get(endpoint);
            setData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint]);

    const postData = async (payload) => {
        try {
            const response = await api.post(endpoint, payload);
            await fetchData();
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return { data, loading, error, postData, refresh: fetchData };
}
