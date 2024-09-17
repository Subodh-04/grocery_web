import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

const StripePaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const PAISA_PER_INR = 100; // 1 INR = 100 paise

  // Helper function to convert INR to paise
  const convertInrToPaise = (amountInInr) => amountInInr * PAISA_PER_INR;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    try {
      const userData = JSON.parse(localStorage.getItem("userData")); // Fetch user data from localStorage
      const amountInInr = 500; // Example amount in INR
      const amountInPaise = convertInrToPaise(amountInInr); // Convert to paise

      // Step 1: Make a request to your backend to create a Stripe session
      const response = await axios.post(
        "http://localhost:5000/api/order/create-payment-intent", // Your backend API
        { amount: amountInPaise },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`, // Authorization header
          },
        }
      );

      const { id: sessionId } = response.data; // Extract session ID from the backend response

      // Step 2: Redirect to Stripe Checkout page
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        setPaymentError(error.message);
        setPaymentSuccess(null);
      }
    } catch (error) {
      setPaymentError(error.message);
      setPaymentSuccess(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={!stripe}>
        Pay with Stripe
      </button>

      {paymentError && <p style={{ color: "red" }}>{paymentError}</p>}
      {paymentSuccess && <p style={{ color: "green" }}>{paymentSuccess}</p>}
    </form>
  );
};

export default StripePaymentForm;
