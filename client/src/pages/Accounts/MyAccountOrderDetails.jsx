import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IoMdDownload } from "react-icons/io";
import { fetchOrderDetails, printInvoice } from "../../api";

const OrderDetails = () => {
  const { orderId } = useParams(); // Retrieve orderId from the URL parameters
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const data = await fetchOrderDetails(orderId);
        setOrderDetails(data);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId]);

  const handlePrint = () => {
    if (orderDetails) {
      printInvoice(orderDetails);
    } else {
      console.error("No order details available for printing.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!orderDetails) return <p>No order details found.</p>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Order Details</h2>
      {orderDetails ? (
        <div id="invoice-section">
          <div className="row">
            {/* Left side: Order Items */}
            <div className="col-md-6">
              <h5 className="mb-4">Order Items</h5>
              {orderDetails.products &&
                orderDetails.products.map((product, index) => (
                  <div className="d-flex mb-3 p-2 border rounded" key={index}>
                    <img
                      src={product.productImage}
                      alt={product.productName}
                      className="me-3"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                    <div>
                      <h6 className="mb-1">{product.productName}</h6>
                      <p className="mb-1">Quantity: {product.quantity}</p>
                      <p className="mb-0">
                        Price: {product.productPrice}&#8377;
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            {/* Right side: Order Data */}
            <div className="col-md-6">
              <div className="invoice-summary">
                <h5 className="mb-3">Order Summary</h5>
                <p>
                  <strong>Order ID:</strong> {orderDetails.orderId}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`badge bg-success`}>
                    {orderDetails.status}
                  </span>
                </p>
                <p>
                  <strong>Total Amount:</strong> {orderDetails.totalAmount}
                  &#8377;
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {`${orderDetails.buyer.address.street}, ${orderDetails.buyer.address.city}, ${orderDetails.buyer.address.postalCode}, ${orderDetails.buyer.address.country}`}
                </p>
                <p>
                  <strong>Phone:</strong> {orderDetails.buyer.phone}
                </p>
                <p>
                  <strong>Delivery Time:</strong>{" "}
                  {orderDetails.deliveryTime.label} (
                  {orderDetails.deliveryTime.tag})
                </p>
                <button className="btn btn-primary mt-3" onClick={handlePrint}>
                  <IoMdDownload /> Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading order details...</p>
      )}
    </div>
  );
};

export default OrderDetails;