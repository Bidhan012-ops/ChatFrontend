// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
// 1. Create the Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // To show a spinner while checking
    useEffect(() => {
        // 2. Ask the backend if the HttpOnly cookie is valid
        const checkLoggedIn = async () => {
            try {
                const { data } = await axios.get('https://chatbackend-5lt8.onrender.com/api/auth/me', {
                    withCredentials: true
                });
                // console.log("The user in the authcontext is: ", data);
                setUser(data.user); // Save the user globally!
            } catch (error) {
                setUser(null); // Cookie is missing or expired
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Create a custom hook to easily use this context anywhere
export const useAuth = () => useContext(AuthContext);