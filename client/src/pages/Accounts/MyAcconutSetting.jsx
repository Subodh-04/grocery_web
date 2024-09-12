import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../ScrollToTop";
import axios from "axios";
import { toast } from "react-toastify";

const MyAccountSetting = () => {
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [userDetails, setUserDetails] = useState({
    userName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  const navigate = useNavigate("");

  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);

    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.userId) {
      axios
        .get(`http://localhost:5000/api/auth/user/${userData.userId}`, {
          headers: { Authorization: `Bearer ${userData.token}` },
        })
        .then((response) => {
          setUserDetails((prevDetails) => ({
            ...prevDetails,
            name: response.data.username || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
          }));
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
        });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSaveDetails = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.put(
        "http://localhost:5000/api/auth/user/profile",
        {
          userName: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone,
        },
        {
          headers: { Authorization: `Bearer ${userData.token}` },
        }
      );

      localStorage.setItem(
        "userData",
        JSON.stringify({ ...userData, ...response.data })
      );
      toast.success("Details updated successfully!");
    } catch (error) {
      console.error("Error updating details:", error);
    }
  };
  const [loggeduser, setLoggedUser] = useState([]);
  useEffect(() => {
    const loggeduserDetails = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const user = await axios.get(
          `http://localhost:5000/api/auth/user/${userData.userId}`
        );
        if (!user) {
          console.log("User not found");
        }
        setLoggedUser(user.data);
      } catch (error) {
        console.log("Error :", error);
      }
    };
    loggeduserDetails();
  }, []);

  const handlePasswordResetRequest = async () => {
    try {
      const emails = loggeduser.email;
      console.log(emails);

      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.post(
        "http://localhost:5000/api/auth/user/resetpass",
        { email: emails },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      console.log("password request:", response.data);

      toast.info(response.data.message);
    } catch (error) {
      console.error("Error requesting password reset:", error);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.post(
        "http://localhost:5000/api/auth/user/updatepass/",
        {
          userId: userData.userId,
          currentPassword: userDetails.currentPassword,
          newPassword: userDetails.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      if (!response) {
        toast.error(response.data.message);
        console.log(response.data.message);
      }
      toast.success(response.data.message);
      setUserDetails({
        ...userDetails,
        currentPassword: "",
        newPassword: "",
      });
      console.log("password updated successfully");
    } catch (error) {
      console.log("Error while updating Password:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      await axios.delete(`/api/deleteAccount/${userData.userId}`, {
        headers: { Authorization: `Bearer ${userData.token}` },
      });
      localStorage.removeItem("userData");
      toast.info("Account deleted successfully!");
      window.location.href = "/"; // Redirect to home or login page
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    toast.info("Logged out successfully!");
    navigate("/MyAccountSignIn");
  };

  return (
    <div>
      <ScrollToTop />
      <section>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="p-6 d-flex justify-content-between align-items-center d-md-none">
                <h3 className="fs-5 mb-0">Account Setting</h3>
                <button
                  className="btn btn-outline-gray-400 text-muted d-md-none"
                  type="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasAccount"
                  aria-controls="offcanvasAccount"
                >
                  <i className="fas fa-bars"></i>
                </button>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-12 border-end d-none d-md-block">
              <div className="pt-10 pe-lg-10">
                <ul className="nav flex-column nav-pills nav-pills-dark">
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      aria-current="page"
                      to="/MyAccountOrder"
                    >
                      <i className="fas fa-shopping-bag me-2" />
                      Your Orders
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link active" to="/MyAccountSetting">
                      <i className="fas fa-cog me-2" />
                      Settings
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/MyAccountAddress">
                      <i className="fas fa-map-marker-alt me-2" />
                      Address
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/MyAccountPaymentMethod">
                      <i className="fas fa-credit-card me-2" />
                      Payment Method
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/MyAccountNotification">
                      <i className="fas fa-bell me-2" />
                      Notification
                    </Link>
                  </li>
                  <li className="nav-item">
                    <hr />
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to="/MyAccountSignIn"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt me-2" />
                      Log out
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-9 col-md-8 col-12">
              {loaderStatus ? (
                <div className="loader-container">
                  <MagnifyingGlass
                    visible={true}
                    height="100"
                    width="100"
                    ariaLabel="magnifying-glass-loading"
                    wrapperStyle={{}}
                    wrapperclassName="magnifying-glass-wrapper"
                    glassColor="#c0efff"
                    color="#0aad0a"
                  />
                </div>
              ) : (
                <div className="p-6 p-lg-10">
                  <div className="mb-6">
                    <h2 className="mb-0">Account Setting</h2>
                  </div>
                  <div>
                    <h5 className="mb-4">Account details</h5>
                    <div className="row">
                      <div className="col-lg-5">
                        <form>
                          <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="name"
                              value={userDetails.name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              name="email"
                              value={userDetails.email}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="mb-5">
                            <label className="form-label">Phone</label>
                            <input
                              type="text"
                              className="form-control"
                              name="phone"
                              value={userDetails.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="mb-3">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleSaveDetails}
                            >
                              Save Details
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <hr className="my-10" />
                  <div className="pe-lg-14">
                    <h5 className="mb-4">Password</h5>
                    <form className="row row-cols-1 row-cols-lg-2">
                      <div className="mb-3 col">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="newPassword"
                          value={userDetails.newPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-3 col">
                        <label className="form-label">Current Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="currentPassword"
                          value={userDetails.currentPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-12">
                        <p className="mb-4">
                          Can’t remember your current password?
                          <Link
                            to=""
                            onClick={() => handlePasswordResetRequest()}
                          >
                            {" "}
                            Reset your password
                          </Link>.
                        </p>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handlePasswordUpdate}
                        >
                          Change Password
                        </button>
                      </div>
                    </form>
                  </div>
                  <hr className="my-10" />
                  <div>
                    <h5 className="mb-4">Delete Account</h5>
                    <p className="mb-4">
                      Permanently delete your account and all of your content.
                      This action is not reversible.
                    </p>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyAccountSetting;
