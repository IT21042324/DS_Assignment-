import {
  faCartPlus,
  faExpand,
  faRankingStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useBackendAPI } from "../context/useBackendAPI";
import ReviewContainer from "./ReviewContainer";
import StarRating from "./StarRating";
import { ContactListPopupModel } from "./ContactListPopupModel";

export default function Item(props) {
  // importing cartContext, dispatch, and info from the cartContext
  const { dispatch, info, updateCart } = props.useCartContext();
  const itemDispatch = props.itemDispatch;

  const [selectedItem, setSelectedItem] = useState(0);
  const reviewDesc = useRef(null);

  const [showPopup, setShowPopup] = useState(false);
  const [handleOpenFrom, setHandleOpenFrom] = useState("");
  const [rating, setRating] = useState(0);
  const [addedRating, setAddedRating] = useState(3);
  const [selectedItemID, setSelectedItemID] = useState("");
  const [userCanReview, setUserCanReview] = useState(false);

  const { addReviewProduct } = useBackendAPI();
  const { getUser } = props.UseUserContext();
  const user = getUser();

  // Function to add item to cart
  function addItemToCart(data) {
    if (info.length !== 0 && info[0].storeID !== data.storeID) {
      alert("You cannot Select Items from different Stores");
    } else if (selectedItem + 1 > props.details.quantity) {
      alert("There are no more available items");
    } else {
      setSelectedItem((prev) => prev + 1);
      dispatch({ type: "UpdateCart", payload: data });
      updateCart(data);
    }
  }

  const handleViewItemClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const getRatingValue = (rating) => {
    setAddedRating(rating);
  };

  // To check if the user hasn't already submitted a review
  function canUserReview(item) {
    return (
      props.status && !item.reviews.some((review) => review.userID === user._id)
    );
  }

  // To submit the user review
  const submitProductReview = async (e) => {
    e.preventDefault();

    if (reviewDesc.current && reviewDesc.current.value.trim()) {
      const data = await addReviewProduct({
        itemID: selectedItemID,
        rating: addedRating,
        review: reviewDesc.current.value,
      });

      if (data) {
        alert("Review added successfully!");
        itemDispatch({
          type: "AddReview",
          payload: {
            _id: data._id,
            rating: addedRating,
            review: reviewDesc.current.value,
            userID: user._id,
            userName: user.userName,
          },
        });
        handleClosePopup();
        // Resetting form state after submission
        setSelectedItemID("");
        setAddedRating(3);
        reviewDesc.current.value = ""; // Clear the input field
      }
    } else {
      alert("Please provide a review description.");
    }
  };

  // To get the average rating of each product based on all the customers' ratings
  useEffect(() => {
    if (props.details.reviews.length > 0) {
      const averageRating =
        props.details.reviews.reduce((total, rev) => total + rev.rating, 0) /
        props.details.reviews.length;
      setRating(averageRating);
    }
    const result = canUserReview(props.details);
    setUserCanReview(result);
  }, [props.details.reviews]);

  return (
    <section id="productCard" className="section-p1">
      <div className="pro-container">
        <div className="pro">
          <div>
            <img
              src={props.details.image}
              style={{ height: "200px", width: "200px" }}
              alt={props.details.itemName}
            />
          </div>
          <h5>{props.details.itemName}</h5>
          <span>{props.details.storeName}</span>
          <h4>Rs. {props.details.price}</h4>
          {props.details.quantity ? (
            <span>{props.details.quantity} Available</span>
          ) : (
            <span style={{ textDecoration: "line-through", color: "red" }}>
              Sold Out
            </span>
          )}
          <div>
            {props.details.quantity ? (
              <>
                <button
                  title="View Item"
                  onClick={() => {
                    setHandleOpenFrom("View");
                    handleViewItemClick();
                  }}
                >
                  <FontAwesomeIcon icon={faExpand} />
                </button>
                <button
                  title="Add To Cart"
                  onClick={() => {
                    addItemToCart({
                      itemID: props.details._id,
                      itemName: props.details.itemName,
                      itemPrice: props.details.price,
                      itemQuantity: selectedItem + 1,
                      itemImage: props.details.image,
                      storeID: props.details.storeID,
                    });
                  }}
                >
                  {selectedItem}
                  <FontAwesomeIcon icon={faCartPlus} />
                </button>
                {userCanReview && (
                  <button
                    title="Review Item"
                    onClick={() => {
                      setHandleOpenFrom("Review");
                      setSelectedItemID(props.details._id);
                      handleViewItemClick();
                    }}
                  >
                    <FontAwesomeIcon icon={faRankingStar} />
                  </button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
      {/* For the popup form */}
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
            {user?.loginType === "googleAuth" && (
              <ContactListPopupModel item={props.details} />
            )}

            {handleOpenFrom === "View" ? (
              <>
                <img src={props.details.image} alt={props.details.itemName} />
                <StarRating initialRating={rating} fixedRating={true} />
                <h4 style={{ color: "black" }}>{props.details.itemName}</h4>
                <h2 style={{ color: "black" }}>{props.details.storename}</h2>
                <h3>Reviews</h3>
                {props.details.reviews.map((rev) => {
                  return (
                    <ReviewContainer
                      key={
                        rev.review +
                        rev.userID +
                        rev.rating +
                        (Math.floor(Math.random() * 50000) + 1)
                      }
                      review={rev}
                    />
                  );
                })}
              </>
            ) : (
              <>
                <img src={props.details.image} alt={props.details.itemName} />
                <StarRating initialRating={rating} fixedRating={true} />
                <h4 style={{ color: "black" }}>{props.details.itemName}</h4>
                <h2 style={{ color: "black" }}>{props.details.storename}</h2>
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
                        submitProductReview(e);
                      }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
