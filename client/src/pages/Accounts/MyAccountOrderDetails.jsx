import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { IoMdDownload } from "react-icons/io";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
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
        console.log(response.data.data);
        setOrderDetails(response.data.data || {});
      } catch (error) {
        console.log("Error Fetching Order Details:", error);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const handlePrint = () => {
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
                
              </div>
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
                ${orderDetails.buyer.address.street}, ${orderDetails.buyer.address.city}, 
                ${orderDetails.buyer.address.postalCode}, ${orderDetails.buyer.address.country}
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
                    </tr>`
                  )
                  .join("")}
                <tr>
                  <td colspan="4" class="invoice-total">Subtotal</td>
                  <td>${orderDetails.totalAmount - orderDetails.deliveryCost}&#8377;</td>
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
                      <p className="mb-0">Price: {product.productPrice}&#8377;</p>
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
                  <span
                    className={`badge bg-success`}
                  >
                    {orderDetails.status}
                  </span>
                </p>
                <p>
                  <strong>Total Amount:</strong> {orderDetails.totalAmount}&#8377;
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
                  {orderDetails.deliveryTime.label} ({orderDetails.deliveryTime.tag})
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
