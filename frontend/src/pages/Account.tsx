import React from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";

const Account = () => {
  const { user, setIsAuth, setUser } = useAppData();
  const firstLetter = user?.name.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("logged out");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white shadow-sm ">
        <div className="flex items-center gap-4 border-b p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-xl font-semibold">
            {firstLetter}
          </div>
          <div>
            <h2 className="text-lg font-semibold ">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="divide-y">
          <div
            onClick={() => navigate("/orders")}
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50"
          >
            <BiPackage className="h-5 w-5 text-red-500" />
            <span className="font-medium ">Your Orders</span>
          </div>
          <div
            onClick={() => navigate("/address")}
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50"
          >
            <BiMapPin className="h-5 w-5 text-red-500" />
            <span className="font-medium ">Addresses</span>
          </div>
          <div
            onClick={logoutHandler}
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50"
          >
            <BiLogOut className="h-5 w-5 text-red-500" />
            <span className="font-medium ">Log Out</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
