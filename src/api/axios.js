import axios from 'axios';

// Base URL setup
const API_BASE_URL = 'http://localhost:7000/'; // Your backend URL

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});