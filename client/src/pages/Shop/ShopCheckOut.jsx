import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../ScrollToTop";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { getCart, getUserAddress, getUserToken, placeOrder } from "../../api";

const ShopCheckOut = () => {
  const [loaderStatus, setLoaderStatus] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);
  }, []);

  const navigate = useNavigate();

  // State for cart, total amount, address, and selected address
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [address, setAddress] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState({});
  const [deliveryOption, setDeliveryOption] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Load Stripe instance
  const stripePromise = loadStripe(
    "pk_test_51PzviN1hYkTOanlJ06wAVKwng1q0bo8dIIbC7uv8uBrlE858KeRSral4BQ5a16V0CVvXPkSNTnVKNwcXgStZGMhT00G38wq4Ja"
  );

  // Fetch user's cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = getUserToken();
        const cartData = await getCart(token);
        setCart(cartData.cart);
        setTotalAmount(cartData.totalAmount);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };
    fetchCart();
  }, []);

  // Fetch user's address
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const userData=JSON.parse(localStorage.getItem("userData"));
        const userDataResponse = await getUserAddress(userData.userId);
        setAddress(userDataResponse.address);
      } catch (error) {
        console.error("Failed to fetch user address:", error);
      }
    };
    fetchUserAddress();
  }, []);

  // Function to place order
  const handlePlaceOrder = async () => {
    if (!selectedAddress._id || !deliveryOption) {
      toast.info("Please select an address and delivery option.");
      return;
    }

    try {
      const token=getUserToken();
      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryOption,
        paymentMethod,
        deliveryAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          postalCode: selectedAddress.zip,
          country: selectedAddress.country,
        },
      };

      const response = await placeOrder(orderData, token);

      if (response.success) {
        if (paymentMethod === "Stripe") {
          window.location.href = response.session_url;
        } else {
          toast.success(response.message);
          navigate("/MyAccountOrder");
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An error occurred while placing the order.");
    }
  };
  return (
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
        <>
          <ScrollToTop />
          <section className="mb-lg-14 mb-8 mt-8">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <div className="mb-8">
                    <h1 className="fw-bold mb-0">Checkout</h1>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-7 col-md-12">
                  <div
                    className="accordion accordion-flush"
                    id="accordionFlushExample"
                  >
                    <div className="accordion-item py-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <Link
                          to="#"
                          className="fs-5 text-inherit collapsed h4"
                          data-bs-toggle="collapse"
                          data-bs-target="#flush-collapseOne"
                          aria-expanded="true"
                          aria-controls="flush-collapseOne"
                        >
                          <i className="feather-icon icon-map-pin me-2 text-muted" />
                          Select delivery address
                        </Link>
                      </div>
                      <div
                        id="flush-collapseOne"
                        className="accordion-collapse collapse show"
                        data-bs-parent="#accordionFlushExample"
                      >
                        <div className="mt-5">
                          <div className="row">
                            {address.map((address) => (
                              <div
                                className="col-lg-6 col-12 mb-4"
                                key={address._id}
                              >
                                <div className="border p-6 rounded-3">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="address"
                                      id={`address-${address._id}`}
                                      value={address._id}
                                      onChange={() =>
                                        setSelectedAddress(address)
                                      }
                                    />
                                  </div>
                                  <address>
                                    <strong>{address.name}</strong>
                                    <br />
                                    {address.street}
                                    <br />
                                    {address.city}, {address.state},{" "}
                                    {address.zip}
                                    <br />
                                  </address>
                                  {address.isdefault && (
                                    <span className="text-danger">
                                      Default address
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item py-4">
                      <Link
                        to="#"
                        className="text-inherit collapsed h5"
                        data-bs-toggle="collapse"
                        data-bs-target="#flush-collapseTwo"
                        aria-expanded="false"
                        aria-controls="flush-collapseTwo"
                      >
                        <i className="feather-icon icon-clock me-2 text-muted" />
                        Delivery time
                      </Link>
                      <div
                        id="flush-collapseTwo"
                        className="accordion-collapse collapse"
                        data-bs-parent="#accordionFlushExample"
                      >
                        <ul className="list-group list-group-flush mt-4">
                          <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                            <div className="col-4">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="deliveryOption"
                                  id="flexRadioDefault1"
                                  value='{"label":"Within 1 Hours","price":70, "tag":"Paid"}'
                                  onChange={(e) =>
                                    setDeliveryOption(
                                      JSON.parse(e.target.value)
                                    )
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="flexRadioDefault1"
                                >
                                  <span>Within 1 Hours</span>
                                </label>
                              </div>
                            </div>
                            <div className="col-3 text-center">70&#8377;</div>
                            <div className="col-3 text-center">
                              <span className="badge bg-danger">Paid</span>
                            </div>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                            <div className="col-4">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="deliveryOption"
                                  id="flexRadioDefault2"
                                  value='{"label":"Within 2 Hours","price":50, "tag":"Paid"}'
                                  onChange={(e) =>
                                    setDeliveryOption(
                                      JSON.parse(e.target.value)
                                    )
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="flexRadioDefault2"
                                >
                                  <span>Within 2 Hours</span>
                                </label>
                              </div>
                            </div>
                            <div className="col-3 text-center">50&#8377;</div>
                            <div className="col-3 text-center">
                              <span className="badge bg-danger">Paid</span>
                            </div>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                            <div className="col-4">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="deliveryOption"
                                  id="flexRadioDefault3"
                                  value='{"label":"Within 3 Hours","price":0, "tag":"Free"}'
                                  onChange={(e) =>
                                    setDeliveryOption(
                                      JSON.parse(e.target.value)
                                    )
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="flexRadioDefault3"
                                >
                                  <span>Within 3 Hours</span>
                                </label>
                              </div>
                            </div>
                            <div className="col-3 text-center">0&#8377;</div>
                            <div className="col-3 text-center">
                              <span className="badge bg-success">Free</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="accordion-item py-4">
                      <Link
                        to="#"
                        className="text-inherit collapsed h5"
                        data-bs-toggle="collapse"
                        data-bs-target="#flush-collapseThree"
                        aria-expanded="false"
                        aria-controls="flush-collapseThree"
                      >
                        <i className="feather-icon icon-clock me-2 text-muted" />
                        Payment Method
                      </Link>
                      <div
                        id="flush-collapseThree"
                        className="accordion-collapse collapse"
                        data-bs-parent="#accordionFlushExample"
                      >
                        <div className="mt-4">
                          <div className="form-check">
                            <input
                              type="radio"
                              id="paymentCOD"
                              name="paymentMethod"
                              value="COD"
                              checked={paymentMethod === "COD"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="form-check-input"
                            />
                            <label
                              htmlFor="paymentCOD"
                              className="form-check-label"
                            >
                              Cash on Delivery (COD)
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="radio"
                              id="paymentStripe"
                              name="paymentMethod"
                              value="Stripe"
                              checked={paymentMethod === "Stripe"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="form-check-input"
                            />
                            <label
                              htmlFor="paymentStripe"
                              className="form-check-label"
                            >
                              Credit/Debit Card
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-12 offset-lg-1 col-lg-4">
                  <div className="mt-4 mt-lg-0">
                    <div className="card shadow-sm">
                      <h5 className="px-6 py-4 bg-transparent mb-0">
                        Order Details
                      </h5>
                      {/* Scrollable section only for the product items */}
                      <ul className="list-group list-group-flush">
                        <div style={{ maxHeight: "306px", overflowY: "auto" }}>
                          {/* List group item */}
                          {cart.map((cartItem, index) => (
                            <li
                              key={index}
                              className="list-group-item px-4 py-3"
                            >
                              <div className="row align-items-center">
                                <div className="col-2 col-md-2">
                                  <img
                                    src={cartItem.image}
                                    alt="Product"
                                    className="img-fluid"
                                  />
                                </div>
                                <div className="col-5 col-md-5">
                                  <h6 className="mb-0">{cartItem.name}</h6>
                                </div>
                                <div className="col-2 col-md-2 text-center text-muted">
                                  <span>{cartItem.quantity}</span>
                                </div>
                                <div className="col-3 text-lg-end text-start text-md-end col-md-3">
                                  <span className="fw-bold">
                                    {cartItem.price}&#8377;
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </div>
                      </ul>

                      {/* Price and Subtotal section */}
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item px-4 py-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div>Item Subtotal</div>
                            <div className="fw-bold">{totalAmount}&#8377;</div>
                          </div>

                          {/* Delivery Fee */}
                          {deliveryOption?.price ? (
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div>
                                Delivery Fee{" "}
                                <i
                                  className="feather-icon icon-info text-muted"
                                  data-bs-toggle="tooltip"
                                  title="Delivery Fee"
                                />
                              </div>
                              <div className="fw-bold">
                                {deliveryOption.price}&#8377;
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div>No Delivery Option Selected</div>
                            </div>
                          )}
                        </li>

                        {/* Subtotal */}
                        <li className="list-group-item px-4 py-3">
                          <div className="d-flex align-items-center justify-content-between fw-bold">
                            <div>Subtotal</div>
                            <div>
                              {totalAmount + (deliveryOption?.price || 0)}
                              &#8377;
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <button
                      className="btn btn-primary mt-4 w-100"
                      onClick={handlePlaceOrder}
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ShopCheckOut;
