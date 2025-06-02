import axios from "axios";

export const api = axios.create({
// baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
    baseURL: "https://webrtc-user-share-camera.onrender.com/api/v1",   
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
})