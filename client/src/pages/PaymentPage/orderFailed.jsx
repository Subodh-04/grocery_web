import React from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentStatus.css";

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-status-container failure">
      <h1>Payment Failed!</h1>
      <p>There was an issue processing your payment. Please try again.</p>
      <button onClick={() => navigate("/ShopCheckOut")}>Go Back to Checkout</button>
    </div>
  );
};

export default PaymentFailure;
