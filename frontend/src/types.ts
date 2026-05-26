import type React from "react";

export interface User {
    _id: string,
    name: String,
    email: string,
    role: string,
    image: string
}

export interface LocationData {
    latitude: number,
    longitude: number,
    formattedAddress: string,
}

export interface AppContextType {
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}
// React.Dispatch<React.setStateAction<User | null >>
