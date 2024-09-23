import { getGoogleAPIResponse } from "./axios";

// Function to fetch user profile
export const fetchUserProfile = (accessToken) => {
  const url = `https://www.googleapis.com/oauth2/v1/userinfo`;
  return getGoogleAPIResponse(url, accessToken);
};

// Function to fetch user contacts
export const fetchUserContacts = (accessToken) => {
  const url = `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses`;
  return getGoogleAPIResponse(url, accessToken);
};
