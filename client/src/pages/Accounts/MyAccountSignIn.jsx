import React, { useState } from "react";
import signinimage from "../../images/signin-g.svg";
import { Link, useNavigate } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import { toast } from "react-toastify";
import { loginUser } from "../../api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const MyAccountSignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [hide, setHide] = useState(true);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { email, password } = formData;
      const response = await loginUser(email, password);
      if (response) {
        localStorage.setItem("userData", JSON.stringify(response));

        toast.success("Login Successful");

        if (response.role === "seller") {
          navigate("/seller-panel");
        } else if (response.role === "admin") {
          navigate("/admin-panel");
        } else {
          navigate("/Grocery-react/");
        }
      }
    } catch (error) {
      console.log("Login Error:", error.response?.data || error.message);
    }
  };

  return (
    <div>
      <ScrollToTop />
      <section className="my-lg-14 my-8">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-12 col-md-6 col-lg-4 order-lg-1 order-2">
              <img src={signinimage} alt="freshcart" className="img-fluid" />
            </div>
            <div className="col-12 col-md-6 offset-lg-1 col-lg-4 order-lg-2 order-1">
              <div className="mb-lg-9 mb-5">
                <h1 className="mb-1 h2 fw-bold">Sign in to FreshFinds</h1>
                <p>
                  Welcome back to FreshFinds! Enter your email to get started.
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <div className="input-group">
                      <input
                        type={hide ? "password" : "text"}
                        className="form-control"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                      />
                      <button
                        type="button"
                        className="btn border text-center"
                        onClick={() => setHide(!hide)}
                      >
                        {hide ? (
                          <FaEye className="bg-white mb-1" />
                        ) : (
                          <FaEyeSlash className="bg-white mb-1" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="flexCheckDefault"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="flexCheckDefault"
                      >
                        Remember me
                      </label>
                    </div>
                    <div>
                      Forgot password?{" "}
                      <Link to="/MyAccountForgetPassword">Reset it</Link>
                    </div>
                  </div>
                  <div className="col-12 d-grid">
                    <button type="submit" className="btn btn-primary">
                      Sign In
                    </button>
                  </div>
                  <div>
                    Don’t have an account?{" "}
                    <Link to="/MyAccountSignUp"> Sign Up</Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyAccountSignIn;
