import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";
import { loadStripe } from "@stripe/stripe-js"

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

function Checkout() {
  const { cart, subTotal, quantity } = useAppData();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }
      try {
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setAddresses(data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchAddresses();
  }, [cart]);
  const navigate = useNavigate();

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-lg">your cart is empty</p>
      </div>
    );
  }
  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const plateFormFee = 7;
  const grandTotal = subTotal + deliveryFee + plateFormFee;
  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return data;
    } catch (error) {
      toast.error("failed to create order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);
      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;
      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;
      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Zomato", //your business name
        description: "food delivery",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            toast.success("payment successfull");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            toast.error("payment verification");
          }
        },
        theme: {
          color: "#E23744",
        },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log("error");
      toast.error("payment failed, please refresh page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) {
        return;
      }
      const { orderId, amount } = order
      console.log("stripe checkout ", order);
      try {
        const stripe = await stripePromise;
        const { data } = await axios.post(`${utilsService}/api/payment/stripe/create`, {
          orderId
        })
        if (data.url) {
          window.location.href = data.url
        } else {
          toast.error("failed to create payment session")
        }
      } catch (error) {
        toast.error("payment failed")
      }
    } catch (error) {
      console.log("error");
      toast.error("payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">CheckOut</h1>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{restaurant.name}</h2>
        <p className="text-sm text-gray-500">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>

      <div className="rounded-xl divide p-4 shadown-sm space-y-3">
        <h3 className="font-semibold"> Delivery Address</h3>
        {loadingAddress ? (
          <p className="text-sm text-gray-500">loading addresses... </p>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-gray-500 ">
            No Address Found. Please Add One
          </p>
        ) : (
          addresses.map((address) => (
            <label
              key={address._id}
              className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition ${selectedAddressId === address._id ? "border-[#E23744] bg-red-50" : "hover:bg-red-300"}`}
            >
              <input
                type="radio"
                checked={selectedAddressId === address._id}
                onChange={() => setSelectedAddressId(address._id)}
              />
              <div className="">
                <p className="text-sm font-medium">
                  {address.formattedAddress}
                </p>
                <p className="text-xs text-gray-500">{address.mobile}</p>
              </div>
            </label>
          ))
        )}
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h3 className="font-semibold">Order Summary</h3>
        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;
          return (
            <div className="flex justify-between text-sm" key={cartItem._id}>
              <span className="">
                {item.name} x {cartItem.quantity}
              </span>
              <span>₹{item.price * cartItem.quantity}</span>
            </div>
          );
        })}
        <hr />
        <div className="flex justify-between text-sm">
          <span className="">Items ({quantity})</span>
          <span>₹{subTotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="">Delivery Fee</span>
          <span>₹{deliveryFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="">Plateform Fee</span>
          <span>₹{plateFormFee}</span>
        </div>
        <hr />
        <div className="flex justify-between text-sm">
          <h2 className="text-lg font-semibold">Grand Total</h2>
          <h2 className="text-lg font-semibold">₹{grandTotal}</h2>
        </div>
      </div>
      <div className=" rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">Payment Method</h3>
        <button
          disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
          className="w-full bg-[#2D77F9] flex items-center justify-center gap-2 border-2 hover:bg-blue-500 cursor-pointer rounded-2xl p-2 font-semibold text-sm text-white disabled:opacity-50"
          onClick={payWithRazorpay}
        >
          {loadingRazorpay ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}{" "}
          Pay With RazorPay
        </button>
        <button
          disabled={!selectedAddressId || loadingStripe || creatingOrder}
          className="w-full bg-[black] flex items-center justify-center gap-2 border-2 hover:bg-gray-500 cursor-pointer rounded-2xl p-2 font-semibold text-sm text-white disabled:opacity-50"
          onClick={payWithStripe}
        >
          {loadingRazorpay ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}{" "}
          Pay With Stripe
        </button>
      </div>
    </div>
  );
}

export default Checkout;
