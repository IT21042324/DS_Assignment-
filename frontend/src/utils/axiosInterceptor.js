import axios from "axios";

export const setupAxiosInterceptors = (logoutUser) => {
  // Set up Axios interceptor for handling 401 Unauthorized errors globally
  const interceptor = axios.interceptors.response.use(
    (response) => response, // Forward the successful response
    (error) => {
      if (error.response && error.response.status === 401) {
        // Automatically log out the user when a 401 error occurs
        logoutUser();
      }
      return Promise.reject(error); // Forward the error
    }
  );

  // Return a function to clean up the interceptor if necessary
  return () => {
    axios.interceptors.response.eject(interceptor);
  };
};
