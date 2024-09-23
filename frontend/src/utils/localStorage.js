export const setUserInLocalStorage = (data) => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      _id: data._id,
      userName: data.userName,
      image: data.image,
      role: data.role,
      storeID: data.storeID,
      loginType: data.loginType,
    })
  );
};

export const getUserFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const clearUserFromLocalStorage = () => {
  localStorage.removeItem("user");
};
