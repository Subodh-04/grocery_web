import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
// Components
import Header from "./Component/Header";
import Footer from "./Component/Footer";
// Pages
import Home from "./pages/Home";
// About pages
import AboutUs from "./pages/About/AboutUs";
import Blog from "./pages/About/Blog";
import BlogCategory from "./pages/About/BlogCategory";
import Contact from "./pages/About/Contact";
// Shop pages
import Shop from "./pages/Shop/Shop";
import ShopCart from "./pages/Shop/ShopCart";
import ShopCheckOut from "./pages/Shop/ShopCheckOut";
// Store pages
import StoreList from "./pages/store/StoreList";
import SingleShop from "./pages/store/SingleShop";
// Account pages
import MyAccountOrder from "./pages/Accounts/MyAccountOrder";
import MyAccountSetting from "./pages/Accounts/MyAcconutSetting";
import MyAcconutNotification from "./pages/Accounts/MyAcconutNotification";
import MyAccountAddress from "./pages/Accounts/MyAccountAddress";
import MyAccountForgetPassword from "./pages/Accounts/MyAccountForgetPassword";
import MyAccountSignIn from "./pages/Accounts/MyAccountSignIn";
import MyAccountSignUp from "./pages/Accounts/MyAccountSignUp";
import SellerPanel from "./pages/SellerPanel/SellerPanel";
import AdminPanel from "./pages/Admin/AdminPanel";
import MyAccountPasswordReset from "./pages/Accounts/MyAccountPasswordReset";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderSuccess from "./pages/PaymentPage/orderSuccess";
import OrderFailed from "./pages/PaymentPage/orderFailed";
import OrderDetails from "./pages/Accounts/MyAccountOrderDetails";

const AppContent = () => {
  const location = useLocation();

  // Define the conditions for when to hide the Header and Footer
  const hideHeaderAndFooter =
    location.pathname === "/seller-panel" ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname === "/admin-panel" ||
    location.pathname === "/order-failed" ||
    location.pathname === "/order-success";

  return (
    <div>
      {/* Conditionally render Header */}
      {!hideHeaderAndFooter && <Header />}

      <Routes>
        <Route path="/Grocery-react/" element={<Home />} />
        {/* Shop pages */}
        <Route path="/Shop/:department" element={<Shop />} />
        <Route path="/ShopCheckOut" element={<ShopCheckOut />} />
        <Route path="/ShopCart" element={<ShopCart />} />
        {/* Store pages */}
        <Route path="/StoreList" element={<StoreList />} />
        <Route path="/Single-Store/:id" element={<SingleShop />} />
        {/* Accounts pages */}
        <Route path="/MyAccountOrder" element={<MyAccountOrder />} />
        <Route path="/order-details/:orderId" element={<OrderDetails />} />
        <Route path="/MyAccountSetting" element={<MyAccountSetting />} />
        <Route
          path="/MyAccountNotification"
          element={<MyAcconutNotification />}
        />
        <Route path="/MyAccountAddress" element={<MyAccountAddress />} />
        <Route
          path="/MyAccountForgetPassword"
          element={<MyAccountForgetPassword />}
        />
        <Route path="/MyAccountSignIn" element={<MyAccountSignIn />} />
        <Route path="/MyAccountSignUp" element={<MyAccountSignUp />} />
        <Route
          path="/reset-password/:resetToken"
          element={<MyAccountPasswordReset />}
        />

        {/* About pages */}
        <Route path="/Blog" element={<Blog />} />
        <Route path="/BlogCategory" element={<BlogCategory />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        {/* Seller panel */}
        <Route path="/seller-panel" element={<SellerPanel />} />
        {/* Admin panel */}
        <Route path="/admin-panel" element={<AdminPanel />} />
        {/*Payment sucess and failure pages */}
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order-failed" element={<OrderFailed />} />
      </Routes>

      {/* Conditionally render Footer */}
      {!hideHeaderAndFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <AppContent />
    </Router>
  );
};

export default App;
