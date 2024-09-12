import React, { useState } from "react";
import forgetpassword from "../../images/fp-g.svg";
import { Link } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import axios from "axios";
import { toast } from "react-toastify";

const MyAccountForgetPassword = () => {
  const [email, setEmail] = useState("");
  const handleForgotPassword=async(e)=>{
    e.preventDefault();
    try {
      const response=await axios.post("http://localhost:5000/api/auth/user/resetpass",{email});
      
      if(!response){
        toast.error(response.data.message);
      }
      toast.info(response.data.message);
      console.log("Password Change Mail Send to the User");
    } catch (error) {
      console.log("Error While forget Password:",error);
    }
  }
  return (
    <div>
       <>
            <ScrollToTop/>
            </>
      <>
        {/* section */}
        <section className="my-lg-14 my-8">
          {/* container */}
          <div className="container">
            {/* row */}
            <div className="row justify-content-center align-items-center">
              <div className="col-12 col-md-6 col-lg-4 order-lg-1 order-2">
                {/* img */}
                <img
                  src={forgetpassword}
                  alt="freshcart"
                  className="img-fluid"
                />
              </div>
              <div className="col-12 col-md-6 offset-lg-1 col-lg-4 order-lg-2 order-1 d-flex align-items-center">
                <div>
                  <div className="mb-lg-9 mb-5">
                    {/* heading */}
                    <h1 className="mb-2 h2 fw-bold">Forgot your password?</h1>
                    <p>
                      Please enter the email address associated with your
                      account and We will email you a link to reset your
                      password.
                    </p>
                  </div>
                  {/* form */}
                  <form onSubmit={handleForgotPassword}>
                    {/* row */}
                    <div className="row g-3">
                      {/* col */}
                      <div className="col-12">
                        {/* input */}
                        <input
                          type="email"
                          className="form-control"
                          id="inputEmail4"
                          onChange={(e)=>{setEmail(e.target.value)}}
                          value={email}
                          placeholder="Email"
                          required
                        />
                        <span className="navbar-text">
                          Already have an account?{" "}

                          <Link to="/MyAccountSignIn">Sign in</Link>
                        </span>
                      </div>
                      {/* btn */}
                      <div className="col-12 d-grid gap-2">
                        {" "}
                        <button type="submit" className="btn btn-primary" >
                          Reset Password
                        </button>
                        <Link to="/MyAccountSignUp" className="btn btn-light">
                          Back
                        </Link>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    </div>
  );
};

export default MyAccountForgetPassword;
