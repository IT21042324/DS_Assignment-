import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import React from "react";
import { UseUserContext } from "../context/useUserContext";

function NavBar() {
  const [selection, setSelection] = useState("Home");
  function onNavLinkClick() {}

  //To get the logged in userRoler
  const { getUserRole, dispatch, user1 } = UseUserContext();
  const userRole = getUserRole();

  useEffect(() => {
    const path = window.location.pathname;

    if (path === "/") {
      setSelection("Home");
    } else if (path === "/buyer/product") {
      setSelection("Products");
    } else if (path === "/register") {
      setSelection("Seller");
    } else if (path === "/seller/store") {
      setSelection("Store");
    } else if (path === "/buyer") {
      setSelection("TrackOrders");
    }
  }, []);

  return (
    <nav>
      {(user1[0]?.role === "Buyer" || !user1[0]) && (
        <>
          <Link to="/" style={{ textDecoration: "none", color: "black" }}>
            <div className={selection === "Home" ? "active" : ""}>Home</div>
          </Link>
          <Link
            to="/buyer/product"
            style={{ textDecoration: "none", color: "black" }}
          >
            <div className={selection === "Products" ? "active" : ""}>
              Products
            </div>
          </Link>

          {user1[0]?.role === "Buyer" && (
            <Link
              to="/buyer"
              style={{ textDecoration: "none", color: "black" }}
            >
              <div className={selection === "TrackOrders" ? "active" : ""}>
                Track Orders
              </div>
            </Link>
          )}
        </>
      )}

      {user1[0]?.role === "Merchant" && (
        <>
          <Link
            to="/seller/store"
            style={{ textDecoration: "none", color: "black" }}
            onClick={() => onNavLinkClick("Store")}
          >
            <div className={selection === "Store" ? "active" : ""}>Store</div>
          </Link>
        </>
      )}
      {!(userRole === "Merchant") ? (
        <Link
          to="/register"
          style={{ textDecoration: "none", color: "black" }}
          onClick={(e) => {
            dispatch({
              type: "SetUserRole",
              userRole: "Merchant",
            });
          }}
        >
          <div className={selection === "Seller" ? "active" : ""}>
            Sell On RB&NS
          </div>
        </Link>
      ) : (
        ""
      )}
    </nav>
  );
}

export default NavBar;
