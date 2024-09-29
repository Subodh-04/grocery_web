import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getUserToken = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  return userData?.token || null;
};

// Register User
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post("/auth/", userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.extraDetails || "An error occurred";
    toast.error(message);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "An error occurred";
    const extraDetails = error.response?.data?.extraDetails || "";
    toast.error(message);
    toast.error(extraDetails);
    throw error;
  }
};

export const resetPassword = async (resetToken, newPassword) => {
  try {
    const response = await apiClient.post(
      `/auth/user/changepass/${resetToken}`,
      { newPassword }
    );
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "An error occurred";
    toast.error(message);
    throw error;
  }
};

export const fetchOrderDetails = async (orderId) => {
  try {
    const token = getUserToken();
    const response = await apiClient.get(`/product/orders/summary/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data || {};
  } catch (error) {
    console.error("Error Fetching Order Details:", error);
    return {};
  }
};

// Function to handle printing invoice
export const printInvoice = (orderDetails) => {
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
              <div></div>
              <div class="text-end">
                <h4>Invoice</h4>
                <p>Invoice Date: ${new Date().toLocaleDateString()}</p>
                <p>Order No: #${orderDetails.orderId}</p>
                <p>Status: ${orderDetails.status}</p>
              </div>
            </div>
  
            <div class="invoice-details">
              <h5>Billed To:</h5>
              <p>
                ${orderDetails.buyer.customerName} <br/>
                ${orderDetails.buyer.email} <br/>
                ${orderDetails.buyer.phone} <br/>
                ${orderDetails.buyer.address.street}, ${
    orderDetails.buyer.address.city
  }, 
                ${orderDetails.buyer.address.postalCode}, ${
    orderDetails.buyer.address.country
  }
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
                ${orderDetails.products
                  .map(
                    (product, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${product.productName}</td>
                    <td>${product.productPrice}&#8377;</td>
                    <td>${product.quantity}</td>
                    <td>${product.productPrice * product.quantity}&#8377;</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr>
                  <td colspan="4" class="invoice-total">Subtotal</td>
                  <td>${
                    orderDetails.totalAmount - orderDetails.deliveryCost
                  }&#8377;</td>
                </tr>
                <tr>
                  <td colspan="4" class="invoice-total">Shipping Charge</td>
                  <td>${orderDetails.deliveryCost}&#8377;</td>
                </tr>
                <tr>
                  <td colspan="4" class="invoice-total">Grand Total</td>
                  <td>${orderDetails.totalAmount}&#8377;</td>
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

//fuction to fetch orders cust
export const fetchOrders = async () => {
  try {
    const token = getUserToken();
    const response = await apiClient.get(`/order/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error Fetching Orders:", error);
    return [];
  }
};

//function to handle forgot password
export const handleForgotPassword = async (email) => {
  try {
    const response = await apiClient.post("/auth/user/resetpass", { email });

    if (response.data && response.data.message) {
      toast.info(response.data.message);
      console.log("Password Change Mail Sent to the User");
    } else {
      toast.error("Unexpected response from the server.");
    }
  } catch (error) {
    console.error("Error While Forgot Password:", error);
    toast.error("An error occurred while sending the password reset email.");
  }
};

// Fetch User Addresses
export const fetchAddresses = async (userId) => {
  try {
    const token = getUserToken();
    const response = await apiClient.get(`/auth/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.address || [];
  } catch (error) {
    console.error("Error Fetching Addresses:", error);
    toast.error("An error occurred while fetching addresses.");
    return [];
  }
};

// Add New Address
export const addAddress = async (addressData) => {
  try {
    const token = getUserToken();
    const response = await apiClient.post(
      `/auth/user/addAddress`,
      addressData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Adding Address:", error);
    toast.error("An error occurred while adding the address.");
    throw error;
  }
};

// Delete Address
export const deleteAddress = async (addressId) => {
  try {
    const token = getUserToken();
    const response = await apiClient.delete(`/auth/user/delete/${addressId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error Deleting Address:", error);
    toast.error("An error occurred while deleting the address.");
    throw error;
  }
};

// Update Address
export const updateAddress = async (addressId, addressData) => {
  try {
    const token = getUserToken();
    const response = await apiClient.put(
      `/auth/user/update/${addressId}`,
      addressData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Updating Address:", error);
    toast.error("An error occurred while updating the address.");
    throw error;
  }
};

// Fetch user details by userId
export const fetchUserDetails = async (userId, token) => {
  const response = await apiClient.get(`/auth/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update user profile
export const updateUserProfile = async (profileData, token) => {
  const response = await apiClient.put("/auth/user/profile", profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Request password reset
export const requestPasswordReset = async (email, token) => {
  const response = await apiClient.post(
    "/auth/user/resetpass",
    { email },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Update password
export const updatePassword = async (
  userId,
  currentPassword,
  newPassword,
  token
) => {
  const response = await apiClient.post(
    `/auth/user/updatepass/`,
    {
      userId,
      currentPassword,
      newPassword,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Delete account
export const deleteAccount = async (userId, token) => {
  await apiClient.delete(`/deleteAccount/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Fetch Departments
export const fetchDepartments = async () => {
  try {
    const token = getUserToken();
    const response = await apiClient.get("/product/departments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      return response.data.departments;
    } else {
      toast.error("Failed to fetch departments");
      return [];
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    toast.error("An error occurred while fetching departments.");
    return [];
  }
};

// Function to fetch products with authentication
export const fetchProducts = async () => {
  try {
    const response = await apiClient.get(`/product/`);
    return response.data.products;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const fetchProductsByDepartment = async (department, token) => {
  const response = await apiClient.get(`/product/${department}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.products;
};

// Fetch products by department and type
export const fetchProductsByType = async (department, type, token) => {
  const response = await apiClient.get(`/product/${department}/${type}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.products;
};

// Fetch departments and types
export const fetchDepartmentsAndTypes = async (token) => {
  const response = await apiClient.get("/product/departmentsandtypes", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Add product to cart
export const addToCart = async (productId, token) => {
  const response = await apiClient.post(
    "/order/cart/add",
    { productId, quantity: 1 },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Fetch all stores
export const fetchStores = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const response = await apiClient.get("/store/", {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    });

    if (!response || !response.data.Stores) {
      toast.error("Stores not found");
      return [];
    }

    return response.data.Stores;
  } catch (error) {
    console.error("Error Fetching Stores:", error.message);
    toast.error("An error occurred while fetching stores.");
    return [];
  }
};

// Fetch store details by ID
export const fetchStoreDetails = async (id, token) => {
  try {
    const response = await apiClient.get(`/store/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Error fetching store details: " + error.message);
  }
};

// Fetch products by category
export const fetchCategoryProducts = async (storeId, category, token) => {
  try {
    const response = await apiClient.get(
      `/product/inventory/prod/${storeId}/${category}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching category products: " + error.message);
  }
};

// Fetch cart details
export const fetchCart = async (token) => {
  try {
    const response = await apiClient.get(`/order/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (Array.isArray(response.data.cart)) {
      return response.data;
    } else {
      throw new Error("Invalid cart data format");
    }
  } catch (error) {
    console.error("Error fetching cart data:", error.message);
    throw new Error("Failed to fetch cart data");
  }
};

// Remove product from cart
export const removeFromCart = async (productId, token) => {
  try {
    const response = await apiClient.delete(`/order/cart/delete/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error removing product from cart:", error.message);
    throw new Error("Failed to remove product from cart");
  }
};

// Decrease product quantity in cart
export const decreaseCartQuantity = async (productId, token) => {
  try {
    const response = await apiClient.post(
      `/order/cart/decrease`,
      { productId, quantity: 1 },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error decreasing quantity:", error.message);
    throw new Error("Failed to decrease product quantity");
  }
};

// Increase product quantity in cart
export const increaseCartQuantity = async (productId, token) => {
  try {
    const response = await apiClient.post(
      `/order/cart/increase`,
      { productId, quantity: 1 },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error increasing quantity:", error.message);
    throw new Error("Failed to increase product quantity");
  }
};

export const getCart = async (token) => {
  try {
    const response = await apiClient.get(`/order/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

// Function to get the user's address
export const getUserAddress = async (userId) => {
  try {
    const response = await apiClient.get(`/auth/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user address:", error);
    throw error;
  }
};

// Function to place an order
export const placeOrder = async (orderData, token) => {
  try {
    const response = await apiClient.post(`/order`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error placing order:", error.response);
    throw error;
  }
};

///sellers api ///
// Update store details
export const updateStoreDetails = async (storeId, storeDetails, token) => {
  try {
    const response = await apiClient.put(`store/${storeId}`, storeDetails, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating store details:", error);
    throw error;
  }
};

// Create a new store
export const createStore = async (storeDetails, userId, token) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/store/",
      { ...storeDetails, seller: userId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating store:", error);
    throw error;
  }
};

// Add a new product
export const addProduct = async (productDetails, token) => {
  try {
    const response = await apiClient.post("/product/", productDetails, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// Update product details
export const updateProduct = async (productId, productDetails, token) => {
  try {
    const response = await apiClient.put(
      `/product/${productId}`,
      productDetails,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (productId, token) => {
  try {
    const response = await apiClient.delete(
      `/product/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};


// Fetch orders summary
export const fetchOrdersS = async (token) => {
  try {
    const response = await apiClient.get(
      "/seller/orders/summary",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};


// Update order product status
export const updateProductStatus = async (orderId, productId, newStatus, token) => {
  try {
    const response = await apiClient.put(
      "/seller/productstatus",
      { orderId, productId, newStatus },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product status:", error);
    throw error;
  }
};

// Delete user account
export const deleteUserAccount = async (userId, token) => {
  try {
    const response = await axios.delete(`/api/deleteAccount/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};