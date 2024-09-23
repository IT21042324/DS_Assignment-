import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import avatar from "../assets/addphoto.png";
import { EncodedFile } from "../assets/encodedImage";
import pic from "../assets/register.png";
import { useBackendAPI } from "../context/useBackendAPI";
import { UseUserContext } from "../context/useUserContext";
import {
  sanitizeAndEncodeInputs,
  validateForm,
} from "../utils/registerFormValidation";
import Footer from "./Footer";
import { GoogleOAuth } from "./GoogleLogin";
import Header from "./Header";
import { SendEmail } from "./SendEmail";

// Import validation and sanitization functions

export default function Register() {
  const [profilePic, setProfilePic] = useState(avatar);
  const [errors, setErrors] = useState({});
  const { registerUser, login } = useBackendAPI();
  const { selectedUserRole } = UseUserContext();

  // Refs for form fields
  const userName = useRef();
  const password = useRef();
  const contact = useRef();
  const address = useRef();

  // Converts image to base64 for database storage
  const convertToBase64 = (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => setProfilePic(reader.result);
    reader.onerror = (error) => console.log("error: ", error);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const originalInputs = {
      userName: userName.current.value.trim(),
      password: password.current.value.trim(),
      contact: contact.current.value.trim(),
      address: address.current.value.trim(),
    };

    // Sanitize and encode inputs
    const sanitizedEncodedInputs = sanitizeAndEncodeInputs(originalInputs);

    // Perform form validation
    const validationErrors = validateForm(sanitizedEncodedInputs);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      registerMerchant(sanitizedEncodedInputs);
    }
  };

  // Register merchant function
  const registerMerchant = async (dataToSave) => {
    const image = profilePic || EncodedFile().image;

    await registerUser({
      ...dataToSave,
      image,
      role: selectedUserRole,
    });
  };

  const googleAuthLoginHandler = async (userDetails) => {
    const role = selectedUserRole;

    const info = await login({
      ...userDetails, // Contains userName, image, and googleAuthAccessToken
      role,
    });

    if (info === "Success") {
      SendEmail({
        user_name: userDetails.userName,
        role: userDetails.role,
        signupWithGoogleOAuth: true,
      });
    }
  };

  return (
    <div>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div>
          <img src={pic} alt="" style={{ width: 300, height: 300 }} />
        </div>
        <div className="login-c">
          <form style={{ minWidth: 400 }} onSubmit={handleSubmit}>
            <h3 className="text-center mb-4">Sign Up</h3>

            <div
              className="mb-3"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <label htmlFor="avatar">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile Pic"
                    style={{ width: "170px", height: "170px" }}
                  />
                ) : (
                  <img
                    src={avatar}
                    alt="Default Avatar"
                    style={{ width: "170px", height: "170px" }}
                  />
                )}
              </label>
              <input
                id="avatar"
                type="file"
                className="form-control"
                onChange={convertToBase64}
                style={{ display: "none" }}
              />
            </div>

            <div className="mb-3">
              <label>Username</label>
              <input
                type="email"
                className={`form-control ${
                  errors.userName ? "is-invalid" : ""
                }`}
                placeholder="example@gmail.com"
                ref={userName}
                required
              />
              {errors.userName && (
                <small className="text-danger">{errors.userName}</small>
              )}
            </div>

            <div className="mb-3">
              <label>Create Password</label>
              <input
                type="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="password"
                ref={password}
                required
              />
              {errors.password && (
                <small className="text-danger">{errors.password}</small>
              )}
            </div>

            <div className="mb-3">
              <label>Contact Number</label>
              <input
                type="text"
                className={`form-control ${errors.contact ? "is-invalid" : ""}`}
                placeholder="+94 123 456 789"
                ref={contact}
                required
              />
              {errors.contact && (
                <small className="text-danger">{errors.contact}</small>
              )}
            </div>

            <div className="mb-3">
              <label>Address</label>
              <input
                type="text"
                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                placeholder="123 Main St"
                ref={address}
                required
              />
              {errors.address && (
                <small className="text-danger">{errors.address}</small>
              )}
            </div>

            <div className="d-grid">
              <input
                type="submit"
                className="btn btn-primary"
                value="Sign Up"
              />
              <GoogleOAuth
                state={"Register"}
                submitHandler={googleAuthLoginHandler}
              />
            </div>
            <p className="forgot-password text-center">
              Already a member? <Link to={"/login"}>Login</Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
