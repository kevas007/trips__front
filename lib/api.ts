// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // ⚠️ adapte selon ton backend ou IP Docker
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
