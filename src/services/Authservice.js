import axios from "axios";

export const signup = (userData) => {
    return axios.post("https://chatbackend-5lt8.onrender.com/api/auth/signup", userData,
        {
            withCredentials: true
        }
    );
}

export const signin = (userData) => {
    return axios.post("https://chatbackend-5lt8.onrender.com/api/auth/signin", userData,
        {
            withCredentials: true
        }
    );
}

export const logout = () => {
    return axios.post("https://chatbackend-5lt8.onrender.com/api/auth/logout", {},
        {
            withCredentials: true
        }
    );
}

export const getCurrentUser = () => {
    return axios.get("https://chatbackend-5lt8.onrender.com/api/auth/me",
        {
            withCredentials: true
        }
    );
}
