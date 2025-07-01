import axios from 'axios';

export const apiClient = axios.create({
    baseURL: '/', // Uses Next.js proxy to localhost:5001/api
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customApiClient = async <T>(config: any): Promise<T> => {
    const { data } = await apiClient(config);
    return data as T;
};

export type ErrorType<Error> = Error;