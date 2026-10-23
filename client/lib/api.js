import axios from "axios";

export const API_URL = process.env.NEXT_BACKEND_URL;

export const api = axios.create({ baseURL: API_URL });

export const errMsg = (e) =>
  e?.response?.data?.error || (e?.code === "ERR_NETWORK" ? "Cannot reach the server. Is the backend running?" : e?.message) || "Something went wrong";
