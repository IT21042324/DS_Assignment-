import { Navigate, Route, Routes } from "react-router-dom";
import { UseUserContext } from "./context/useUserContext";
import { PageNotFound } from "./pages/Error/PageNotFound";
import AddProduct from "./pages/Seller/Add-Product";
import ProductList from "./pages/Seller/ProductList";
import Profile from "./pages/Seller/Profile";
import Seller from "./pages/Seller/Seller";
import Store from "./pages/Seller/Store";

export function SellerRoutes() {
  const { getUser } = UseUserContext();
  const user = getUser();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Seller />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product" element={<ProductList />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route
          path="/store"
          element={!user?.storeID ? <Store /> : <Navigate to="/seller" />}
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}
