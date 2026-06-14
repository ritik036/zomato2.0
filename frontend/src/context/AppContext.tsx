import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService, restaurantService } from "../main";
import axios from "axios";
import {
  type LocationData,
  type AppContextType,
  type User,
  type ICart,
} from "../types";
import { Toaster } from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("fetching location");

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${authService}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const [cart, setCart] = useState<ICart[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [quantity, setQuantity] = useState(0);
  console.log("inside app context", quantity);
  
  async function fetchCart() {
    console.log("fetching cart")
    if (!user || user.role !== "customer") {
      return;
    }
    console.log("got user, now to fetch cart")
    try {
      const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("data on fetching cart", data);
      setCart(data.cart || []);
      setSubTotal(data.subTotal || 0);
      setQuantity(data.cartLength || 0);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (user && user.role === "customer") {
      fetchCart();
    }
  }, [user]);

  useEffect(() => {
    if (!navigator.geolocation)
      return alert("please allow location to continue");
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { longitude, latitude } = position.coords;
      try {
        const res = await fetch(
          ` https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );
        const data = await res.json();
        setLocation({
          longitude,
          latitude,
          formattedAddress: data.display_name || "current location",
        });
        setCity(
          data.address.city ||
            data.address.town ||
            data.address.village ||
            "your location",
        );
        setLoadingLocation(false);
      } catch (error) {
        setLocation({
          longitude,
          latitude,
          formattedAddress: "current location",
        });
        setCity("failed to load");
        setLoadingLocation(false);
      }
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        loading,
        setIsAuth,
        setLoading,
        setUser,
        user,
        city,
        loadingLocation,
        location,
        cart,
        fetchCart,
        subTotal,
        quantity,
        setQuantity
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};
