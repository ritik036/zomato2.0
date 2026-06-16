import type React from "react";

export interface User {
    _id: string,
    name: String,
    email: string,
    role: string,
    image: string
}

export interface LocationData {
    latitude: number | null,
    longitude: number | null,
    formattedAddress: string,
}

export interface AppContextType {
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    location: LocationData | null;
    loadingLocation: Boolean;
    city: string;
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setQuantity: React.Dispatch<React.SetStateAction<number>>

    cart: ICart[] | null;
    fetchCart: () => Promise<void>;
    subTotal: number;
    quantity: number;
}
// React.Dispatch<React.setStateAction<User | null >>


export interface IRestaurant {
    _id: string;
    name: string;
    description?: string;
    image: string;
    ownerId: string;
    phone: number;
    isVerified: boolean;
    autoLocation: {
        type: "Point",
        coordinates: [number, number] // [longitude, latitude]
        formattedAddress: string;
    },
    isOpen: boolean,
    createdAt: Date
}


export interface IMenuItem {
    _id: string,
    restaurantId: string;
    name: string;
    description: string;
    image?: string;
    price: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface ICart {
    _id: string,
    userId: string
    restaurantId: string | IRestaurant
    itemId: string | IMenuItem
    quantity: number,
    createdAt: Date,
    updatedAt: Date
}

