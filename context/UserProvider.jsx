import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const apiURL = "http://localhost:8000/api/v1";

    const [state, setState] = useState({
        accessToken: null,
        username: "@johndoe",
        phone: '123-455-6789',
        isAuthenticated: false,
        isLoading: true,
        error: null,
        name: "Alex Johnson",
        profileImage: null,
        theme: 'light',
    });

    useEffect(() => {
        checkAuthState();
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('userTheme');
            if (savedTheme) {
                setState(prev => ({
                    ...prev,
                    theme: savedTheme
                }));
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            await AsyncStorage.setItem('userTheme', newTheme);
            setState(prev => ({
                ...prev,
                theme: newTheme
            }));
        } catch (error) {
            console.error('Error saving theme:', error);
            Alert.alert('Error', 'Failed to save theme preference');
        }
    };

    const updateProfileImage = (imageUri) => {
        setState(prev => ({
            ...prev,
            profileImage: imageUri
        }));
    };

    const removeProfileImage = () => {
        Alert.alert(
            'Remove Profile Picture',
            'Are you sure you want to remove your profile picture?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setState(prev => ({
                            ...prev,
                            profileImage: null
                        }));
                    },
                },
            ]
        );
    };

    const loadStoredUsername = async () => {
        try {
            return await SecureStore.getItemAsync("username");
        } catch (error) {
            console.error("Failed to load stored username:", error);
            return null;
        }
    };

    const saveUsername = async username => {
        try {
            await SecureStore.setItemAsync("username", username);
        } catch (error) {
            console.error("Failed to save username:", error);
        }
    };

    const checkAuthState = async () => {
        try {
            const accessToken = await SecureStore.getItemAsync("access_token");
            const refreshToken = await SecureStore.getItemAsync("refresh_token");
            const username = await loadStoredUsername();

            if (!accessToken || !refreshToken) {
                setState(prev => ({
                    ...prev,
                    username,
                    isLoading: false,
                }));
                return;
            }

            const isValidAccessToken = await validateAccessToken(accessToken);

            if (isValidAccessToken) {
                await loadUserData(accessToken);
                return;
            }

            const newTokens = await refreshAccessToken(refreshToken);

            if (newTokens) {
                await loadUserData(newTokens.access_token);
            } else {
                await logout();
            }
        } catch (error) {
            console.error("Auth state check failed:", error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: "Authentication check failed",
            }));
        }
    };

    const loadUserData = async (token) => {
        try {
            const response = await fetch(`${apiURL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setState(prev => ({
                    ...prev,
                    username: userData.username,
                    phone: userData.phone_number,
                    accessToken: token,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                }));
            }
        } catch (error) {
            console.error("Loading user data failed:", error);
        }
    };

    const validateAccessToken = async (token) => {
        try {
            const response = await fetch(`${apiURL}/auth/validate-access`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const refreshAccessToken = async (refreshToken) => {
        try {
            const response = await fetch(`${apiURL}/auth/refresh`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();

            await SecureStore.setItemAsync("access_token", data.access_token);
            await SecureStore.setItemAsync("refresh_token", data.refresh_token);

            return data;
        } catch (error) {
            console.error("Token refresh failed:", error);
            return false;
        }
    };

    const login = async (username, phone, code) => {
        try {
            const response = await fetch(`${apiURL}/auth/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    username,
                    phone_number: phone,
                    code,
                }),
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const data = await response.json();

            await SecureStore.setItemAsync("access_token", data.access_token);
            await SecureStore.setItemAsync("refresh_token", data.refresh_token);
            await saveUsername(username);

            setState(prev => ({
                ...prev,
                accessToken: data.access_token,
                username,
                phone,
                isAuthenticated: true,
                error: null,
            }));

            return true;
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: "Login failed",
            }));
            return false;
        }
    };

    const requestVerificationCode = async (username) => {
        try {
            const response = await fetch(`${apiURL}/auth/request-code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send verification code");
            }

            const data = response.json();
            return data;
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: "Failed to send verification code",
            }));
            return false;
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("refresh_token");
            await SecureStore.deleteItemAsync("username");
            setState({
                accessToken: null,
                username: null,
                phone: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                name: "Alex Johnson",
                profileImage: null,
                theme: 'light',
            });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const value = {
        ...state,
        login,
        logout,
        requestVerificationCode,
        refreshAccessToken,
        validateAccessToken,
        updateProfileImage,
        removeProfileImage,
        toggleTheme,
        isDarkMode: state.theme === 'dark'
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
