import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentStatus.css"; // Import a CSS file for styling

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/MyAccountOrder");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="payment-status-container success">
      <h1>Payment Successful!</h1>
      <p>Your payment was processed successfully.</p>
      <p>Redirecting to your orders page...</p>
    </div>
  );
};

export default PaymentSuccess;
