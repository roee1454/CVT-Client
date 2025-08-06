import axios from 'axios';

const baseURL = import.meta.env.VITE_ENV === "development" ? "http://localhost:4000" : "http://vm0099cvt:4000"

export const axiosClient = axios.create({ baseURL, withCredentials: true })