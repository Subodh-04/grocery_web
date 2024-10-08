import React, { useEffect, useState } from "react";
import { FaUsers, FaChartLine, FaUserShield } from "react-icons/fa";
import { AiOutlineLogout } from "react-icons/ai";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { MagnifyingGlass } from "react-loader-spinner";
import {
  BsFillBellFill,
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
} from "react-icons/bs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { toast } from "react-toastify";
import "./adminpanel.css";
import { fetchStoreDetails, fetchUserDetails, getUserToken } from "../../api";

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("sales");
  const [users, setUsers] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [loaderStatus, setLoaderStatus] = useState(false);
  const [loggeduser, setLoggedUser] = useState([]);
  const [userDetails, setUserDetails] = useState({
    userName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleUpateUserDetails = async () => {
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
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          name: user.data.username || "",
          email: user.data.email || "",
          phone: user.data.phone || "",
        }));
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

      toast.success(response.data.message);
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
      console.log("password updated successfully", response.data);
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
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllUsers();
  }, []);

  const fetchUsers = async () => {
    setLoaderStatus(true);
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoaderStatus(false);
    }
  };
  const unverifiedSellers = usersData.filter((user) => !user.verified);
  const verifiedSellers = usersData.filter((user) => user.verified);
  const fetchAllUsers = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.get(
        "http://localhost:5000/api/admin/allusers",
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      setUsersData(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoaderStatus(false);
    }
  };

  const [selectedRole, setSelectedRole] = useState("all");

  // Filter the users based on the selected role
  const filteredUsers =
    selectedRole === "all"
      ? usersData
      : usersData.filter((user) => user.role === selectedRole);

  const generateDummyData = () => {
    const today = new Date();
    const salesArray = [];
    let lastTotalSales = 500;
    let lastDeliveryCost = 50;
    let lastOrderCount = 5;

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const formattedDate = date.toLocaleDateString();

      // Randomly decide whether the values increase or decrease
      const salesChange =
        (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 90);
      const deliveryCostChange =
        (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 30);
      const orderCountChange =
        (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);

      // Ensure the values don't go below a minimum threshold
      lastTotalSales = Math.max(200, lastTotalSales + salesChange);
      lastDeliveryCost = Math.max(20, lastDeliveryCost + deliveryCostChange);
      lastOrderCount = Math.max(1, lastOrderCount + orderCountChange);

      salesArray.push({
        name: formattedDate,
        totalSales: lastTotalSales,
        totalDeliveryCost: lastDeliveryCost,
        orderCount: lastOrderCount,
      });
    }

    return salesArray;
  };

  const [salesData, setSalesData] = useState({
    productsCount: 300,
    customersCount: 154,
    totalSales: 40000,
    salesArray: generateDummyData(),
  });

  useEffect(() => {
    if (activeSection === "sales") {
      // Fetch sales report data
      const userData = JSON.parse(localStorage.getItem("userData"));
      axios
        .get("http://localhost:5000/api/admin/sales-reports", {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        })
        .then((response) => {
          setSalesData({
            productsCount: response.data.data.productsCount,
            customersCount: response.data.data.customersCount,
            totalSales: response.data.data.totalSalesAmount,
            salesArray: response.data.data.salesArray,
          });
        })
        .catch((error) => {
          console.error("Error fetching sales data", error);
        });
    }
  }, [activeSection]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    toast.success("Logged out successfully!");
    navigate("/MyAccountSignIn");
  };

  const handleVerifySeller = async (userId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.patch(
        `http://localhost:5000/api/admin/verify/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      toast.success(response.data.message);
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("Error verifying seller:", error);
    }
  };

  const data = [
    { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
    { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
    { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
    { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
    { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
    { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
    { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
  ];

  // State to hold selected user details and modal visibility
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const token = getUserToken();

  const handleViewDetails = async (userId) => {
    try {
      // Fetch user details first
      const userDetails = await fetchUserDetails(userId, token);

      // Initialize storeDetails as null
      let storeDetails = null;

      // Now fetch store details if the user is a seller and has a storeId
      if (userDetails.role === "seller" && userDetails.storeId) {
        storeDetails = await fetchStoreDetails(userDetails.storeId, token); // Fetch store details
      }

      // Combine the user and store details
      const combinedData = {
        ...userDetails,
        storeDetails: storeDetails ? storeDetails.data : null, // Store details will be null if user is not a seller
      };

      // Set the combined data to state
      setSelectedUser(combinedData);
      setShowUserModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  return (
    <div className="container-fluid" style={{ position: "fixed" }}>
      <div className="row">
        <div className="col-md-2 bg-light d-flex flex-column p-3 vh-100">
          <div className="flex-grow-1">
            <ul className="nav flex-column">
              <li className="nav-item mb-4">
                <h2 className="fw-bold">AdminPanel</h2>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={() => handleSectionChange("sales")}
                >
                  <FaChartLine className="me-2" /> Sales Reports
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={() => handleSectionChange("users")}
                >
                  <FaUsers className="me-2" /> Users
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={() => handleSectionChange("sellers")}
                >
                  <FaChartLine className="me-2" /> Sellers Verify
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={() => handleSectionChange("profile")}
                >
                  <FaUserShield className="me-2" /> Profile
                </Link>
              </li>
            </ul>
          </div>
          <div className="mt-auto">
            <button
              className="btn w-100"
              id="custom-logout-btn"
              onClick={handleLogout}
            >
              <AiOutlineLogout className="me-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-10 p-4">
          {loaderStatus ? (
            <div className="loader-container">
              <MagnifyingGlass
                visible={true}
                height="80"
                width="80"
                ariaLabel="MagnifyingGlass-loading"
                wrapperStyle={{}}
                wrapperClass="MagnifyingGlass-wrapper"
                glassColor="#c0efff"
                color="#e15b64"
              />
            </div>
          ) : (
            <div className="content">
              {activeSection === "users" && (
                <section className="users-section">
                  <h3 className="mb-4">Users</h3>

                  {/* Role Filter Dropdown */}
                  <div className="mb-4 d-flex align-items-center">
                    <label htmlFor="roleFilter" className="mr-3">
                      Filter by Role:
                    </label>
                    <select
                      id="roleFilter"
                      className="form-control w-auto"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>

                  {/* Users Cards */}
                  <div
                    className="row"
                    style={{ maxHeight: "520px", overflowY: "auto" }}
                  >
                    {filteredUsers.map((user) => (
                      <div className="col-md-4 mb-4" key={user.id}>
                        <div className="card h-100 shadow-sm">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="card-title">{user.username}</h5>
                              <span
                                className={`badge ${
                                  user.verified
                                    ? "badge-success"
                                    : "badge-danger"
                                }`}
                              >
                                {user.verified ? "Verified" : "Not Verified"}
                              </span>
                            </div>
                            <p className="card-text">
                              <strong>Email:</strong> {user.email}
                            </p>
                            <p className="card-text">
                              <strong>Role:</strong> {user.role}
                            </p>
                            <p className="card-text">
                              <strong>Phone:</strong> {user.phone}
                            </p>
                          </div>
                          <div className="card-footer d-flex justify-content-between">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleViewDetails(user.id)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* User Details Modal */}
                  {showUserModal && selectedUser && (
                    <div className="modal show d-block" tabIndex="-1">
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">User Details</h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={handleCloseModal}
                            ></button>
                          </div>
                          <div className="modal-body">
                            <div className="mb-2">
                              <strong>Name:</strong> {selectedUser.username}
                            </div>
                            <div className="mb-2">
                              <strong>Email:</strong> {selectedUser.email}
                            </div>
                            <div className="mb-2">
                              <strong>Phone:</strong> {selectedUser.phone}
                            </div>

                            {/* Render address fields if address exists */}
                            {selectedUser.address &&
                              selectedUser.address.length > 0 && (
                                <>
                                  {selectedUser.address.map((addr) => (
                                    <div key={addr._id} className="mb-2">
                                      <strong>Address:</strong> {addr.street},{" "}
                                      {addr.city}, {addr.state}, {addr.zip},{" "}
                                      {addr.country}
                                    </div>
                                  ))}
                                </>
                              )}

                            <div className="mb-2">
                              <strong>Role:</strong> {selectedUser.role}
                            </div>

                            {/* Show store details only if user is a seller and storeDetails exists */}
                            {selectedUser.role === "seller" &&
                              selectedUser.storeDetails && (
                                <>
                                  <div className="mb-2">
                                    <strong>Store Name:</strong>{" "}
                                    {selectedUser.storeDetails.storeName}
                                  </div>
                                  <div className="mb-2">
                                    <strong>Store Location:</strong>{" "}
                                    {selectedUser.storeDetails.storeLocation}
                                  </div>
                                  <div className="mb-2">
                                    <strong>Delivery Options:</strong>{" "}
                                    {selectedUser.storeDetails.deliveryOptions}
                                  </div>
                                  <div className="mb-2">
                                    <strong>Proximity:</strong>{" "}
                                    {selectedUser.storeDetails.proximity}
                                  </div>
                                  <div className="mb-2">
                                    <strong>Categories:</strong>{" "}
                                    {selectedUser.storeDetails.categories.join(
                                      ", "
                                    )}
                                  </div>
                                </>
                              )}
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={handleCloseModal}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {activeSection === "sales" && (
                <section className="container my-4">
                  <h3 className="mb-4 text-primary">Sales Reports</h3>
                  <div className="mb-4">
                    <h3 className="text-secondary">DASHBOARD</h3>
                  </div>

                  <div className="row">
                    <div className="col-md-3 mb-4">
                      <div className="card custom-card shadow-sm">
                        <div className="card-body d-flex align-items-center">
                          <div className="card-icon bg-primary text-white rounded-circle p-3">
                            <BsFillArchiveFill />
                          </div>
                          <div className="ms-3">
                            <h5 className="card-title">PRODUCTS</h5>
                            <h1 className="card-footer text-primary">
                              {salesData.productsCount}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3 mb-4">
                      <div className="card custom-card shadow-sm">
                        <div className="card-body d-flex align-items-center">
                          <div className="card-icon bg-success text-white rounded-circle p-3">
                            <BsFillGrid3X3GapFill />
                          </div>
                          <div className="ms-3">
                            <h5 className="card-title">CATEGORIES</h5>
                            <h1 className="card-footer text-success">12</h1>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3 mb-4">
                      <div className="card custom-card shadow-sm">
                        <div className="card-body d-flex align-items-center">
                          <div className="card-icon bg-info text-white rounded-circle p-3">
                            <BsPeopleFill />
                          </div>
                          <div className="ms-3">
                            <h5 className="card-title">CUSTOMERS</h5>
                            <h1 className="card-footer text-info">
                              {salesData.customersCount}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3 mb-4">
                      <div className="card custom-card shadow-sm">
                        <div className="card-body d-flex align-items-center">
                          <div className="card-icon bg-danger text-white rounded-circle p-3">
                            <BsFillBellFill />
                          </div>
                          <div className="ms-3">
                            <h5 className="card-title">Total Sales</h5>
                            <h1 className="card-footer text-danger">
                              {salesData.totalSales}&#8377;
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <div className="w-50 pe-2">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={salesData.salesArray}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="totalSales" fill="#8884d8" />
                          <Bar dataKey="totalDeliveryCost" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="w-50 ps-2">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={salesData.salesArray}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="totalSales"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="totalDeliveryCost"
                            stroke="#82ca9d"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === "sellers" && (
                <section className="sellers-section">
                  <h3 className="mb-4">Sellers Verification</h3>

                  {/* Unverified Sellers Section */}
                  {unverifiedSellers.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-danger">Unverified Sellers</h4>
                      <ul className="list-group list-unstyled">
                        {unverifiedSellers.map((user) => (
                          <li
                            key={user._id}
                            className="list-group-item py-3 px-4 mb-3 shadow-sm bg-white"
                            style={{
                              borderLeft: "6px solid #dc3545",
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h5 className="text-danger">{user.userName}</h5>
                                <p className="mb-1">{user.email}</p>
                                <span className="badge badge-warning">
                                  Unverified Seller
                                </span>
                              </div>
                              <button
                                className="btn btn-primary"
                                onClick={() => handleVerifySeller(user.id)}
                              >
                                Verify Seller
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Verified Sellers Section */}
                  {verifiedSellers.length > 0 && (
                    <div className="mt-5">
                      <h4 className="mb-3 text-success">Verified Sellers</h4>
                      <ul
                        className="list-group list-unstyled"
                        style={{ maxHeight: "330px", overflowY: "auto" }}
                      >
                        {verifiedSellers.map((user) => (
                          <li
                            key={user._id}
                            className="list-group-item py-3 px-4 mb-3 shadow-sm bg-light"
                            style={{
                              borderLeft: "6px solid #28a745",
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center flex-row">
                              <div>
                                <h5 className="text-success">
                                  {user.userName}
                                </h5>
                                <p className="mb-1">{user.email}</p>
                              </div>
                              <span className="badge badge-success">
                                Verified Seller
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {activeSection === "profile" && (
                <section>
                  <div className="container main-content">
                    <div className="row">
                      <div className="col-12">
                        <div className="p-6 d-flex justify-content-between align-items-center d-md-none">
                          <h3 className="fs-5 mb-0 ">Account Setting</h3>
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
                              <h1 className="fw-bold">Admin Profile</h1>
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
                                      <label className="form-label">
                                        Email
                                      </label>
                                      <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={userDetails.email}
                                        onChange={handleInputChange}
                                      />
                                    </div>
                                    <div className="mb-5">
                                      <label className="form-label">
                                        Phone
                                      </label>
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
                                        onClick={handleUpateUserDetails}
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
                                  <label className="form-label">
                                    New Password
                                  </label>
                                  <input
                                    type="password"
                                    className="form-control"
                                    name="newPassword"
                                    value={userDetails.newPassword}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="mb-3 col">
                                  <label className="form-label">
                                    Current Password
                                  </label>
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
                                      onClick={() =>
                                        handlePasswordResetRequest()
                                      }
                                    >
                                      {" "}
                                      Reset your password
                                    </Link>
                                    .
                                  </p>
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handlePasswordUpdate()}
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
                                Permanently delete your account and all of your
                                content. This action is not reversible.
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
