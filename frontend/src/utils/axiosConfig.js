﻿// C:\Users\acmsh\kanpAI\frontend\src\utils\axiosConfig.js
import axios from 'axios';
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
});
export default api;
