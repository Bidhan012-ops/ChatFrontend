import axios from "axios";

export const signup = (userData) => {
    return axios.post("http://localhost:5000/api/auth/signup", userData,
        {
            withCredentials: true
        }
    );
}

export const signin = (userData) => {
    return axios.post("http://localhost:5000/api/auth/signin", userData,
        {
            withCredentials: true
        }
    );
}

export const logout = () => {
    return axios.post("http://localhost:5000/api/auth/logout", {},
        {
            withCredentials: true
        }
    );
}

export const getCurrentUser = () => {
    return axios.get("http://localhost:5000/api/auth/me",
        {
            withCredentials: true
        }
    );
}
