import axios from "axios";
import { useContext, useEffect } from "react";
import { StoreContext } from "./storeContext";
import { UseUserContext } from "./useUserContext";

export const UseStoreContext = () => {
  const storeContext = useContext(StoreContext);
  const { dispatch, items } = storeContext;
  const { user1 } = UseUserContext();

  useEffect(() => {
    async function fetchData() {
      if (user1[0]?.role === "Merchant") {
        try {
          // Fetch data from API using proxy path instead of localhost URL
          const { data } = await axios.get(
            `/api3/store/get/${user1[0].storeID}`, // Using proxy path instead of localhost:8082
            {
              withCredentials: true, // Send cookies with requests (including the JWT token)
            }
          );

          const { storeItem } = data;
          dispatch({
            type: "SetItems",
            payload: storeItem,
          });
        } catch (err) {
          console.log(err);
        }
      }
    }
    fetchData();
  }, [user1, dispatch]);

  const clearOrderState = () => {
    dispatch({ type: "ClearAll" });
  };

  return { storeContext, dispatch, items, clearOrderState };
};
