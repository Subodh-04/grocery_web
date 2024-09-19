import React, { useEffect, useState } from "react";
import {
  FaBoxes,
  FaProductHunt,
  FaShoppingCart,
  FaChartLine,
  FaUser,
} from "react-icons/fa";
import { AiOutlineLogout } from "react-icons/ai";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../App.css";
import { MagnifyingGlass } from "react-loader-spinner";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

export default function SellerPanel() {
  const [activeSection, setActiveSection] = useState("overview");
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [userDetails, setUserDetails] = useState({
    userName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });
  const [category, setCategory] = useState([]);
  const handleAddCategory = () => {
    if (category.trim() !== "") {
      setStoreDetails({
        ...storeDetails,
        categories: [...storeDetails.categories, category.trim()],
      });
      setCategory(""); // Clear the input field
    }
  };
  const handleRemoveCategory = (index) => {
    setStoreDetails((prevState) => ({
      ...prevState,
      categories: prevState.categories.filter((_, i) => i !== index),
    }));
  };
  const handleCategoryInputChange = (e) => {
    setCategory(e.target.value);
  };
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };
  const [loggeduser, setLoggedUser] = useState([]);
  const [hasStore, setHasStore] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addproductmodal, setAddProductModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalproducts, setTotalProducts] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [viewDetails, setViewDetails] = useState([]);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);

  const [storeDetails, setStoreDetails] = useState({
    storeName: "",
    storeLocation: "",
    deliveryOptions: "",
    proximity: "",
    categories: [],
    deliverySlots: [],
    pickupAvailable: false,
  });

  const [productdet, setProductDet] = useState({
    name: "",
    type: "",
    description: "",
    price: "",
    quantity: "",
    department: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const checkStoreStatus = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));

        if (userData && userData.userId) {
          // Fetch user details using userId
          const response = await axios.get(
            `http://localhost:5000/api/auth/user/${userData.userId}`
          );

          const user = response.data;

          if (!user.store) {
            setHasStore(false);
          } else {
            setHasStore(true);
          }

          setUserDetails((prevDetails) => ({
            ...prevDetails,
            name: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
          }));
        }
      } catch (error) {
        console.log("Error fetching user details:", error);
      } finally {
        setLoaderStatus(false);
      }
    };

    checkStoreStatus();
  }, []); // No dependencies here to ensure it runs once on component mount or login

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

  useEffect(() => {
    if (hasStore === false) {
      setShowModal(true);
    }
  }, [hasStore]);

  useEffect(() => {
    const fetchstoredetails = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (hasStore === true) {
        const storeres = await axios.get(
          `http://localhost:5000/api/store/${userData.store}`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );

        setStoreDetails(storeres.data.data);
      }
    };
    fetchstoredetails();
  }, [hasStore]);

  const handleUpdateStore = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.put(
        `http://localhost:5000/api/store/${userData.store}`,
        storeDetails,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      setShowModal(false);
      toast.success(response.data.message);
    } catch (error) {
      console.log("updating failed", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleStoreInputChange = (e) => {
    const { name, value } = e.target;
    setStoreDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductDet((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // New function to handle store creation
  const handleStoreCreationSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.post(
        "http://localhost:5000/api/store/",
        {
          ...storeDetails,
          seller: userData.userId,
        },
        {
          headers: { Authorization: `Bearer ${userData.token}` },
        }
      );

      if (response.status === 201) {
        toast.success("Store created successfully!");
        setHasStore(true);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error creating store:", error);
      toast.error("Failed to create store.");
    }
  };
  //update user details
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
      toast.info("Details updated successfully!");
    } catch (error) {
      console.error("Error updating details:", error);
    }
  };

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
  //update userpassword
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
      toast.success("Account deleted successfully!");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    toast.success("Logged out successfully!");
    navigate("/MyAccountSignIn");
  };

  const handleStoreCreation = () => {
    setShowModal(false);
    handleSectionChange("mystore");
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...storeDetails.deliverySlots];
    newSlots[index][field] = value;
    setStoreDetails((prev) => ({
      ...prev,
      deliverySlots: newSlots,
    }));
  };

  const handleAddSlot = () => {
    setStoreDetails((prev) => ({
      ...prev,
      deliverySlots: [
        ...prev.deliverySlots,
        { label: "", cost: "", type: "Paid" },
      ],
    }));
  };

  const handleRemoveSlot = (index) => {
    const newSlots = storeDetails.deliverySlots.filter((_, i) => i !== index);
    setStoreDetails((prev) => ({
      ...prev,
      deliverySlots: newSlots,
    }));
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get(
          "http://localhost:5000/api/seller/product/Inventory",
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );
        if (!response) {
          console.log("Error:", response.data.message);
        }

        setProducts(response.data.data);
        setTotalProducts(response.data.totalProducts);
      } catch (error) {
        console.log("Error Fetching Products", error);
      }
    };

    fetchProduct();
  }, [products, productdet, totalproducts]);

  const [image, setImage] = useState("");
  const handleImageChange = async (image) => {
    if (!image) {
      toast.info("Please select an image");
      return;
    }

    if (image.type === "image/jpeg" || image.type === "image/png") {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "mern-chat-app");
      data.append("cloud_name", "dsuxj7rdd");

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dsuxj7rdd/image/upload",
          data
        );
        setImage(response.data.url.toString());
      } catch (err) {
        console.error(err);
        toast.error("Image upload failed. Please try again.");
      }
    } else {
      toast.info("Please upload a JPEG or PNG image");
    }
  };

  const handleaddProduct = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const sellerid = userData.userId;
      const storeid = userData.store;

      const productPayload = {
        ...productdet,
        prod_img: image,
        seller: sellerid,
        store: storeid,
      };

      const response = await axios.post(
        "http://localhost:5000/api/product/",
        productPayload,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      setAddProductModal(false);
      toast.success(response.data.message);
      setProductDet({
        name: "",
        prod_img: "",
        type: "",
        description: "",
        price: 0,
        quantity: 0,
        department: "",
      });
      setImage(null);
    } catch (error) {
      console.log(
        "Error Adding Product:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.delete(
        `http://localhost:5000/api/product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      if (response.data.success === true) {
        toast.success(response.data.message);
        console.log(response.data.message);
      }
      toast.success(response.data.message);
    } catch (error) {
      console.log("Internal Server Error", error);
    }
  };

  const handleEditProduct = (productId) => {
    const product = products.find((prod) => prod._id === productId);
    if (product) {
      setProductDet({
        name: product.name,
        prod_img: product.prod_img,
        type: product.type,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        department: product.department,
      });
      setImage(product.prod_img);
      setEditingProductId(productId);
      setIsEditing(true); // Set the editing state to true
      setAddProductModal(true); // Open the modal
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));

      const productPayload = {
        ...productdet,
        prod_img: image,
      };

      const response = await axios.put(
        `http://localhost:5000/api/product/${editingProductId}`,
        productPayload,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      console.log("Updated Product Successfully:", response.data);
      setAddProductModal(false);
      toast.success("Product updated successfully!");

      // Reset states after saving
      setProductDet({
        name: "",
        prod_img: "",
        type: "",
        description: "",
        price: 0,
        quantity: 0,
        department: "",
      });
      setImage(null);
      setIsEditing(false);
      setEditingProductId(null);
    } catch (error) {
      console.log(
        "Error Updating Product:",
        error.response ? error.response.data : error.message
      );
    }
  };



  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get(
          "http://localhost:5000/api/seller/orders/summary",
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );

        if (!response || !response.data.success) {
          console.log(response.data.message);
        } else {
          setOrders(response.data.data); // Assuming response.data.data contains the list of orders
          setTotalOrders(response.data.total);
          setPendingOrders(response.data.pending);
          setCompletedOrders(response.data.completed);
        }
      } catch (error) {
        console.log("Error while fetching Orders:", error);
      }
    };

    fetchOrders();
  }, [orders]);
  // Add dependencies here

  const handleStatusChange = async (orderId, productId, newStatus) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.put(
        "http://localhost:5000/api/seller/productstatus",
        {
          orderId,
          productId,
          newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${userData?.token}`, // Ensure the token exists
          },
        }
      );
  
      if (response.data) {
        // Update the state if the response is successful
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order._id === orderId) {
              return {
                ...order,
                products: order.products.map((product) =>
                  product.productId === productId
                    ? { ...product, status: newStatus }
                    : product
                ),
              };
            }
            return order;
          })
        );
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
  
      // Handle specific errors
      if (error.response && error.response.data) {
        console.error("API response error:", error.response.data.message);
      }
    }
  };
  const [orderDetails, setOrderDetails] = useState(null);

  const fetchOrderDetails = async (orderId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.get(
        `http://localhost:5000/api/product/orders/summary/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      console.log(response.data);
      setOrderDetails(response.data.data || {});
    } catch (error) {
      console.log("Error Fetching Order Details:", error);
    }
  };
  
  const handlePrint = () => {
    if (!orderDetails || !orderDetails.products) {
      console.log("Order details are not available.");
      return;
    }
  
    const printWindow = window.open("", "", "width=800,height=600");
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .container { padding: 20px; }
            .row { margin-bottom: 20px; }
            .text-end { text-align: right; }
            .text-muted { color: #6c757d; }
            .badge { display: inline-block; padding: 0.35em 0.65em; font-size: 75%; font-weight: 700; line-height: 1; color: #fff; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: 0.25rem; }
            .bg-success { background-color: #28a745; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            table, th, td { border: 1px solid #dee2e6; }
            th, td { padding: 12px; text-align: left; }
            .invoice-header { display: flex; justify-content: space-between; }
            .invoice-header h2 { margin-bottom: 5px; }
            .invoice-header p { margin: 0; }
            .invoice-details { margin-top: 20px; }
            .invoice-summary { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .invoice-summary h5 { margin-bottom: 10px; }
            .invoice-total { font-weight: bold; background-color: #e9ecef; padding: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="invoice-header">
              <div>
                <h2>Invoice</h2>
              </div>
              <div class="text-end">
                <p>Invoice Date: ${new Date().toLocaleDateString()}</p>
                <p>Order No: #${orderDetails.orderId}</p>
                <p>Status: ${orderDetails.status}</p>
              </div>
            </div>
  
            <div class="invoice-details">
              <h5>Billed To:</h5>
              <p>
                ${orderDetails.buyer.customerName || "N/A"} <br/>
                ${orderDetails.buyer.email || "N/A"} <br/>
                ${orderDetails.buyer.phone || "N/A"} <br/>
                ${orderDetails.buyer.address.street || "N/A"}, ${orderDetails.buyer.address.city || "N/A"}, 
                ${orderDetails.buyer.address.postalCode || "N/A"}, ${orderDetails.buyer.address.country || "N/A"}
              </p>
            </div>
  
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderDetails.products.map((product, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${product.productName || "N/A"}</td>
                    <td>${product.productPrice || 0}&#8377;</td>
                    <td>${product.quantity || 0}</td>
                    <td>${(product.productPrice * product.quantity) || 0}&#8377;</td>
                  </tr>
                `).join("")}
                <tr>
                  <td colspan="4" class="invoice-total">Subtotal</td>
                  <td>${(orderDetails.totalAmount - orderDetails.deliveryCost) || 0}&#8377;</td>
                </tr>
                <tr>
                  <td colspan="4" class="invoice-total">Shipping Charge</td>
                  <td>${orderDetails.deliveryCost || 0}&#8377;</td>
                </tr>
                <tr>
                  <td colspan="4" class="invoice-total">Grand Total</td>
                  <td>${orderDetails.totalAmount || 0}&#8377;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  

  return (
    <div className="container-fluid" style={{ position: "fixed" }}>
      <div className="row">
        <div className="col-md-2 bg-light d-flex flex-column p-3 vh-100">
          <div className="flex-grow-1">
            <ul className="nav flex-column">
              <li className="nav-item mb-4">
                <h2 className="fw-bold">FreshFinds</h2>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link active"
                  to="#"
                  onClick={() => handleSectionChange("overview")}
                >
                  <FaChartLine className="me-2" /> Overview
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={() => handleSectionChange("product")}
                >
                  <FaProductHunt className="me-2" /> Product
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={() => handleSectionChange("mystore")}
                >
                  <FaBoxes className="me-2" /> My Store
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={() => handleSectionChange("orders")}
                >
                  <FaShoppingCart className="me-2" /> Order Status
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={() => handleSectionChange("profile")}
                >
                  <FaUser className="me-2" /> Profile
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
          {showModal && (
            <div
              className="modal fade show"
              id="exampleModalCenter"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="exampleModalCenterTitle"
              aria-hidden="true"
              style={{ display: "block" }}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLongTitle">
                      Create Your Store
                    </h5>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                      onClick={() => setShowModal(false)}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <p>Would you like to create your store now?</p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleStoreCreation}
                    >
                      Yes, Create Store
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              {activeSection === "overview" && hasStore && (
                <div>
                  <h1 className="fw-bold">Overview</h1>
                  <div className="card py-3 border-0 mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-0">Earnings: 13,210 TK April</p>
                        <p className="mb-0">Total Sales: 15 pcs April</p>
                      </div>
                      <div>
                        <h2>Current Balance: 98,961.33 TK</h2>
                        <button className="btn btn-primary">
                          Withdraw Now
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Example of additional stats */}
                  <div className="row">
                    <div className="col-lg-4 col-md-6 mb-4">
                      <div className="card p-3">
                        <h5 className="fw-bold">{totalproducts}</h5>
                        <p>All Products</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 mb-4">
                      <div className="card p-3">
                        <h5 className="fw-bold">15</h5>
                        <p>Sales Products</p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 mb-4">
                      <div className="card p-3">
                        <h5 className="fw-bold">16</h5>
                        <p>New Orders</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Sold Products */}
                  <div className="card p-3 mb-4">
                    <h4 className="fw-bold mb-3">Recent Sold</h4>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="mb-0">Body Parts</p>
                            <small className="text-muted">
                              Category: Car Care
                            </small>
                          </div>
                          <div>
                            <p className="mb-0">900 TK</p>
                            <small className="text-muted">
                              Date: 15/03/2022
                            </small>
                          </div>
                          <div>
                            <span className="badge bg-warning">Processing</span>
                          </div>
                        </div>
                      </li>
                      {/* Repeat the above list item for each sold product */}
                    </ul>
                  </div>

                  {/* Top Categories */}
                  <div className="card p-3">
                    <h4 className="fw-bold mb-3">Top Categories</h4>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="mb-0">Oil Filter</p>
                          <p className="mb-0">1308</p>
                        </div>
                      </li>
                      {/* Repeat the above list item for each category */}
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === "product" && hasStore && (
                <div>
                  <div className="row mb-5">
                    <h1 className="fw-bold col">Product Management</h1>
                    <button
                      className="btn btn-primary rounded-4 m-2 col-2"
                      onClick={() => {
                        setAddProductModal(true);
                        setIsEditing(false);
                      }}
                    >
                      Add New Product
                    </button>
                  </div>

                  <div
                    className="table-wrapper"
                    style={{ maxHeight: "500px", overflowY: "auto" }}
                  >
                    <table className="table table-bordered">
                      <thead className="table-header">
                        <tr>
                          <th>Product Image</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {products.map((product) => (
                          <tr
                            className="fs-5 fw-medium text-center"
                            key={product._id}
                          >
                            <td>
                              <img
                                className="img-fluid icon-shape rounded mx-auto d-block icon-xl"
                                src={product.prod_img}
                                alt="product"
                              />
                            </td>
                            <td className="align-middle">{product.name}</td>
                            <td className="align-middle">{product.type}</td>
                            <td className="align-middle">
                              {product.price}&#8377;
                            </td>
                            <td className="align-middle">{product.quantity}</td>
                            <td className="align-middle">
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => {
                                  handleEditProduct(product._id);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger ms-2"
                                onClick={() => {
                                  handleDeleteProduct(product._id);
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {addproductmodal && (
                    <div className="modal show d-block" tabIndex="-1">
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">
                              {isEditing ? "Edit Product" : "Add Product"}
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => setAddProductModal(false)}
                            ></button>
                          </div>
                          <div className="modal-body">
                            <form>
                              <div className="form-group">
                                <label htmlFor="name">Name:</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="name"
                                  id="name"
                                  value={productdet.name}
                                  onChange={handleProductInputChange}
                                  placeholder="Product Name"
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="prod_img">Product Image:</label>
                                <input
                                  type="file"
                                  className="form-control"
                                  id="image"
                                  onChange={(e) =>
                                    handleImageChange(e.target.files[0])
                                  }
                                  accept="image/*"
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="price">Price:</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="price"
                                  id="price"
                                  value={productdet.price}
                                  onChange={handleProductInputChange}
                                  placeholder="Product Price"
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="description">
                                  Description:
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="description"
                                  id="description"
                                  value={productdet.description}
                                  onChange={handleProductInputChange}
                                  placeholder="Product Description"
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="type">Type:</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="type"
                                  id="type"
                                  value={productdet.type}
                                  onChange={handleProductInputChange}
                                  placeholder="Product Type"
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="quantity">Quantity:</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="quantity"
                                  id="quantity"
                                  value={productdet.quantity}
                                  onChange={handleProductInputChange}
                                  placeholder="Product Quantity"
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="department">Department:</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="department"
                                  id="department"
                                  value={productdet.department}
                                  onChange={handleProductInputChange}
                                  placeholder="Product Department"
                                />
                              </div>
                            </form>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setAddProductModal(false)}
                            >
                              Close
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={
                                isEditing
                                  ? handleUpdateProduct
                                  : handleaddProduct
                              }
                            >
                              {isEditing ? "Update" : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "mystore" && hasStore && (
                <div>
                  <h1 className="fw-bold">My Store</h1>
                  <div className="card p-3 mb-3">
                    <h5>Store Name: {storeDetails.storeName}</h5>
                    <h5>Location: {storeDetails.storeLocation}</h5>
                    <p>
                      Store Description: A leading supplier of fresh fruits and
                      vegetables.
                    </p>
                    <p>Store Categories:{storeDetails.categories.join(",")}</p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowModal(true)}
                    >
                      Edit Store Info
                    </button>
                  </div>

                  {showModal && (
                    <div className="modal show d-block" tabIndex="-1">
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">Edit Store Info</h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => setShowModal(false)}
                            ></button>
                          </div>
                          <div className="modal-body">
                            <form>
                              <div className="mb-3">
                                <label
                                  htmlFor="storeName"
                                  className="form-label"
                                >
                                  Store Name
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="storeName"
                                  name="storeName"
                                  value={storeDetails.storeName}
                                  onChange={handleStoreInputChange}
                                />
                              </div>
                              <div className="mb-3">
                                <label
                                  htmlFor="storeLocation"
                                  className="form-label"
                                >
                                  Store Location
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="storeLocation"
                                  name="storeLocation"
                                  value={storeDetails.storeLocation}
                                  onChange={handleStoreInputChange}
                                />
                              </div>
                              <div className="mb-3">
                                <label
                                  htmlFor="categories"
                                  className="form-label"
                                >
                                  Categories
                                </label>
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="categories"
                                    name="categories"
                                    value={category}
                                    onChange={handleCategoryInputChange}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddCategory}
                                  >
                                    Add
                                  </button>
                                </div>
                                <ul className="mt-2 d-flex">
                                  {storeDetails.categories.map((cat, index) => (
                                    <li
                                      className="me-2 badge bg-secondary"
                                      key={index}
                                    >
                                      {cat}{" "}
                                      <RxCross2
                                        onClick={() =>
                                          handleRemoveCategory(index)
                                        }
                                      />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </form>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowModal(false)}
                            >
                              Close
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleUpdateStore}
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "mystore" && !hasStore && (
                <div className="container mb-4">
                  <div className="row main-content">
                    <h1 className="fw-bold">Create Your Store</h1>
                    <form onSubmit={handleStoreCreationSubmit}>
                      <div className="mb-3">
                        <label htmlFor="storeName" className="form-label">
                          Store Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="storeName"
                          name="storeName"
                          value={storeDetails.storeName}
                          onChange={handleStoreInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="storeLocation" className="form-label">
                          Store Location
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="storeLocation"
                          name="storeLocation"
                          value={storeDetails.storeLocation}
                          onChange={handleStoreInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="deliveryOptions" className="form-label">
                          Delivery Options
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="deliveryOptions"
                          name="deliveryOptions"
                          value={storeDetails.deliveryOptions}
                          onChange={handleStoreInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="proximity" className="form-label">
                          Proximity
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="proximity"
                          name="proximity"
                          value={storeDetails.proximity}
                          onChange={handleStoreInputChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="categories" className="form-label">
                          Categories
                        </label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="categories"
                            name="categories"
                            value={category}
                            onChange={handleCategoryInputChange}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleAddCategory}
                          >
                            Add
                          </button>
                        </div>
                        <ul className="mt-2 d-flex">
                          {storeDetails.categories.map((cat, index) => (
                            <li className="me-2 badge bg-secondary" key={index}>
                              {cat}{" "}
                              <RxCross2
                                onClick={() => handleRemoveCategory(index)}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Delivery Slots</label>
                        {storeDetails.deliverySlots.map((slot, index) => (
                          <div key={index} className="mb-3 row">
                            <input
                              type="text"
                              className="form-control mb-2 col"
                              placeholder="Label"
                              value={slot.label}
                              onChange={(e) =>
                                handleSlotChange(index, "label", e.target.value)
                              }
                            />
                            <input
                              type="number"
                              className="form-control mb-2 col"
                              placeholder="Cost"
                              value={slot.cost}
                              onChange={(e) =>
                                handleSlotChange(index, "cost", e.target.value)
                              }
                            />
                            <select
                              className="form-select mb-2 col"
                              value={slot.type}
                              onChange={(e) =>
                                handleSlotChange(index, "type", e.target.value)
                              }
                            >
                              <option value="Paid">Paid</option>
                              <option value="Free">Free</option>
                            </select>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => handleRemoveSlot(index)}
                            >
                              Remove Slot
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleAddSlot}
                        >
                          Add Slot
                        </button>
                      </div>
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="pickupAvailable"
                          name="pickupAvailable"
                          checked={storeDetails.pickupAvailable}
                          onChange={(e) =>
                            setStoreDetails((prev) => ({
                              ...prev,
                              pickupAvailable: e.target.checked,
                            }))
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="pickupAvailable"
                        >
                          Pickup Available
                        </label>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Create Store
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeSection === "orders" && hasStore && (
                <div>
                  <h1 className="fw-bold">Orders</h1>
                  

                  <h4 className="mt-4">Order Details</h4>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Order Date</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) =>
                        order.products.map((product) => (
                          <tr className="align-middle" key={product.productId}>
                            <td>{order.orderId}</td>
                            <td>{order.buyer?.customerName}</td>
                            <td>{order.orderDate}</td>
                            <td>{product.productPrice}&#8377;</td>
                            <td
                              className={`badge ${
                                product.status === "pending"
                                  ? "bg-warning text-black"
                                  : product.status === "delivering"
                                  ? "bg-info text-white"
                                  : "bg-success text-white"
                              } ms-3 mt-2`}
                            >
                              {product.status}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() =>{
                                  fetchOrderDetails(order.orderId)
                                  handlePrint()
                                  }
                                }
                              >
                                View Details
                              </button>
                              <div className="btn-group ms-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  Change Status
                                </button>
                                <ul className="dropdown-menu">
                                  {["pending", "delivering", "completed"].map(
                                    (status) => (
                                      <li key={status}>
                                        <button
                                          className="dropdown-item"
                                          onClick={() =>
                                            handleStatusChange(
                                              order.orderId,
                                              product.productId,
                                              status
                                            )
                                          }
                                        >
                                          {status.charAt(0).toUpperCase() +
                                            status.slice(1)}
                                        </button>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Order Details Modal */}
                  {viewDetailsModal && viewDetails && (
                    <div className="modal show d-block" tabIndex="-1">
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">
                              Invoice #{viewDetails.orderId}
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => setViewDetailsModal(false)}
                            ></button>
                          </div>
                          <div className="modal-body">
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setViewDetailsModal(false)}
                            >
                              Close
                            </button>
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={handlePrint}
                            >
                              Print <i className="fa fa-print"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "profile" && hasStore && (
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
                              <h1 className="fw-bold">Profile</h1>
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
