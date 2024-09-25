import {
  faCheckCircle,
  faGears,
  faThumbsUp,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import pic from "../../assets/f1.png";
import { useState, useRef } from "react";
import { useBackendAPI } from "../../context/useBackendAPI";
import Header from "../../components/Header";
import StarRating from "../../components/StarRating";

export default function Buyer({ UseUserContext, UseStoreContext }) {
  const { updateOrderAndPaymentStatus, addReviewStore } = useBackendAPI();
  const { orders, user1, dispatch } = UseUserContext();
  const storeDispatch = UseStoreContext().dispatch;

  const [statusValue, setStatusValue] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  const handleViewItemClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const confirmOrderReceived = async (e, status) => {
    e.preventDefault();

    const updatedOrder = await updateOrderAndPaymentStatus(
      selectedOrderId,
      status
    );

    if (updatedOrder) {
      setStatusValue(3); // Set status to "Delivered"
      alert("Order delivery confirmed");

      dispatch({
        type: "ConfirmDelivery",
        payload: { _id: selectedOrderId },
      });

      // Reset popup state after confirmation
      handleClosePopup(); // Close the popup immediately after confirmation
      setSelectedOrderId(""); // Clear the selected order
    }
  };

  const handleReviewButtonClick = (orderId, storeId) => {
    setSelectedOrderId(orderId);
    setStoreID(storeId);
    setStatusValue(3); // Set to "Delivered" status or any other relevant status for review
    handleViewItemClick(); // Open the review popup when the user explicitly clicks "Add Seller Review"
  };
  //To get the rating when the review is submitted
  const [rating, setRating] = useState(3);

  const getRatingValue = (rating) => {
    setRating(rating);
  };

  const reviewDesc = useRef();
  const [storeID, setStoreID] = useState("");

  const submitStoreReview = async (e) => {
    e.preventDefault();

    const data = await addReviewStore({
      orderID: selectedOrderId,
      storeID,
      rating,
      review: reviewDesc?.current?.value,
    });

    if (data) {
      storeDispatch({ type: "AddReview", payload: data.reviews });
      dispatch({ type: "Reviewed", payload: { _id: selectedOrderId } });
      handleClosePopup();
      alert("Thank you for your review!");
    }
  };

  return (
    <div>
      <Header UseUserContext={UseUserContext} />
      <section>
        <div className="card mb-4">
          <div className="card-header bg-primary" style={{ height: 150 }}></div>
          <div className="card-body">
            <div className="row">
              <div
                className="col-xl col-lg flex-grow-0"
                style={{ flexBasis: 230 }}
              >
                <div
                  className="img-thumbnail shadow w-100 bg-white position-relative text-center"
                  style={{ height: 190, width: 200, marginTop: -120 }}
                >
                  {!user1[0] ? (
                    <img src={pic} className="center-xy img-fluid" alt="" />
                  ) : (
                    <img
                      src={user1[0].image}
                      className="center-xy img-fluid"
                      alt=""
                    />
                  )}
                </div>
              </div>
              <div className="col-xl col-lg">
                <h3>User </h3>
                <p>{user1[0]?.userName}</p>
              </div>
            </div>
            <div className="card mb-4">
              <header className="card-header">
                <h4>My Orders</h4>
              </header>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Order ID</th>
                        <th scope="col">Payment ID</th>
                        <th scope="col">Store ID</th>
                        <th scope="col">Item List</th>
                        <th scope="col">Order Status</th>
                        <th scope="col" className="text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders?.map((data) => {
                        return (
                          <tr key={data._id} style={{ height: "50px" }}>
                            <td scope="col">{data._id.slice(-4)}</td>
                            <td>{data.paymentID.slice(-4)}</td>
                            <td>{data.storeID.slice(-4)}</td>
                            <td>
                              {data?.itemList
                                ?.map((itm) => itm.itemName)
                                .join(", ")}
                            </td>
                            <td>{data.status}</td>
                            <td style={{ textAlign: "center" }}>
                              {data.status !== "Delivered" && (
                                <button
                                  className="btn btn-warning"
                                  onClick={(e) => {
                                    if (data.status === "Delivered")
                                      setStatusValue(3);
                                    else {
                                      setStatusValue(data.statusValue);
                                    }

                                    setSelectedOrderId(data._id);
                                    handleViewItemClick();
                                  }}
                                >
                                  Track Order
                                </button>
                              )}

                              {data.status === "Delivered" && (
                                <button
                                  className="btn btn-success"
                                  onClick={() =>
                                    handleReviewButtonClick(
                                      data._id,
                                      data.storeID
                                    )
                                  } // Trigger the review popup only when clicking this button
                                  disabled={data.reviewed} // Disable if already reviewed
                                >
                                  {data.reviewed
                                    ? "Review Added"
                                    : "Add Seller Review"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {showPopup && (
                <div
                  className="popup"
                  style={{ display: showPopup ? "flex" : "none" }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      handleClosePopup();
                    }
                  }}
                >
                  <div className="popup-content">
                    {statusValue < 3 ? (
                      <div className="card mb-4">
                        <header className="card-header">
                          <h4>Order Tracking</h4>
                        </header>
                        <div className="card-body">
                          <div className="order-tracking mb-100">
                            <div className="steps d-flex flex-wrap flex-sm-nowrap justify-content-between">
                              <div className="step completed">
                                <div className="step-icon-wrap">
                                  <div className="step-icon">
                                    <FontAwesomeIcon icon={faGears} />
                                  </div>
                                </div>
                                <h4 className="step-title">Processing Order</h4>
                              </div>
                              <div
                                className={`step ${
                                  statusValue > 0 ? "completed" : ""
                                }`}
                              >
                                <div className="step-icon-wrap">
                                  <div className="step-icon">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                  </div>
                                </div>
                                <h4 className="step-title">Confirmed Order</h4>
                              </div>
                              <div
                                className={`step ${
                                  statusValue > 1 ? "completed" : ""
                                }`}
                              >
                                <div className="step-icon-wrap">
                                  <div className="step-icon">
                                    <FontAwesomeIcon icon={faTruckFast} />
                                  </div>
                                </div>
                                <h4 className="step-title">Order Dispatched</h4>
                              </div>
                              <div
                                className={`step ${
                                  statusValue > 2 ? "completed" : ""
                                }`}
                              >
                                <div className="step-icon-wrap">
                                  <div className="step-icon">
                                    <FontAwesomeIcon icon={faThumbsUp} />
                                  </div>
                                </div>
                                <h4 className="step-title">Order Delivered</h4>
                              </div>
                            </div>
                            {statusValue === 2 && (
                              <button
                                className="btn btn-success"
                                style={{ float: "right" }}
                                onClick={(e) => {
                                  confirmOrderReceived(e, "Delivered");
                                }}
                              >
                                Confirm Order Received
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="card mb-4">
                        <header className="card-header">
                          <h4>Write a Seller Review</h4>
                        </header>
                        <div className="card-body">
                          <div className="review-box">
                            <div className="star-rating">
                              <StarRating
                                maxRating={5}
                                initialRating={0}
                                enterRating={getRatingValue}
                              />
                            </div>
                            <textarea
                              cols={30}
                              placeholder="Describe your experience..."
                              ref={reviewDesc}
                            ></textarea>
                            <button
                              className="btn btn-success"
                              onClick={(e) => {
                                submitStoreReview(e);
                              }}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
