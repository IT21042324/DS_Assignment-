import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "../utils/googleApi";
import { scope } from "../utils/googleAuth";
import { SignInWithGoogleButton } from "./GoogleAuthComponents";

export const GoogleOAuth = ({ submitHandler, state }) => {
  const [user, setUser] = useState(null); // Initialize user state
  const [profile, setProfile] = useState(null); // Initialize profile state
  const [loading, setLoading] = useState(false); // To handle loading state

  // Google login logic
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse); // Save user information from Google
      setLoading(false); // Reset loading state
    },
    onError: (error) => {
      alert("Login Failed:", error);
      setLoading(false); // Reset loading state
    },
    scope,
  });

  // Log out function to reset user and profile
  const logOut = () => {
    googleLogout();
    setProfile(null);
    setUser(null);
  };

  // Fetch user profile when access token is available
  useEffect(() => {
    const fetchProfileAndSetAccessToken = async () => {
      if (user && user.access_token) {
        try {
          setLoading(true); // Start loading
          const res = await fetchUserProfile(user.access_token);
          const { data } = res;
          setProfile(data); // Set profile data
        } catch (err) {
          alert("Failed to retrieve user profile. Please try again.");
        } finally {
          setLoading(false); // End loading
        }
      }
    };

    fetchProfileAndSetAccessToken();
  }, [user]);

  // Submit user details after profile is fetched
  useEffect(() => {
    if (profile) {
      const userDetails = {
        userName: profile.email,
        image: profile.picture,
        loginType: "googleAuth",
        googleAuthAccessToken: user?.access_token,
      };

      submitHandler(userDetails)
        .then(() => {})
        .catch((error) => {
          console.error("Error during login submission:", error);
        });
    }
  }, [profile]);

  return (
    <div>
      <SignInWithGoogleButton
        login={login}
        state={state}
        disabled={loading} // Disable button while loading
      />
      {loading && <p>Loading...</p>} {/* Show loading message */}
      {profile && <p>Welcome, {profile.email}!</p>}{" "}
      {/* Show user's profile info */}
    </div>
  );
};
