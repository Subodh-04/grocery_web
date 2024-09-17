import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../ScrollToTop";
import axios from "axios";
import StripePaymentForm from "../PaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const ShopCheckOut = () => {
  // loading
  const [loaderStatus, setLoaderStatus] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);
  }, []);
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [address, setAddress] = useState([]);
  useEffect(() => {
    const fetchCart = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const res = await axios.get("http://localhost:5000/api/order/cart", {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      });
      if (!res) {
        console.log("not found:", res.data);
      }
      setCart(res.data.cart);
      setTotalAmount(res.data.totalAmount);
    };
    fetchCart();
  }, [cart, totalAmount]);

  useEffect(() => {
    const fetchuserAddress = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const res = await axios.get(
        `http://localhost:5000/api/auth/user/${userData.userId}`
      );
      if (!res) {
        console.log("Invalid user id:", res.data);
      }
      setAddress(res.data.address);
    };
    fetchuserAddress();
  }, [address]);

  const [addresses, setaddresses] = useState([]);
  const [deliveryoption, setDeliveryoption] = useState({});
  const stripePromise = loadStripe(
    "pk_test_51PzviN1hYkTOanlJ06wAVKwng1q0bo8dIIbC7uv8uBrlE858KeRSral4BQ5a16V0CVvXPkSNTnVKNwcXgStZGMhT00G38wq4Ja"
  );

  return (
    <div>
      <div>
        {loaderStatus ? (
          <div className="loader-container">
            {/* <PulseLoader loading={loaderStatus} size={50} color="#0aad0a" /> */}
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
            <>
              <ScrollToTop />
            </>
            <>
              {/* section */}
              <section className="mb-lg-14 mb-8 mt-8">
                <div className="container">
                  {/* row */}
                  <div className="row">
                    {/* col */}
                    <div className="col-12">
                      <div>
                        <div className="mb-8">
                          {/* text */}
                          <h1 className="fw-bold mb-0">Checkout</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {/* row */}
                    <div className="row">
                      <div className="col-lg-7 col-md-12">
                        {/* accordion */}
                        <div
                          className="accordion accordion-flush"
                          id="accordionFlushExample"
                        >
                          {/* accordion item */}
                          <div className="accordion-item py-4">
                            <div className="d-flex justify-content-between align-items-center">
                              {/* heading one */}
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
                              {/* btn */}

                              {/* collapse */}
                            </div>
                            <div
                              id="flush-collapseOne"
                              className="accordion-collapse collapse show"
                              data-bs-parent="#accordionFlushExample"
                            >
                              <div className="mt-5">
                                <div className="row">
                                  {address.map((address) => (
                                    <div className="col-lg-6 col-12 mb-4">
                                      {/* form */}
                                      <div className="border p-6 rounded-3">
                                        <div className="form-check">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadio "
                                            id="addressvalue"
                                            value={address._id}
                                            onChange={() =>
                                              setaddresses(address)
                                            }
                                          />
                                        </div>
                                        {/* address */}
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
                          {/* accordion item */}
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
                            {/* collapse */}
                            <div
                              id="flush-collapseTwo"
                              className="accordion-collapse collapse "
                              data-bs-parent="#accordionFlushExample"
                            >
                              {/* tab content */}
                              <div
                                className="tab-content"
                                id="pills-tabContent"
                              >
                                {/* tab pane */}
                                <div
                                  className="tab-pane fade show active"
                                  id="pills-today"
                                  role="tabpanel"
                                  aria-labelledby="pills-today-tab"
                                  tabIndex={0}
                                >
                                  {/* list group */}
                                  <ul className="list-group list-group-flush mt-4">
                                    {/* list group item */}
                                    <li className="list-group-item  d-flex justify-content-between align-items-center px-0 py-3">
                                      {/* col */}
                                      <div className="col-4">
                                        <div className="form-check">
                                          {/* form check input */}
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="flexRadioDefault1"
                                            value='{"time":"Within 1 Hours","price":70, "type":"Paid"}'
                                            onChange={(e) =>
                                              setDeliveryoption(
                                                JSON.parse(e.target.value)
                                              )
                                            }
                                          />
                                          {/* label */}
                                          <label
                                            className="form-check-label"
                                            htmlFor="flexRadioDefault1"
                                          >
                                            <span>Within 1 Hours</span>
                                          </label>
                                        </div>
                                      </div>
                                      {/* price */}
                                      <div className="col-3 text-center">
                                        70&#8377;
                                      </div>
                                      {/* badge */}
                                      <div className="col-3 text-center">
                                        {" "}
                                        <span className="badge bg-danger">
                                          Paid
                                        </span>
                                      </div>
                                    </li>
                                    {/* list group item */}
                                    <li className="list-group-item  d-flex justify-content-between align-items-center px-0 py-3">
                                      {/* col */}
                                      <div className="col-4">
                                        <div className="form-check">
                                          {/* form check input */}
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="flexRadioDefault1"
                                            value='{"time":"Within 2 Hours","price":50, "type":"Paid"}'
                                            onChange={(e) =>
                                              setDeliveryoption(
                                                JSON.parse(e.target.value)
                                              )
                                            }
                                          />
                                          {/* label */}
                                          <label
                                            className="form-check-label"
                                            htmlFor="flexRadioDefault1"
                                          >
                                            <span>Within 2 Hours</span>
                                          </label>
                                        </div>
                                      </div>
                                      {/* price */}
                                      <div className="col-3 text-center">
                                        50&#8377;
                                      </div>
                                      {/* badge */}
                                      <div className="col-3 text-center">
                                        {" "}
                                        <span className="badge bg-danger">
                                          Paid
                                        </span>
                                      </div>
                                      {/* col */}
                                    </li>
                                    {/* list group item */}
                                    <li className="list-group-item  d-flex justify-content-between align-items-center px-0 py-3">
                                      {/* col */}
                                      <div className="col-4">
                                        <div className="form-check">
                                          {/* form check input */}
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="flexRadioDefault2"
                                            value='{"time":"Within 3 Hours","price":0, "type":"Free"}'
                                            onChange={(e) =>
                                              setDeliveryoption(
                                                JSON.parse(e.target.value)
                                              )
                                            }
                                          />
                                          {/* label */}
                                          <label
                                            className="form-check-label"
                                            htmlFor="flexRadioDefault2"
                                          >
                                            <span>Within 3 Hours</span>
                                          </label>
                                        </div>
                                      </div>
                                      {/* price */}
                                      <div className="col-3 text-center">
                                        0&#8377;
                                      </div>
                                      <div className="col-3 text-center">
                                        <span className="badge bg-success">
                                          Free
                                        </span>
                                      </div>
                                      {/* col */}
                                    </li>
                                  </ul>
                                </div>
                              </div>
                              <div className="mt-5 d-flex justify-content-end">
                                <Link
                                  to="#"
                                  className="btn btn-outline-gray-400 text-muted"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#flush-collapseOne"
                                  aria-expanded="false"
                                  aria-controls="flush-collapseOne"
                                >
                                  Prev
                                </Link>
                                <Link
                                  to="#"
                                  className="btn btn-primary ms-2"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#flush-collapseThree"
                                  aria-expanded="false"
                                  aria-controls="flush-collapseThree"
                                >
                                  Next
                                </Link>
                              </div>
                            </div>
                          </div>
                          {/* accordion item */}
                          <div className="accordion-item py-4">
                            <Link
                              to="#"
                              className="text-inherit h5"
                              data-bs-toggle="collapse"
                              data-bs-target="#flush-collapseThree"
                              aria-expanded="false"
                              aria-controls="flush-collapseThree"
                            >
                              <i className="feather-icon icon-credit-card me-2 text-muted" />
                              Payment Method
                            </Link>
                            <div
                              id="flush-collapseThree"
                              className="accordion-collapse collapse"
                              data-bs-parent="#accordionFlushExample"
                            >
                              <div className="mt-5">
                                <div>
                                  {/* Stripe Payment Option */}
                                  <div className="card card-bordered shadow-sm mb-4">
                                    <div className="card-body p-5">
                                      <div className="d-flex align-items-center mb-3">
                                        <div className="form-check me-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="paymentMethod"
                                            id="stripe"
                                          />
                                        </div>
                                        <div>
                                          <h5 className="h6 mb-1">
                                            Stripe Payment
                                          </h5>
                                          <p className="text-muted mb-0 small">
                                            Pay securely using your credit or
                                            debit card via Stripe.
                                          </p>
                                        </div>
                                      </div>

                                      {/* Stripe Payment Form */}
                                      <div className="mt-4  pt-4">
                                        <Elements stripe={stripePromise}>
                                          <StripePaymentForm />
                                        </Elements>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Cash on Delivery Option */}
                                  <div className="card card-bordered shadow-none mb-2">
                                    <div className="card-body p-6">
                                      <div className="d-flex">
                                        <div className="form-check">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="cashonDelivery"
                                          />
                                          <label
                                            className="form-check-label ms-2"
                                            htmlFor="cashonDelivery"
                                          ></label>
                                        </div>
                                        <div>
                                          <h5 className="mb-1 h6">
                                            {" "}
                                            Cash on Delivery{" "}
                                          </h5>
                                          <p className="mb-0 small">
                                            Pay with cash when your order is
                                            delivered.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Place Order Button */}
                                  <div className="mt-5 d-flex justify-content-end">
                                    <Link
                                      to="#"
                                      className="btn btn-outline-gray-400 text-muted"
                                      data-bs-toggle="collapse"
                                      data-bs-target="#flush-collapseTwo"
                                      aria-expanded="false"
                                      aria-controls="flush-collapseTwo"
                                    >
                                      Prev
                                    </Link>
                                    <button
                                      onClick={() => {
                                        console.log(
                                          "Addresses and Delivery Option submitted"
                                        );
                                      }}
                                      className="btn btn-primary ms-2"
                                    >
                                      Place Order
                                    </button>
                                  </div>
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
                            <ul className="list-group list-group-flush">
                              {/* list group item */}
                              {cart.map((cartItem, index) => (
                                <li
                                  key={index}
                                  className="list-group-item px-4 py-3"
                                >
                                  <div className="row align-items-center">
                                    <div className="col-2 col-md-2">
                                      <img
                                        src={cartItem.image}
                                        alt="Ecommerce"
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

                              {/* list group item */}
                              <li className="list-group-item px-4 py-3">
                                <div className="d-flex align-items-center justify-content-between   mb-2">
                                  <div>Item Subtotal</div>
                                  <div className="fw-bold">
                                    {totalAmount}&#8377;
                                  </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <div>
                                    Service Fee{" "}
                                    <i
                                      className="feather-icon icon-info text-muted"
                                      data-bs-toggle="tooltip"
                                      title="Default tooltip"
                                    />
                                  </div>
                                  <div className="fw-bold">3.00&#8377;</div>
                                </div>
                                {deliveryoption ? (
                                  <div className="d-flex align-items-center justify-content-between  mb-2">
                                    <div>
                                      Delivery Fee{" "}
                                      <i
                                        className="feather-icon icon-info text-muted"
                                        data-bs-toggle="tooltip"
                                        title="Default tooltip"
                                      />
                                    </div>
                                    <div className="fw-bold">
                                      {deliveryoption.price}&#8377;
                                    </div>
                                  </div>
                                ) : (
                                  <div className="d-flex align-items-center justify-content-between   mb-2"></div>
                                )}
                              </li>
                              {/* list group item */}
                              <li className="list-group-item px-4 py-3">
                                <div className="d-flex align-items-center justify-content-between fw-bold">
                                  <div>Subtotal</div>
                                  <div>
                                    {totalAmount + deliveryoption.price + 3}
                                    &#8377;
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopCheckOut;
