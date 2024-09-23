import { useContext, useEffect } from "react";
import { SellerOrderContext } from "./sellerOrderContext";
import { useBackendAPI } from "./useBackendAPI";
import { UseUserContext } from "./useUserContext";

export const useSellerOrderContext = () => {
  const sellerOrderContext = useContext(SellerOrderContext);
  const { dispatch, order } = sellerOrderContext;

  const { getUser, logoutUser } = UseUserContext();
  const user = getUser();

  const { getAllItemsFromOneStore, getStoreItemCount, getTotalSalesAmount } =
    useBackendAPI();

  useEffect(() => {
    async function getStoreInfo() {
      try {
        const data = await getAllItemsFromOneStore(user.storeID);
        const itemCount = await getStoreItemCount(user.storeID);
        const response = await getTotalSalesAmount(user.storeID);

        if (response) {
          const { total = 0, orderCount = 0 } = response; // Destructure safely with default values
          dispatch({
            type: "AddOrder",
            payload: {
              data: data || [], // Ensure data is not undefined
              dashBoardDetails: {
                total,
                orderCount,
                itemCount: itemCount || 0,
              }, // Default values
            },
          });
        } else {
          console.error("No response from API or response is undefined.");
        }
      } catch (err) {
        console.error("Error fetching store info:", err);
      }
    }

    if (user && user.storeID) {
      getStoreInfo(); // Call API only if user and storeID are available
    }
  }, [dispatch, user]);

  const clearOrderState = () => {
    const loggedOutStatus = logoutUser();
    if (loggedOutStatus) {
      dispatch({ type: "ClearAll" });

      return true;
    }
    return false;
  };

  return { sellerOrderContext, dispatch, order, clearOrderState };
};
