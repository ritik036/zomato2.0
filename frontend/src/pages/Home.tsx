import React, { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSearchParams } from "react-router-dom";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";

function Home() {
  const { location } = useAppData();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location.longitude) {
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      console.log('Restaurants fetched:', data);
      if (data.restaurants && Array.isArray(data.restaurants)) {
        setRestaurants(data.restaurants);
      } else {
        console.error('Invalid restaurant data structure:', data);
        setRestaurants([]);
      }
    } catch (error: any) {
      console.error('Error fetching restaurants:', error?.response?.data || error?.message || error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [search, location]);

  if (loading || !location) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">finding restaurants near you...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 ">
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ">
          {restaurants.map((res) => {
            const [resLong, resLat] = res.autoLocation.coordinates;
            if (!location.latitude || !location.longitude) {
              return;
            }
            const distance = getDistanceInKm(
              location.latitude,
              location.longitude,
              resLat,
              resLong,
            );
            return (
              <RestaurantCard
                key={res._id}
                id={res._id}
                name={res.name}
                image={res.image ?? ""}
                distance={`${distance}`}
                isOpen={res.isOpen}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No Restaurant found</p>
      )}
    </div>
  );
}

export default Home;
