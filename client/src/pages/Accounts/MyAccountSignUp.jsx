import React, { useState } from "react";
import signupimage from "../../images/signup-g.svg";
import { Link, useNavigate } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import axios from "axios";
import { toast } from "react-toastify";

const MyAccountSignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const SubmitData = async (e) => {
    e.preventDefault();

    try {
      const { firstName, lastName, email, phone, password } = formData;

      const role = localStorage.getItem("role");
      const userName = `${firstName} ${lastName}`;

      const response = await axios.post("http://localhost:5000/api/auth/", {
        userName,
        email,
        phone,
        password,
        role: role,
      });

      if (response) {
        console.log("user details ", response.data);
        toast.success(response.data.message);

        setTimeout(() => {
          localStorage.removeItem("role");
          navigate("/MyAccountSignIn");
        }, 1000); // 1.5 seconds delay
      }
    } catch (error) {
      console.log("Registration error:", error);
      toast.error(error.response.data.extraDetails);
    }
  };

  return (
    <div>
      <ScrollToTop />
      <section className="my-lg-14 my-8">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-12 col-md-6 col-lg-4 order-lg-1 order-2">
              <img src={signupimage} alt="freshcart" className="img-fluid" />
            </div>
            <div className="col-12 col-md-6 offset-lg-1 col-lg-4 order-lg-2 order-1">
              <div className="mb-lg-9 mb-5">
                <h1 className="mb-1 h2 fw-bold">Get Start Shopping</h1>
                <p>Welcome to FreshCart! Enter your email to get started.</p>
              </div>
              <form onSubmit={SubmitData}>
                <div className="row g-3">
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
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
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="text"
                      className="form-control"
                      id="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 d-grid">
                    <button type="submit" className="btn btn-primary">
                      Register
                    </button>
                    <span className="navbar-text">
                      Already have an account?{" "}
                      <Link to="/MyAccountSignIn">Sign in</Link>
                    </span>
                  </div>
                  <p>
                    <small>
                      By continuing, you agree to our{" "}
                      <Link to="#!">Terms of Service</Link> &amp;{" "}
                      <Link to="#!">Privacy Policy</Link>
                    </small>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyAccountSignUp;
