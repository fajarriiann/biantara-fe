const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';
const API_BASE_URL = `${BASE_URL}/api`;
const STORAGE_URL = `${BASE_URL}/storage/products/`;

const api = {
    async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    },

    async post(endpoint, body = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const error = await response.json();
            throw { response: { status: response.status, data: error } };
        }
        return response.json();
    },

    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    },

    async upload(endpoint, formData) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const error = await response.json();
            throw { response: { status: response.status, data: error } };
        }
        return response.json();
    },

    imgUrl(file) {
        return `${STORAGE_URL}${file}`;
    }
};

export default api;