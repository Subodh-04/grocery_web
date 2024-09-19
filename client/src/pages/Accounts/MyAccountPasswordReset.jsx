import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const MyAccountPasswordReset = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { resetToken } = useParams();
  const navigate=useNavigate();

  console.log("Reset Token:", resetToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.post(
        `http://localhost:5000/api/auth/user/changepass/${resetToken}`,
        { newPassword: password },
      );

      setMessage(response.data.message || "Password reset successful");
      toast.success("Password Reset Successful.Redirecting to SignIn Page");
      localStorage.removeItem("userData");
      navigate("/MyAccountSignIn")
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred while resetting password"
      );
    }
  };

  return (
    <div className="container">
      <h2 className="text-center mb-4">Reset Your Password</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default MyAccountPasswordReset;
