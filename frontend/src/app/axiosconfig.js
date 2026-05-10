import axios from "axios";


const axiosInstance = axios.create({
    baseURL: "https://super-duper-enigma-xxv99jxr44wfpqqp-8080.app.github.dev/v1",
    headers: {
        "Content-Type": "application/json",
    },
});
export default axiosInstance;