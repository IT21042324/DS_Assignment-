import { Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin/Admin";
import AddUser from "./pages/Admin/add-user";
import UserList from "./pages/Admin/UserList";
import Orderlist from "./pages/Admin/orderlist";
import AdminProfile from "./pages/Admin/adminprofile";
import { PageNotFound } from "./pages/Error/PageNotFound";

export function AdminRoutes() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Admin />} />
        <Route path="/user" element={<UserList />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/orders" element={<Orderlist />} />
        <Route path="/adminprofile" element={<AdminProfile />} />
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}
