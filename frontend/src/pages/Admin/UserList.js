import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import SideMenu from "../../components/SideMenu";
import {
  faDashboard,
  faGear,
  faListSquares,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

export default function UserList() {
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
          <SideMenu to="/admin/adminprofile" icon={faUser} label="Profile" />
          <SideMenu to="/admin/user" icon={faUsers} label="Users" />
          <SideMenu to="/admin/add-user" icon={faGear} label="Add-User" />
        </div>
      </section>
      <section className="main-wrap">
        <div
          className="content-main"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div>
            <h2>User List</h2>
            <p>Manage Users here</p>
          </div>
          <div>
            <Link className="btn btn-primary" to={"/admin"}>
              Back
            </Link>
          </div>
        </div>

        <div className="card mb-4">
          <header className="card-header">
            <h4>User</h4>
            <div>
              <Link className="btn btn-success" to={"/admin/add-user"}>
                <FontAwesomeIcon icon={faPlus} /> Add Users
              </Link>
            </div>
          </header>
          <div className="card-body">
            {/* <ItemMapper /> */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>#User ID</th>
                    <th scope="col">User Name</th>
                    <th scope="col">Password</th>
                    <th scope="col">Contact No</th>
                    <th scope="col">Image</th>
                    <th scope="col">Role</th>

                    <th scope="col" className="text-end">
                      {" "}
                      Action{" "}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
