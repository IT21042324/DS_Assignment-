import { Link } from "react-router-dom";
import { useBackendAPI } from "../../context/useBackendAPI";
import { useEffect, useState } from "react";
import SideMenu from "../../components/SideMenu";
import { faDashboard, faListSquares } from "@fortawesome/free-solid-svg-icons";
import { useAdminOrderContext } from "../../context/useAdminOrdersContext";

export default function Orderlist() {
  const { updateOrderAndPaymentStatus } = useBackendAPI();

  const orderList = useAdminOrderContext().orders;
  const dispatch = useAdminOrderContext().dispatch;

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function storeOrder() {
      setOrders(orderList);
    }
    storeOrder();
  }, [orderList]);

  //To change the status of the order
  const changeOrderStatus = async (e, orderID, status) => {
    e.preventDefault();

    const data = await updateOrderAndPaymentStatus(orderID, status);

    if (data) {
      alert(`Order status changed to ${status}`);

      dispatch({
        type: "ConfirmOrder",
        payload: data,
      });
    }
  };

  return (
    <div>
      <section className="sideMenu">
        <div className="logo">
          <Link
            to="/admin"
            style={{
              textDecoration: "none",
              color: "white",
              fontSize: 50,
              paddingTop: 20,
              display: "flex",
              justifyContent: "center",
            }}
          >
            RB&NS
          </Link>
        </div>
        <div className="items">
          <SideMenu to="/admin" icon={faDashboard} label="Dashboard" />
          <SideMenu to="/admin/orders" icon={faListSquares} label="Orders" />
        </div>
      </section>
      <section className="main-wrap">
        <div
          className="content-main"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div>
            <h2>Order List</h2>
            <p>Manage Orders here</p>
          </div>
          <div>
            <Link className="btn btn-primary" to={"/admin"}>
              Back
            </Link>
          </div>
        </div>

        <div className="card mb-4">
          <header className="card-header">
            <h4>Orders</h4>
          </header>
          <div className="card-body">
            <div className="table-responsive">
              <table
                className="table table-hover"
                style={{ borderSpacing: "0 50px", width: "100%" }}
              >
                <thead>
                  <tr>
                    <th scope="col">Order ID</th>
                    <th scope="col">Payment ID</th>
                    <th scope="col">Store ID</th>
                    <th scope="col">Address</th>
                    <th scope="col">Item List</th>
                    <th scope="col">Order Status</th>
                    <th scope="col" className="text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((data) => {
                    return (
                      <tr key={data._id} style={{ height: "50px" }}>
                        <td scope="col">{data._id.slice(-4)}</td>
                        <td>{data.paymentID.slice(-4)}</td>
                        <td>{data.storeID.slice(-4)}</td>
                        <td>{data.address}</td>
                        <td>
                          {data.itemList.map((itm) => itm.itemName).join(", ")}
                        </td>
                        <td>{data.status}</td>
                        <td scope="col">
                          {data.status === "Pending" ? (
                            <button
                              style={{
                                padding: "8px 12px",
                                borderRadius: "4px",
                                border: "none",
                                fontSize: "16px",
                                fontFamily: "sans-serif",
                                cursor: "pointer",
                                backgroundColor: "#fff",
                                color: "green",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                transition: "all 0.2s ease-in-out",
                              }}
                              name="Confirm Order"
                              onClick={(e) =>
                                changeOrderStatus(e, data._id, "Confirmed")
                              }
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#f1f1f1")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#fff")
                              }
                            >
                              Confirm Order
                            </button>
                          ) : (
                            <span style={{ color: "blue" }}>
                              "Order Approved"
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
