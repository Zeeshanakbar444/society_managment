import axios from 'axios';
import { auth } from '../lib/firebase';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Helper to wait for Firebase to initialize if needed
const getAuthToken = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            if (user) {
                user.getIdToken().then(resolve).catch(reject);
            } else {
                resolve(null);
            }
        });
    });
};

// Interceptor to add Firebase ID Token to all requests
api.interceptors.request.use(async (config) => {
    let token = null;
    const user = auth.currentUser;

    if (user) {
        token = await user.getIdToken();
    } else {
        // If currentUser is null, it might still be initializing
        token = await getAuthToken();
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
