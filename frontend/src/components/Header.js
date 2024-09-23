import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useBackendAPI } from "../context/useBackendAPI";
import { UseUserContext } from "../context/useUserContext";
import NavBar from "./Navbar";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Defining the Header function
function Header() {
  const { logoutUser, dispatch, getUser } = UseUserContext();
  const user = getUser();

  // Setting initial state for showing the user profile popup
  const [showPopup, setShowPopup] = useState(false);
  const [isGoogleImage, setIsGoogleImage] = useState(false); // New state for Google image

  // Creating a reference to the input field for the user name
  const userName = useRef();
  const [profilePic, setProfilePic] = useState("");

  // Close the popup
  const handleClosePopup = () => setShowPopup(false);

  // Logout function
  const logoutFunction = () => logoutUser();
  console.log(profilePic);

  useEffect(() => {
    if (user?.image) {
      setProfilePic(user.image); // Set the profile picture
      // Check if the image is from Google
      setIsGoogleImage(
        user.image.startsWith("https://lh3.googleusercontent.com/")
      );
    }
  }, [user?.image]);

  // Function for converting the selected image file to base64 format
  function convertToBase64(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => setProfilePic(reader.result);
    reader.onerror = (error) => console.log("error: ", error);
  }

  // Retrieving the updateUser function from the useBackendAPI hook
  const { updateUser } = useBackendAPI();

  // Function for handling the submission of the user profile update form
  const submitHandler = async (e) => {
    e.preventDefault();

    await updateUser({
      userId: user._id,
      userName: userName.current.value,
      image: profilePic, // Handle both base64 and Google image URLs
    });
  };

  return (
    <header>
      <h1>RB&NS</h1>
      <NavBar />
      <div className="navbar-icons">
        <div>
          {user ? (
            <div style={{ display: "flex" }}>
              <div style={{ marginTop: "5px" }}>
                <h6>{user.userName}</h6>
                <Link to="/" onClick={logoutFunction}>
                  <h6 style={{ float: "right", color: "red" }}>Logout</h6>
                </Link>
              </div>
              &nbsp;&nbsp;&nbsp;
              {/* Displaying the user profile picture*/}
              {profilePic && (
                <img
                  src={profilePic} // Handles both Google URL and Base64
                  alt={"Pic"}
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "40px",
                    marginTop: "10px",
                    fontSize: "12px",
                    border: "1px solid green",
                    textAlign: "center",
                  }}
                  onClick={() => {
                    // Only allow opening the popup if it's not a Google image
                    if (!isGoogleImage) {
                      setShowPopup(true);
                    }
                  }}
                />
              )}
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() =>
                dispatch({ type: "SetUserRole", userRole: "Buyer" })
              }
            >
              Login
            </Link>
          )}
        </div>
        {(user?.role === "Buyer" || !user) && (
          <Link to="/buyer/Cart">
            <div className="cart">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
          </Link>
        )}
      </div>

      {showPopup && !isGoogleImage && (
        <div
          className="popup"
          style={{ display: showPopup ? "flex" : "none", zIndex: "100" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClosePopup();
            }
          }}
        >
          <div className="popup-content">
            {profilePic && (
              <img
                src={profilePic} // Handles both Google URL and Base64
                style={{
                  backgroundColor: "white",
                  width: "200px",
                  height: "200px",
                  borderRadius: "100%",
                  border: "1px solid black",
                }}
                alt={user.userName}
              />
            )}

            <h4 style={{ color: "black" }}>
              <input
                type="text"
                defaultValue={user.userName}
                style={{
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                }}
                onFocus={(event) => {
                  event.target.style.outline = "2px dashed black";
                }}
                onBlur={(event) => {
                  event.target.style.outline = "none";
                }}
                ref={userName}
              />
            </h4>

            <input
              accept="image/*"
              type="file"
              id="changeProfilePic"
              style={{
                padding: "10px",
                color: "white",
                backgroundColor: "black",
              }}
              onChange={convertToBase64}
            />

            <h2 style={{ color: "black" }}></h2>
            <input
              type="submit"
              value="Save Details"
              style={{
                padding: "10px",
                color: "white",
                backgroundColor: "black",
              }}
              onClick={(e) => {
                submitHandler(e);
                handleClosePopup();
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
