import axios from "axios";
import { useCallback, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./userContext";

export const UseUserContext = () => {
  const { dispatch, user1, selectedUserRole, orders } = useContext(UserContext);
  const navigate = useNavigate();

  // Wrap the logoutUser function with useCallback
  const logoutUser = useCallback(() => {
    const userSaved = localStorage.getItem("user");
    if (userSaved) {
      localStorage.removeItem("user");
      dispatch({ type: "Logout" });
      navigate("/", { replace: true });
      return true;
    } else return false;
  }, [dispatch, navigate]);

  useEffect(() => {
    async function getDataForUserContext() {
      try {
        // Check if there's user data in localStorage
        if (localStorage.getItem("user")) {
          const user = JSON.parse(localStorage.getItem("user"));

          dispatch({
            type: "SetUser",
            payload: [user],
          });

          // Make the API request to get orders
          const { data } = await axios.get(
            `https://localhost:8082/api/order/getAllStoreOrders/${user._id}`,
            {
              withCredentials: true,
            }
          );

          // Handle order data
          data?.forEach((ord) => {
            if (ord.status === "Pending") ord.statusValue = 0;
            else if (ord.status === "Confirmed") ord.statusValue = 1;
            else if (ord.status === "Dispatched") ord.statusValue = 2;
            else if (ord.status === "Delivered") ord.statusValue = 3;
          });

          if (data) {
            dispatch({
              type: "SetOrders",
              payload: data,
            });
          }
        }
      } catch (error) {
        // Check if it's a 401 error and trigger logout if so
        if (error.response && error.response.status === 401) {
          console.error("401 Unauthorized - Logging out");
          logoutUser();
        } else {
          console.error("Error fetching data", error);
        }
      }
    }

    getDataForUserContext();
  }, [dispatch, logoutUser]);

  function getUser() {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(localStorage.getItem("user"));
      return user;
    }
  }

  function getUserRole() {
    const userSaved = localStorage.getItem("user");
    if (userSaved) {
      const user = JSON.parse(userSaved);
      return user.role;
    }
  }

  function setUserRole(role) {
    const userSaved = localStorage.getItem("user");
    if (userSaved) {
      const user = JSON.parse(userSaved);
      user.role = role;
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({
        type: "SetUser",
        payload: [user],
      });
    }
  }

  function setStore(storeID) {
    const userSaved = localStorage.getItem("user");
    if (userSaved) {
      const user = JSON.parse(userSaved);
      user.storeID = storeID;
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({
        type: "SetStore",
        payload: storeID,
      });
    }
  }

  return {
    dispatch,
    user1,
    orders,
    selectedUserRole,
    setStore,
    getUser,
    getUserRole,
    setUserRole,
    logoutUser,
  };
};
