import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/Navbar";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import Cart from "./pages/Cart";
import AddAddressPage from "./pages/Address";
import Checkout from "./pages/Checkout";

const App = () => {
  const { user } = useAppData();
  if (user && user.role === "seller") {
    return <Restaurant />;
  }
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/address" element={<AddAddressPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/restaurant/:id" element={<RestaurantPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/account" element={<Account />} />
            <Route path="/delete" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
