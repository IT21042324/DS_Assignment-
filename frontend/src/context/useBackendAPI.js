import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SendEmail } from "../components/SendEmail";
import {
  itemApi,
  orderApi,
  orderApiNSCR,
  paymentApi,
  paymentApiNSCR,
  storeApi,
  storeApiNSCR,
  updateAxiosCsrfToken,
  userApi,
  userApiNSCR,
} from "../utils/axios";
import {
  cannotFetchStoreNameAlert,
  cannotModifyAlert,
  cannotRemoveItemAlert,
  cannotUploadItemAlert,
  consoleError,
  consoleErrorWithAlert,
  handleError,
  handleItemError,
  tryAgainLaterAlert,
} from "../utils/handleError";
import { setUserInLocalStorage } from "../utils/localStorage";
import { useCartContext } from "./useCartContext";
import { UseStoreContext } from "./useStoreContext";
import { UseUserContext } from "./useUserContext";

export function useBackendAPI() {
  const { info } = useCartContext();
  const cartDispatch = useCartContext().dispatch;
  const clearCartContext = useCartContext().clearCart;
  const { dispatch, user1, setStore, getUser } = UseUserContext();
  const storeDispatch = UseStoreContext().dispatch;
  const navigate = useNavigate();
  const user = getUser();

  // After login or signup, refresh the CSRF token in Axios instances

  return {
    registerUser: async function (userDetails) {
      try {
        const response = await userApi.post("/signup/", userDetails);

        if (response && response.data) {
          const data = response.data;
          updateAxiosCsrfToken();
          setUserInLocalStorage(data);
          dispatch({ type: "SetUser", payload: [data] });
          SendEmail({
            user_name: userDetails.userName,
            role: userDetails.role,
          });
          alert("Account Created Successfully");
          cartDispatch({ type: "ClearCart" });
          clearCartContext();
          if (data.role === "Buyer") navigate("/buyer/product");
          else if (data.role === "Merchant") navigate("/seller/store");
        } else {
          alert("Registration failed. No response from the server.");
        }
      } catch (err) {
        handleError(err);
      }
    },

    login: async function (userDetails) {
      try {
        const response = await userApi.post("/login/", userDetails);

        if (response && response.data) {
          const data = response.data;
          updateAxiosCsrfToken();

          if (data.role) {
            setUserInLocalStorage(data);
            dispatch({ type: "SetUser", payload: [data] });
            if (data.role === "Buyer") navigate("/buyer/product");
            else if (data.role === "Merchant")
              data.storeID ? navigate("/seller") : navigate("/seller/store");
            else if (data.role === "Admin") navigate("/admin");

            return "Success";
          } else {
            alert(data.err || "User role not found in the response");
          }
        } else {
          alert("Login failed. No response from the server.");
        }
      } catch (err) {
        handleError(err);
      }
    },

    getGoogleProfile: async (accessToken) => {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );
        return response.data;
      } catch (err) {
        consoleError(err);
        throw new Error("Failed to fetch Google profile");
      }
    },

    // Google OAuth: Fetch user contacts using Google access token

    getGoogleContacts: async (accessToken) => {
      try {
        const response = await axios.get(
          `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );
        return response.data.connections || [];
      } catch (err) {
        consoleError(err);
        throw new Error("Failed to fetch Google contacts");
      }
    },

    // Update user details
    updateUser: async function ({ userId, userName, image }) {
      try {
        const { data } = await userApi.patch("/update/", {
          userId,
          userName,
          image,
        });
        setUserInLocalStorage(data);
        dispatch({ type: "SetUser", payload: data });
      } catch (err) {
        return err.message;
      }
    },

    // Purchase item
    purchaseItem: async function (details) {
      try {
        // Step 1: Create Payment
        const { data } = await paymentApi.post("/add/", {
          amount: details.total,
          itemList: info,
          userID: user1[0]._id,
        });

        // If payment fails, return early
        if (!data || !data._id) {
          throw new Error("Payment creation failed");
        }

        // Step 2: Create Order
        const orderDetails = await orderApi.post("/add/", {
          userID: user1[0]._id,
          paymentID: data._id,
          address: user1[0].address,
          storeID: info[0].storeID,
          itemList: info,
        });

        // If order creation fails, return early
        if (!orderDetails || !orderDetails.data || !orderDetails.data._id) {
          throw new Error("Order creation failed");
        }

        // Step 3: Update Items in stock (using Promise.all for concurrency)
        const status = await Promise.all(
          info.map(async (rec) => {
            try {
              return await itemApi.patch("/updateItem/", {
                itemID: rec.itemID,
                redQuantity: rec.itemQuantity,
              });
            } catch (err) {
              throw new Error(
                `Failed to update item ${rec.itemID}: ${err.message}`
              );
            }
          })
        );

        // Check if status contains any errors
        if (!status || status.some((s) => !s)) {
          throw new Error("Item update failed");
        }

        // Step 4: Send email and show success alert only if everything succeeded
        await SendEmail({
          user_name: user1[0].userName,
          role: "purchase",
          paymentID: data._id,
          orderID: orderDetails.data._id,
          amount: details.total,
          address: user1[0].address,
        });

        alert("Payment Successful");
        cartDispatch({ type: "ClearCart" });
        clearCartContext();
        navigate("/");
      } catch (err) {
        // Log the error and show the error message to the user
        console.error("Error during purchase: ", err.message);
        alert(`Error: ${err.message}`);
        handleItemError(err); // Pass the error to your error handler
      }
    },

    // Create a store
    createStore: async function (store) {
      store.merchantID = user._id;

      try {
        const { data } = await storeApi.post("/add/", store);

        await userApi.patch("/updateUserStore/", {
          userID: user._id,
          storeID: data._id,
        });

        setStore(data._id);
        navigate("/seller");

        return true;
      } catch (err) {
        return false;
      }
    },

    // Get total sales amount for a store
    getTotalSalesAmount: async function (storeID) {
      try {
        let { data } = await paymentApiNSCR.get(`/getStoreTotal/${storeID}`);

        data = data ?? 0; // Fallback to 0 if data is null or undefined

        return data;
      } catch (err) {
        consoleError(err);
        return 0; // Optionally, you might want to return 0 or handle it differently on error
      }
    },

    // Get store item count
    getStoreItemCount: async function (storeID) {
      try {
        const { data } = await storeApiNSCR.get(
          `/getStoreItemCount/${storeID}`
        );
        const { itemCount } = data;
        return itemCount;
      } catch (err) {
        consoleError(err);
      }
    },

    // Get store name
    getStoreName: async function (storeID) {
      try {
        const { data } = await storeApiNSCR.get(`/get/${storeID}`);
        return data.storeName;
      } catch (err) {
        cannotFetchStoreNameAlert();
      }
    },

    // Get products of the store
    getProductsOfStore: async function () {
      try {
        const { data } = await storeApiNSCR.get(`/get/${user.storeID}`);
        return data.storeItem;
      } catch (err) {
        cannotFetchStoreNameAlert();
      }
    },

    // Save product
    saveProduct: async function (product) {
      try {
        const { data } = await itemApi.post("/addItem/", product);

        if (data._id)
          await storeApi.patch("/updateItem/", {
            storeID: user1[0].storeID,
            item: data,
          });

        storeDispatch({ type: "AddItem", payload: data });
        alert("Item Added Successfully");
        return data;
      } catch (err) {
        cannotUploadItemAlert();
      }
    },

    // Remove product
    removeItem: async function (itemID) {
      try {
        await itemApi.delete(`/deleteItem/${itemID}`);

        await storeApi.patch("/deleteStoreItem/", {
          storeID: user1[0].storeID,
          itemID,
        });

        storeDispatch({ type: "DeleteItem", payload: { _id: itemID } });
        alert("Item Removed from the store");
      } catch (err) {
        cannotRemoveItemAlert();
      }
    },

    // Update product
    updateItem: async function (product) {
      try {
        const { data } = await itemApi.patch("/updateItem/", product);

        await storeApi.patch("/modifyItem/", {
          storeID: user1[0].storeID,
          item: data,
        });

        storeDispatch({ type: "ModifyItem", payload: data });
        alert("Item details updated");
      } catch (err) {
        cannotModifyAlert();
      }
    },

    // Get all items from one store
    getAllItemsFromOneStore: async function (storeID) {
      try {
        const { data } = await orderApiNSCR.get(`/getStoreOrder/${storeID}`);
        return data;
      } catch (err) {
        consoleError(err);
      }
    },

    // Update order and payment status
    updateOrderAndPaymentStatus: async function (orderID, status) {
      try {
        const { data } = await orderApi.patch("/updateOrderStatus/", {
          orderID,
          status,
        });

        const response = await paymentApi.patch("/updatePaymentStatus/", {
          paymentID: data.paymentID,
          status,
        });

        if (response) {
          return data;
        } else {
          alert(
            "There seems to be an error in the order service.. please try later"
          );
        }
      } catch (err) {
        consoleErrorWithAlert(
          err,
          "There seems to be an error in the order service.. please try later"
        );
      }
    },

    // Get users for the admin page
    getUsersForAdminPage: async function () {
      const { data } = await userApiNSCR.get("/");
      return data;
    },

    // Get user count for admin
    getUserCountForAdmin: async function () {
      try {
        const adminRevenue = await paymentApiNSCR.get("/getAdminTotal");
        const adminTotalOrders = await orderApiNSCR.get(
          "/getOrderCountForAdmin/"
        );

        return {
          orderCount: adminTotalOrders.data.orderCount,
          amountForStore: adminRevenue.data.amountForStore,
        };
      } catch (err) {
        consoleError(err);
      }
    },

    // Delete user
    deleteUser: async function (userID) {
      try {
        const { data } = await userApi.delete(`/deleteUser/${userID}`);

        if (data.storeID) {
          await storeApi.delete(`/delete/${data.storeID}`);
          await itemApi.delete(`/deleteStoreItems/${data.storeID}`);
        }

        if (data) {
          alert(`User deleted`);
          return data;
        }
      } catch (err) {
        consoleError(err);
        return err;
      }
    },

    // Get all store orders
    getAllStoreOrders: async function () {
      try {
        const { data } = await orderApiNSCR.get("/getAllStoreOrders/");
        return data;
      } catch (err) {
        consoleError(err);
      }
    },

    // Get all user orders
    getAllUserOrders: async function (userID) {
      try {
        const { data } = await orderApiNSCR.get(`/getAllStoreOrders/${userID}`);
        return data;
      } catch (err) {
        consoleError(err);
      }
    },

    // Add review to product
    addReviewProduct: async function (details) {
      try {
        const { rating, itemID, review } = details;

        const { data } = await itemApi.patch("/addReview/", {
          userID: user._id,
          userName: user.userName,
          rating,
          itemID,
          review,
        });

        return data;
      } catch (err) {
        tryAgainLaterAlert();
      }
    },

    // Add review to store
    addReviewStore: async function (details) {
      try {
        const { rating, storeID, review, orderID } = details;

        await storeApi.patch("/addReview/", {
          userID: user._id,
          userName: user.userName,
          rating,
          storeID,
          review,
        });

        const orderDetails = await orderApi.patch(
          `/setReviewStatus/${orderID}`
        );

        return orderDetails;
      } catch (err) {
        tryAgainLaterAlert();
      }
    },

    fetchAccessToken: async function (userName, role = "Buyer") {
      try {
        const { data } = await userApi.get(`/access-token/${userName}/${role}`);
        const { googleAuthAccessToken } = data;
        console.log("googleAuthAccessToken", googleAuthAccessToken);
        return googleAuthAccessToken;
      } catch (err) {
        consoleError(err);
        return null;
      }
    },

    setGoogleAccessToken: async function (accessToken, userDetails) {
      try {
        const { data } = await userApi.patch(`/access-token`, {
          ...userDetails,
          googleAuthAccessToken: accessToken,
        });

        if (data?.googleAuthAccessToken) {
          setUserInLocalStorage(data);
          dispatch({ type: "SetUser", payload: [data] });
          alert("Google Login Successful");
          return "success";
        }
      } catch (err) {
        consoleError(err);
        return null;
      }
    },
  };
}
