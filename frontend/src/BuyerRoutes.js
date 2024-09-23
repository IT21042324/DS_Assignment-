import { Route, Routes } from "react-router-dom";
import { useCartContext } from "./context/useCartContext";
import { UseItemContext } from "./context/useItemContext";
import { UseStoreContext } from "./context/useStoreContext";
import Buyer from "./pages/Buyer/Buyer";
import Cart from "./pages/Buyer/Cart";
import Product from "./pages/Buyer/Product";
import { PageNotFound } from "./pages/Error/PageNotFound";

export function BuyerRoutes({ UseUserContext }) {
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <Buyer
              UseUserContext={UseUserContext}
              UseStoreContext={UseStoreContext}
            />
          }
        />
        <Route path="/Cart" element={<Cart />} />
        <Route
          path="/product"
          element={
            <Product
              UseUserContext={UseUserContext}
              UseStoreContext={UseStoreContext}
              UseItemContext={UseItemContext}
              useCartContext={useCartContext}
            />
          }
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}
