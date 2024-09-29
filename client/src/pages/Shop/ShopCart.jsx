import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../ScrollToTop";
import { decreaseCartQuantity, fetchCart, getUserToken, increaseCartQuantity, removeFromCart } from "../../api";

const ShopCart = () => {
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [cart, setCart] = useState([]);
  const [totalamount, setTotalAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);
  }, []);

  useEffect(() => {
    const getCart = async () => {
      try {
        const token = getUserToken();
        if (!token) {
          alert("User not authenticated");
          return;
        }

        const cartData = await fetchCart(token);
        setCart(cartData.cart);
        setTotalAmount(cartData.totalAmount);
      } catch (error) {
        console.error(error.message);
        alert("Failed to fetch cart data");
      }
    };

    getCart();
  }, [cart]);

  const handleRemove = async (productId) => {
    try {
      const token = getUserToken();
      if (!token) {
        alert("User not authenticated");
        return;
      }

      await removeFromCart(productId, token);
      setCart(cart.filter((item) => item.productId !== productId));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleDecrease = async (productId) => {
    try {
      const token = getUserToken();
      if (!token) {
        alert("User not authenticated");
        return;
      }

      const updatedCart = await decreaseCartQuantity(productId, token);
      setCart(updatedCart.cart);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleIncrease = async (productId) => {
    try {
      const token = getUserToken();
      if (!token) {
        alert("User not authenticated");
        return;
      }

      const updatedCart = await increaseCartQuantity(productId, token);
      setCart(updatedCart.cart);
    } catch (error) {
      console.error(error.message);
    }
  };

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
              <div>
                {/* section*/}

                {/* section */}
                <section className="mb-lg-14 mb-8 mt-8">
                  <div className="container">
                    {/* row */}
                    <div className="row">
                      <div className="col-12">
                        {/* card */}
                        <div className="card py-1 border-0 mb-8">
                          <div>
                            <h1 className="fw-bold">Shop Cart</h1>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* row */}
                    <div className="row">
                      <div className="col-lg-8 col-md-7">
                        <div className="py-3">
                          <ul
                            className="list-group list-group-flush"
                            style={{
                              maxHeight: "400px",
                              overflowY: "auto",
                              overflowX: "hidden",
                            }}
                          >
                            {cart.length === 0 ? (
                              <div
                                className="alert alert-info p-2"
                                role="alert"
                              >
                                Your cart is empty. Start{" "}
                                <Link to="#!" className="alert-link">
                                  shopping now!
                                </Link>
                              </div>
                            ) : (
                              <>
                                <div
                                  className="alert alert-danger p-2"
                                  role="alert"
                                >
                                  You’ve got FREE delivery. Start{" "}
                                  <Link to="#!" className="alert-link">
                                    checkout now!
                                  </Link>
                                </div>
                                <ul
                                  className="list-group list-group-flush"
                                  style={{
                                    maxHeight: "400px",
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                  }}
                                >
                                  {cart.map((item) => (
                                    <li
                                      className="list-group-item py-3 py-lg-0 px-0 border-top"
                                      key={item.productId}
                                    >
                                      <div className="row align-items-center">
                                        <div className="col-3 col-md-2">
                                          <img
                                            src={item.image}
                                            alt="Ecommerce"
                                            className="img-fluid"
                                            style={{
                                              width: "100px",
                                              height: "100px",
                                              objectFit: "contain",
                                            }}
                                          />
                                        </div>
                                        <div className="col-4 col-md-6">
                                          <h6 className="mb-0">{item.name}</h6>
                                          <span>
                                            <small className="text-muted">
                                              {item.unit}
                                            </small>{" "}
                                          </span>
                                          <div className="mt-2 small ">
                                            <button
                                              onClick={() =>
                                                handleRemove(item.productId)
                                              }
                                              className="text-decoration-none text-inherit bg-transparent border-0"
                                            >
                                              <span className="me-1 align-text-bottom">
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width={16}
                                                  height={16}
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth={2}
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  className="feather feather-trash-2 text-success"
                                                >
                                                  <polyline points="3 6 5 6 21 6" />
                                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                  <line
                                                    x1={10}
                                                    y1={11}
                                                    x2={10}
                                                    y2={17}
                                                  />
                                                  <line
                                                    x1={14}
                                                    y1={11}
                                                    x2={14}
                                                    y2={17}
                                                  />
                                                </svg>
                                              </span>
                                              <span className="text-muted">
                                                Remove
                                              </span>
                                            </button>
                                          </div>
                                        </div>
                                        <div className="col-3 col-md-3 col-lg-2">
                                          <div className="input-group flex-nowrap justify-content-center">
                                            <input
                                              type="button"
                                              defaultValue="-"
                                              className="button-minus form-control text-center flex-xl-none w-xl-30 w-xxl-10 px-0"
                                              data-field="quantity"
                                              onClick={() => {
                                                handleDecrease(item.productId);
                                              }}
                                            />
                                            <input
                                              type="number"
                                              step={1}
                                              max={10}
                                              value={item.quantity}
                                              name="quantity"
                                              className="quantity-field form-control text-center flex-xl-none w-xl-30 w-xxl-10 px-0"
                                            />
                                            <input
                                              type="button"
                                              defaultValue="+"
                                              className="button-plus form-control text-center flex-xl-none w-xl-30 w-xxl-10 px-0"
                                              data-field="quantity"
                                              onClick={() => {
                                                handleIncrease(item.productId);
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <div className="col-2 text-lg-end text-start text-md-end col-md-2">
                                          <span className="fw-bold">
                                            {item.totalPrice}&#8377;
                                          </span>{" "}
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                                <div className="d-flex justify-content-between mt-4">
                                  <Link to="#!" className="btn btn-primary">
                                    Continue Shopping
                                  </Link>
                                  <Link to="#!" className="btn btn-dark">
                                    Update Cart
                                  </Link>
                                </div>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                      {/* sidebar */}
                      <div className="col-12 col-lg-4 col-md-5">
                        {/* card */}
                        <div className="mb-5 card mt-6">
                          <div className="card-body p-6">
                            {/* heading */}
                            <h2 className="h5 mb-4">Summary</h2>
                            <div className="card mb-2">
                              {/* list group */}
                              <ul className="list-group list-group-flush">
                                {/* list group item */}
                                <li className="list-group-item d-flex justify-content-between align-items-start">
                                  <div className="me-auto">
                                    <div>Item Subtotal</div>
                                  </div>
                                  <span>{totalamount}&#8377;</span>
                                </li>

                                {/* list group item */}
                                <li className="list-group-item d-flex justify-content-between align-items-start">
                                  <div className="me-auto">
                                    <div className="fw-bold">Subtotal</div>
                                  </div>
                                  <span className="fw-bold">
                                    {totalamount}&#8377;
                                  </span>
                                </li>
                              </ul>
                            </div>
                            <div className="d-grid mb-1 mt-4">
                              {/* btn */}
                              <button
                                className="btn btn-primary btn-lg d-flex justify-content-between align-items-center"
                                type="submit"
                                onClick={() => {
                                  navigate("/ShopCheckOut");
                                }}
                              >
                                Go to Checkout{" "}
                                <span className="fw-bold">
                                  {totalamount}&#8377;
                                </span>
                              </button>
                            </div>
                            {/* text */}
                            <p>
                              <small>
                                By placing your order, you agree to be bound by
                                the FreshFinds{" "}
                                <Link to="#!">Terms of Service</Link>
                                and <Link to="#!">Privacy Policy.</Link>{" "}
                              </small>
                            </p>
                            {/* heading */}
                            <div className="mt-8">
                              <h2 className="h5 mb-3">
                                Add Promo or Gift Card
                              </h2>
                              <form>
                                <div className="mb-2">
                                  {/* input */}
                                  <label
                                    htmlFor="giftcard"
                                    className="form-label sr-only"
                                  >
                                    Email address
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="giftcard"
                                    placeholder="Promo or Gift Card"
                                  />
                                </div>
                                {/* btn */}
                                <div className="d-grid">
                                  <button
                                    type="submit"
                                    className="btn btn-outline-dark mb-1"
                                  >
                                    Redeem
                                  </button>
                                </div>
                                <p className="text-muted mb-0">
                                  {" "}
                                  <small>Terms &amp; Conditions apply</small>
                                </p>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopCart;
