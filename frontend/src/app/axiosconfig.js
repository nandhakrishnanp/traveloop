import axios from "axios";


const axiosInstance = axios.create({
    baseURL: "https://effective-space-waddle-7wprrgw7x6q3rw9v-8080.app.github.dev/v1",
    headers: {
        "Content-Type": "application/json",
    },
});
export default axiosInstance;