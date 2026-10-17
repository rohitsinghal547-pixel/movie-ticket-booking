import {
    createContext,
    useContext,
    useState
} from "react";

import API_URL from "./api";

const AuthContext = createContext(null);

const AUTH_API_URL = `${API_URL}/api/auth`;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = sessionStorage.getItem("movietime_user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() =>
        sessionStorage.getItem("movietime_token")
    );

    function saveAuthentication(data) {
        sessionStorage.setItem("movietime_token", data.token);

        sessionStorage.setItem(
            "movietime_user",
            JSON.stringify(data.user)
        );

        setToken(data.token);
        setUser(data.user);
    }

    async function sendAuthRequest(endpoint, credentials) {
        const response = await fetch(`${AUTH_API_URL}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Authentication failed."
            );
        }

        saveAuthentication(data);

        return data;
    }

    function register(name, email, password) {
        return sendAuthRequest("register", {
            name,
            email,
            password
        });
    }

    function login(email, password) {
        return sendAuthRequest("login", {
            email,
            password
        });
    }

    function logout() {
        sessionStorage.removeItem("movietime_token");
        sessionStorage.removeItem("movietime_user");

        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                register,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }

    return context;
}