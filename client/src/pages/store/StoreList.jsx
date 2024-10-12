import React, { useEffect, useState } from "react";
import graphics from "../../images/store-graphics.svg";
import { Slide, Zoom } from "react-awesome-reveal";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../ScrollToTop";
import { Link } from "react-router-dom";
import { fetchStores } from "../../api";
import { useNavigate } from "react-router-dom";
import "../../App.css";

const StoreList = () => {
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [stores, setStores] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const navigate = useNavigate(); // Used for navigation

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);

    // Check if user is logged in (this could be a JWT token in localStorage or session)
    const token = localStorage.getItem("userData"); // Or use another auth check
    if (token) {
      setIsLoggedIn(true); // Set logged-in status if token exists
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const getStores = async () => {
      if (isLoggedIn) {
        const fetchedStores = await fetchStores();
        setStores(fetchedStores);
      }
    };

    getStores();
  }, [isLoggedIn]); // Fetch stores only if user is logged in

  return (
    <div>
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
            <div className="mt-4">
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item">
                          <a href="#!">Home</a>
                        </li>
                        <li className="breadcrumb-item">
                          <a href="#!">Stores</a>
                        </li>
                        <li
                          className="breadcrumb-item active"
                          aria-current="page"
                        >
                          Store List
                        </li>
                      </ol>
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-8">
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <div className="bg-light rounded-3 d-flex justify-content-between">
                      <div className="d-flex align-items-center  p-10">
                        <Slide direction="down">
                          <h1 className="mb-0 fw-bold">Stores</h1>
                        </Slide>
                      </div>
                      <div className="p-6">
                        <Zoom>
                          <img
                            src={graphics}
                            alt="graphics"
                            className="img-fluid"
                          />
                        </Zoom>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 mb-lg-14 mb-8">
              <div className="container">
                {isLoggedIn ? (
                  <>
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-4">
                          <h6>
                            We have{" "}
                            <span className="text-primary">
                              {stores.length}
                            </span>{" "}
                            vendors now
                          </h6>
                        </div>
                      </div>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 g-lg-4">
                      {stores.map((store) => (
                        <Zoom key={store._id}>
                          <div className="col">
                            <div className="card flex-row p-8 card-product">
                              <div>
                                <img
                                  src={store.storeImage || "default-logo.png"}
                                  alt="stores"
                                  className="rounded-circle icon-shape icon-xl"
                                />
                              </div>
                              <div className="ms-6">
                                <h5 className="mb-1">
                                  <Link
                                    to={`/Single-Store/${store._id}`}
                                    className="text-inherit"
                                  >
                                    {store.storeName}
                                  </Link>
                                </h5>
                                <div className="small text-muted">
                                  {store.categories.map((category, index) => (
                                    <span key={index}>
                                      {category}
                                      {index < store.categories.length - 1 && (
                                        <span className="mx-1">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={4}
                                            height={4}
                                            fill="#C1C7C6"
                                            className="bi bi-circle-fill align-middle"
                                            viewBox="0 0 16 16"
                                          >
                                            <circle cx={8} cy={8} r={8} />
                                          </svg>
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                                <div className="py-3">
                                  <ul className="list-unstyled mb-0 small">
                                    {store.deliveryOptions}
                                  </ul>
                                </div>
                                <div>
                                  {store.proximity && (
                                    <div className="badge text-bg-light border">
                                      {store.proximity} away
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Zoom>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="container">
                    <div className="overlay-background"></div>{" "}
                    {/* Semi-transparent background */}
                    <div className="overlay-message">
                      <h2>Please log in to see the stores</h2>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate("/MyAccountSignIn")}
                      >
                        Log in
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default StoreList;
