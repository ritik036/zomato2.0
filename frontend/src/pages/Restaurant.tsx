import { useEffect, useState } from "react";
import { type IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "./AddRestaurant";
import RestaurantProfile from "./RestaurantProfile";

type sellerTab = "menu" | "add item" | "sales";

function Restaurant() {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<sellerTab>("menu");

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/my`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setRestaurant(data.restaurant || null);
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
    } catch (error) {
      // Log full error for easier debugging (response body if available)
      // eslint-disable-next-line no-console
      console.error((error as any)?.response?.data || (error as any)?.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">loading your restaurant...</p>
      </div>
    );

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
      <RestaurantProfile
        restaurant={restaurant}
        onUpdate={setRestaurant}
        isSeller={true}
      />
      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex border-b">
          {[
            { key: "menu", label: "Menu Items" },
            { key: "add item", label: "Add Items" },
            { key: "sales", label: "Sales" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as sellerTab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${t.key === tab ? "border-b-2 border-red-500 text-red-500" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-5 ">
          {
            tab === "menu" && <p>Menu Page</p>
          }
          {
            tab === "add item" && <p>Add Item Page</p>
          }
          {
            tab === "sales" && <p>Sales Page</p>
          }
        </div>
      </div>
    </div>
  );
}

export default Restaurant;
