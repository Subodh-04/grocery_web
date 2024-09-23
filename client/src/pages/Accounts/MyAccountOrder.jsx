import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../ScrollToTop";
import { fetchOrders } from "../../api";

const MyAccountOrder = () => {
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await fetchOrders();
        setOrders(ordersData);
      } catch (err) {
        console.error("Error Fetching Orders:", err);
      } finally {
        setLoaderStatus(false);
      }
    };

    loadOrders();
  }, []);
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
                            <th>Order ID</th>
                            <th>Total Amount</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, index) => (
                            <tr key={index} className="border-top border-light">
                              <td className="py-4">{order.orderId}</td>
                              <td className="py-4">
                                {order.totalAmount}&#8377;
                              </td>
                              <td>
                                <Link
                                  to={`/order-details/${order.orderId}`}
                                  className="btn btn-primary"
                                >
                                  View Details
                                </Link>
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
    </div>
  );
};

export default MyAccountOrder;
