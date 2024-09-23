import {
  faDollarSign,
  faTruck,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminContext } from "../context/useAdminContext";
import { useAdminUserContext } from "../context/useAdminUserContext";
import { useBackendAPI } from "../context/useBackendAPI";
import { UseUserContext } from "../context/useUserContext";

function Dashboard() {
  const { logoutUser } = UseUserContext();
  const { deleteUser } = useBackendAPI();
  const { content } = useAdminContext();
  const { content: adminUserList, dispatch: adminUserDispatch } =
    useAdminUserContext();

  //Destructuring necessary components from the admin context
  const { dashBoardDetails: dashDetails } = content;

  const [users, setUsers] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [amount, setAmount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [userRole, setUserRole] = useState("");

  //setting the dashboard details
  useEffect(() => {
    if (dashDetails) {
      setOrderCount(dashDetails.orderCount);
      setAmount(dashDetails.amountForStore);
    }
  }, [dashDetails]);

  //setting the users details
  useEffect(() => {
    if (adminUserList.users) {
      setUsers(adminUserList.users);
      setUserCount(adminUserList.users.length);
    }
  }, [adminUserList.users]);

  // Define a state variable to track admin's login status
  const [adminIsLoggedIn, setAdminIsLoggedIn] = useState(true);

  //The function to logout
  const logoutFunction = () => {
    alert("Logged Out");
    setAdminIsLoggedIn(false);
  };

  // Use useEffect to logout user if adminIsLoggedIn state changes
  useEffect(() => {
    if (!adminIsLoggedIn) {
      logoutUser();
    }
  }, [adminIsLoggedIn, logoutUser]);

  const removeUser = async (e, userID) => {
    e.preventDefault();
    const data = await deleteUser(userID);
    if (data) {
      adminUserDispatch({ type: "DeleteUser", payload: { _id: data._id } });
    } else {
      alert("Ooops.. There seems to be an error deleting the user");
    }
  };

  return (
    <section className="main-dashboard">
      {adminIsLoggedIn ? (
        <>
          <div
            className="content"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              <h2 style={{ color: "Black", fontWeight: "bold" }}>
                ADMIN DASHBOARD
              </h2>
              <p style={{ color: "black" }}>Whole data about site here</p>
            </div>
            <div>
              <input
                type="Button"
                className="btn btn-primary"
                onClick={logoutFunction}
                value="Logout"
              />
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-3">
              <div className="card card-body mb-3">
                <article className="icontext">
                  <span className="icon icon-sm rounded-circle bg-primary-light">
                    <FontAwesomeIcon icon={faDollarSign} />
                  </span>
                  <div className="text">
                    <h6 className="mb-1 card-title">Revenue</h6>
                    {amount ? <span>{amount.toFixed(2)}</span> : 0.0}
                  </div>
                </article>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="card card-body mb-3">
                <article className="icontext">
                  <span className="icon icon-sm rounded-circle bg-success-dar">
                    <FontAwesomeIcon icon={faTruck} />
                  </span>
                  <div className="text">
                    <h6 className="mb-1 card-title">Orders</h6>
                    <span>{orderCount}</span>
                  </div>
                </article>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="card card-body mb-3">
                <article className="icontext">
                  <span className="icon icon-sm rounded-circle bg-warning-light">
                    <FontAwesomeIcon icon={faUserGroup} />
                  </span>
                  <div className="text">
                    <h6 className="mb-2 card-title">Users</h6>
                    <span>{userCount}</span>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <header className="card-header">
              <h4>Users</h4>
              <select
                onChange={(e) => setUserRole(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  fontFamily: "sans-serif",
                }}
              >
                <option value="">--Please select a user role--</option>
                <option value="">All</option>
                <option value="Merchant">Merchant</option>
                <option value="Buyer">Consumer</option>
              </select>
            </header>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr style={{ textAlign: "center", height: "50px" }}>
                      <th>#User ID</th>
                      <th scope="col" style={{ textAlign: "center" }}>
                        User Name
                      </th>
                      <th scope="col" style={{ textAlign: "center" }}>
                        Role
                      </th>
                      <th scope="col" style={{ textAlign: "center" }}>
                        Contact No
                      </th>
                      <th scope="col" style={{ textAlign: "center" }}>
                        Address
                      </th>
                      <th
                        scope="col"
                        className="text-end"
                        style={{ textAlign: "center" }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      ?.filter(
                        (usr) =>
                          (userRole === "" || usr.role === userRole) &&
                          usr.role !== "Admin"
                      )
                      .map((usr) => (
                        <tr
                          key={usr._id}
                          style={{ textAlign: "center", height: "50px" }}
                        >
                          <td style={{ textAlign: "center" }}>
                            {usr._id.slice(-4)}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {usr.userName}
                          </td>
                          <td style={{ textAlign: "center" }}>{usr.role}</td>
                          <td style={{ textAlign: "center" }}>{usr.contact}</td>
                          <td style={{ textAlign: "center" }}>{usr.address}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              onClick={(e) => removeUser(e, usr._id)}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "4px",
                                border: "none",
                                fontSize: "16px",
                                fontFamily: "sans-serif",
                                cursor: "pointer",
                                backgroundColor: "#fff",
                                color: "#ff4d4f",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                float: "right",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#f1f1f1")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#fff")
                              }
                            >
                              Remove User
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Navigate to="/" />
      )}
    </section>
  );
}

export default Dashboard;
