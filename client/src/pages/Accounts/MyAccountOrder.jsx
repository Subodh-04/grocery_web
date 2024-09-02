import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../ScrollToTop";
import axios from "axios";
import { IoMdDownload } from "react-icons/io";

const MyAccountOrder = () => {
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [orders, setOrders] = useState([]);
  const [viewDetails, setViewDetails] = useState([]);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get("http://localhost:5000/api/order/", {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        });
        if (!response) {
          alert(response.data.message);
        }
        setLoaderStatus(false);
        setOrders(response.data);
      } catch (error) {
        console.log("Error Fetching Orders:", error);
      }
    };
    fetchOrders();
  }, [orders]);

  const handleViewOrderDetails = async (orderId) => {
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
      if (!response) {
        console.log("Error:", response.data.message);
        return;
      }
      console.log(response.data.data);
      setViewDetailsModal(true);
      setViewDetails(response.data.data);
    } catch (error) {
      console.log("Error While Fetching order Details", error);
    }
  };

  
  const handlePrint = () => {
    const printContents = document.getElementById("invoice-section").innerHTML;

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            /* Include the same CSS used in the modal */
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .container { padding: 20px; }
            .row { margin-bottom: 20px; }
            .text-end { text-align: right; }
            .text-muted { color: #6c757d; }
            .badge { display: inline-block; padding: 0.35em 0.65em; font-size: 75%; font-weight: 700; line-height: 1; color: #fff; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: 0.25rem; }
            .bg-success { background-color: #28a745; }
            table { width: 100%; border-collapse: collapse; }
            table, th, td { border: 1px solid black; }
            th, td { padding: 10px; text-align: left; }
            h5, h6, h4 { margin: 0; }
            .mb-0 { margin-bottom: 0; }
            .mb-1 { margin-bottom: 0.5rem; }
            .mt-2 { margin-top: 0.5rem; }
            .table-bordered { border: 1px solid #dee2e6; }
            thead th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
                    <Link className="nav-link active" to="/MyAccountOrder">
                      <i className="fas fa-shopping-bag me-2" />
                      Your Orders
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/MyAccountSetting">
                      <i className="fas fa-cog me-2" />
                      Settings
                    </Link>
                  </li>
                  {/* Additional nav items */}
                </ul>
              </div>
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <div>
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
                    <h2 className="mb-6">Your Orders</h2>
                    <div className="table-responsive border-0">
                      <table className="table mb-0 text-nowrap">
                        <thead className="table-light">
                          <tr>
                            <th>&nbsp;</th>
                            <th>Product</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Invoice</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, index) => (
                            <tr key={index}>
                              <td className="align-middle border-top-0 w-0">
                                <Link to="#">
                                  <img
                                    src={order.product.productImage}
                                    alt={order.productName}
                                    className="icon-shape icon-xl"
                                  />
                                </Link>
                              </td>
                              <td className="align-middle border-top-0">
                                <Link
                                  to="#"
                                  className="fw-semi-bold text-inherit"
                                >
                                  <h6 className="mb-0">
                                    {order.product.productName}
                                  </h6>
                                </Link>
                                <span>
                                  <small className="text-muted">
                                    {order.productSize}
                                  </small>
                                </span>
                              </td>
                              <td className="align-middle border-top-0">
                                {order.orderDate}
                              </td>
                              <td className="align-middle border-top-0">
                                {order.quantity}
                              </td>
                              <td className="align-middle border-top-0">
                                <span
                                  className={`badge ${
                                    order.status === "Completed"
                                      ? "bg-success"
                                      : order.status === "Processing"
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="align-middle border-top-0">
                                {order.totalAmount}&#8377;
                              </td>
                              <td className="align-middle border-top-0">
                                <button className="btn btn-success" onClick={() =>handleViewOrderDetails(order.orderId)}>
                                <IoMdDownload />
                                Download</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
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
                            <div id="invoice-section" className="container">
                              {/* Invoice Header */}
                              <div className="row mb-4">
                                <div className="col">
                                  <h5 className="mb-1">
                                    {viewDetails.product.store.storeName}
                                  </h5>
                                  <p className="text-muted mb-0">
                                    {viewDetails.product.store.storeLocation}
                                  </p>
                                  <p className="text-muted mb-0">xyz@987.com</p>
                                  <p className="text-muted mb-0">
                                    012-345-6789
                                  </p>
                                </div>
                                <div className="col text-end">
                                  <h6 className="text-muted">
                                    Invoice Date: {viewDetails.orderDate}
                                  </h6>
                                  <h6 className="text-muted">
                                    Order No: #1123456
                                  </h6>
                                  <h6 className="text-muted">
                                    Invoice No: #{viewDetails.orderId}
                                  </h6>
                                  <h6 className="text-muted">
                                    Status:{" "}
                                    <span className="badge bg-success">
                                      Paid
                                    </span>
                                  </h6>
                                </div>
                              </div>

                              {/* Buyer Information */}
                              <div className="row mb-4">
                                <div className="col">
                                  <h6>Billed To:</h6>
                                  <p className="text-muted">
                                    <strong>
                                      {viewDetails.buyer.customerName}
                                    </strong>
                                  </p>
                                  <p className="text-muted mb-0">
                                    {viewDetails.buyer.email}
                                  </p>
                                  <p className="text-muted mb-0">
                                    {viewDetails.buyer.phone}
                                  </p>
                                  <p className="text-muted mb-0">
                                    {viewDetails.buyer.address.street}
                                  </p>
                                  <p className="text-muted mb-0">
                                    {viewDetails.buyer.address.city},{" "}
                                    {viewDetails.buyer.address.state},{" "}
                                    {viewDetails.buyer.address.zip}
                                  </p>
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div className="row mb-4">
                                <div className="col">
                                  <h6>Order Summary</h6>
                                  <table className="table table-bordered">
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
                                      <tr>
                                        <td>01</td>
                                        <td>
                                          {viewDetails.product.productName}
                                        </td>
                                        <td>
                                          {viewDetails.product.productPrice}
                                        </td>
                                        <td>{viewDetails.quantity}</td>
                                        <td>{viewDetails.totalAmount}&#8377;</td>
                                      </tr>
                                      {/* Add more rows as necessary */}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Total Calculation */}
                              <div className="row mb-4">
                                <div className="col">
                                  <div className="text-end">
                                    <p className="mb-1">
                                      <strong>Sub Total:</strong> 
                                      {viewDetails.totalAmount}&#8377;
                                    </p>
                                    <p className="mb-1">
                                      <strong>Delivery Cost:</strong> {viewDetails.deliveryCost}&#8377;
                                    </p>
                                    <h4 className="mt-2">
                                      <strong>Total:</strong> 
                                      {viewDetails.totalAmount}&#8377;
                                    </h4>
                                  </div>
                                </div>
                              </div>
                            </div>
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
  );
};

export default MyAccountOrder;
