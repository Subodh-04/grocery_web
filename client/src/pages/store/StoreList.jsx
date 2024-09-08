import React, { useEffect, useState } from "react";
import axios from "axios";
import graphics from "../../images/store-graphics.svg";
import storelogo1 from "../../images/stores-logo-1.svg";
import storelogo2 from "../../images/stores-logo-2.svg";
import storelogo3 from "../../images/stores-logo-3.svg";
import storelogo4 from "../../images/stores-logo-4.svg";
import storelogo5 from "../../images/stores-logo-5.svg";
import storelogo6 from "../../images/stores-logo-6.svg";
import storelogo7 from "../../images/stores-logo-7.svg";
import storelogo8 from "../../images/stores-logo-8.svg";
import storeLogo9 from "../../images/stores-logo-9.svg";

import { Slide, Zoom } from "react-awesome-reveal";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../ScrollToTop";
import { Link } from "react-router-dom";
// import storelogo10 from '../images/store'
// import storelogofrom '../images/store-graphics-2.svg'

const StoreList = () => {
  // loading
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [stores, setStores] = useState([]);
  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);
  }, []);
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get("http://localhost:5000/api/store/", {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        });
        if (!response) {
          console.log("stores not found.");
        }
        console.log(response.data.Stores);
        
        setStores(response.data.Stores);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchStores();
  }, []);

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
              {/* section*/}
              <div className="mt-4">
                <div className="container">
                  {/* row */}
                  <div className="row ">
                    {/* col */}
                    <div className="col-12">
                      {/* breadcrumb */}
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
            </>
            <>
              {/* section */}
              <section className="mt-8">
                {/* container */}
                <div className="container">
                  {/* row */}
                  <div className="row">
                    <div className="col-12">
                      {/* heading */}
                      <div className="bg-light rounded-3 d-flex justify-content-between">
                        <div className="d-flex align-items-center  p-10">
                          <Slide direction="down">
                            <h1 className="mb-0 fw-bold">Stores</h1>
                          </Slide>
                        </div>
                        <div className="p-6">
                          {/* img */}
                          {/* img */}
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
            </>
            <>
              <section className="mt-6 mb-lg-14 mb-8">
                {/* container */}
                <div className="container">
                  <div className="row">
                    <div className="col-12">
                      <div className="mb-4">
                        <h6>
                          We have{" "}
                          <span className="text-primary">{stores.length}</span>{" "}
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
                                src={store.storeImage || "default-logo.png"} // Provide a default image if store.logo is unavailable
                                alt="stores"
                                className="rounded-circle icon-shape icon-xl"
                              />
                            </div>
                            <div className="ms-6">
                              <h5 className="mb-1">
                                <Link to={`/Single-Store/${store._id}`} className="text-inherit">
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
                                    {store.proximity}  away
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Zoom>
                    ))}
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

export default StoreList;