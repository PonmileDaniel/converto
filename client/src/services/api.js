import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const currencyAPI = {
  // Convert currency
  convertCurrency: async (from, to, amount) => {
    const response = await api.get('/api/currency/convert', {
      params: { from, to, amount }
    });
    return response.data;
  },

  // Get provider status
  getProviderStatus: async () => {
    const response = await api.get('/api/currency/providers');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
