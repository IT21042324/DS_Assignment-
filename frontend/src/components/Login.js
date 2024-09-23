import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import pic from "../assets/login.png";
import { useBackendAPI } from "../context/useBackendAPI";
import { UseUserContext } from "../context/useUserContext";
import Footer from "./Footer";
import { GoogleOAuth } from "./GoogleLogin";
import Header from "./Header";
import { sanitizeAndEncodeInputs } from "../utils/registerFormValidation";
import "./Login.css";

export default function Login() {
  //Creating refs to hold values of login form values
  const { selectedUserRole } = UseUserContext();
  const userName = useRef();
  const password = useRef();

  const { dispatch } = UseUserContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [existUserRole, setExistUserRole] = useState("");

  const { login } = useBackendAPI();

  const validateForm = () => {
    if (userName.current.value.trim() === "") {
      return "Username is required";
    }
    if (password.current.value.trim() === "") {
      return "Password is required";
    }
  };

  useEffect(() => {
    setExistUserRole(selectedUserRole);
  }, [selectedUserRole]);

  const loginHandler = async (e) => {
    e.preventDefault();

    const errorMessage = validateForm();
    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    // Sanitize and encode inputs
    const originalInputs = {
      userName: userName.current.value.trim(),
      password: password.current.value.trim(),
    };

    // console.log("Original inputs before sanitization:", originalInputs);

    const sanitizedEncodedInputs = sanitizeAndEncodeInputs(originalInputs);
    // console.log("Sanitized and encoded inputs:", sanitizedEncodedInputs);

    var role;
    if (isAdmin) {
      role = "Admin";
    } else {
      role = existUserRole || selectedUserRole;
    }

    const info = await login({
      userName: sanitizedEncodedInputs.userName,
      password: sanitizedEncodedInputs.password,
      role,
    });
    console.log(info);
  };

  const googleAuthLoginHandler = async (userDetails) => {
    const role = existUserRole || selectedUserRole;

    const info = await login({
      ...userDetails, // Contains userName, image, and googleAuthAccessToken
      role,
    });

    if (info) console.log(info);
  };

  function setAdminFunction() {
    if (!existUserRole) setExistUserRole(selectedUserRole);

    dispatch({
      type: "SetUserRole",
      userRole: "Admin",
    });
    setIsAdmin(true);
  }

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
        <div className="login-c">
          <form onSubmit={loginHandler}>
            <h3 className="text-center mb-4">Sign In</h3>

            <div className="mb-3">
              <label>Username</label>
              <input
                type="email"
                className="form-control"
                placeholder="example@gmail.com"
                ref={userName}
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                required
              />
            </div>

            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="password"
                ref={password}
              />
            </div>

            <div className="d-grid">
              <input
                type="submit"
                className="btn btn-primary"
                value="Sign In"
              />
              {!isAdmin && (
                <GoogleOAuth
                  submitHandler={googleAuthLoginHandler}
                  state={"Login"}
                />
              )}
            </div>

            {!isAdmin ? (
              <>
                <p className="forgot-password text-center">
                  Don't have an account yet?
                  <Link
                    to={"/register"}
                    onClick={() => {
                      dispatch({
                        type: "SetUserRole",
                        userRole: existUserRole,
                      });
                    }}
                  >
                    Register Now
                  </Link>
                </p>
                <p className="forgot-password text-center">
                  <Link onClick={setAdminFunction}>admin?</Link>
                </p>
              </>
            ) : (
              <Link
                onClick={() => {
                  dispatch({
                    type: "SetUserRole",
                    userRole: existUserRole,
                  });
                  setIsAdmin(false);
                }}
              >
                user?
              </Link>
            )}
          </form>
        </div>
        <div>
          <img src={pic} alt="" style={{ width: 300, height: 300 }} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
