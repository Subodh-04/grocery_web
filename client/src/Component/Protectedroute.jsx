import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const Protectedroute = () => {
  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    if (!data) {
      const timer = setTimeout(() => {
        navigate("/MyAccountSignIn");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [data, navigate]);

  return data ? (
    <Outlet />
  ) : (
    <div className="payment-status-container failure">
      <h1>User Not Logged in!</h1>
      <p>Redirecting to the login page .</p>
    </div>
  );
};

export default Protectedroute;
