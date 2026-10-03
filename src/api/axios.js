import axios from 'axios';

// Base URL setup
const API_BASE_URL = 'https://bmtvendorfinal.onrender.com/'; // Your backend URL

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});