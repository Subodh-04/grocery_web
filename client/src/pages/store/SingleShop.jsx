import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link, useParams } from "react-router-dom";

import graphics from "../../images/store-graphics.svg";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../ScrollToTop";
import axios from "axios";
import { toast } from "react-toastify";
const SingleShop = () => {
  // loading
  const [loaderStatus, setLoaderStatus] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);
  }, []);
  const [storeDet, setStoreDet] = useState({});
  const [products, setProducts] = useState([]);
  const [sortproducts, setSortproducts] = useState("Featured");
  const [selectedcategory, setSelectedcategory] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const { id } = useParams(); // Extract storeId from the URL
  const handleCategoryClick = (category) => {
    setSelectedcategory(category);
    setCurrentPage(1);
  };

  console.log("Selected Category:", selectedcategory);

  useEffect(() => {
    if (selectedcategory) {
      const fetchCategoryProducts = async () => {
        try {
          const userData = JSON.parse(localStorage.getItem("userData"));
          const storeId = id; // storeId from the URL

          const res = await axios.get(
            `http://localhost:5000/api/product/inventory/prod/${storeId}/${selectedcategory}`,
            {
              headers: {
                Authorization: `Bearer ${userData.token}`,
              },
            }
          );
          setProducts(res.data.products); // Store products
        } catch (error) {
          console.error("Error fetching products:", error.message);
          alert("Failed to fetch products");
        }
      };
      fetchCategoryProducts();
    }
  }, [selectedcategory, id]);

  // Fetch store details
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get(
          `http://localhost:5000/api/store/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );

        if (!response.data) {
          console.log("Store not found");
          alert("Store not found");
          return;
        }

        setStoreDet(response.data.data); // Store store details
        setProducts(response.data.products); // Store products initially
        setTotalProducts(response.data.totalProducts);
      } catch (error) {
        console.log("Error fetching store: ", error.message);
        alert("Failed to fetch data");
      }
    };
    fetchStore();
  }, [id]);

  // Handle sorting products
  const handleSortChange = (e) => {
    const sortingCriteria = e.target.value;
    setSortproducts(sortingCriteria);

    let sorted = [...products]; // Create a copy of the products array
    if (sortingCriteria === "Low to High") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortingCriteria === "High to Low") {
      sorted.sort((a, b) => b.price - a.price);
    }

    setProducts(sorted); // Update the sorted products in the state
  };

  const handleaddtocart = async (productId) => {
    try {
      console.log(productId);
      
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios.post(
        "http://localhost:5000/api/order/cart/add",
        {
          productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      toast.success(response.data.message);
      console.log(response.data);
    } catch (error) {
      console.log("error while adding to cart:", error);
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                  <div className="row">
                    {/* col */}
                    <div className="col-12"></div>
                  </div>
                </div>
              </div>
            </>
            <>
              {/* section */}
              <section className="mb-lg-14 mb-8 mt-8">
                <div className="container">
                  {/* row */}
                  <div className="row">
                    <div className="col-12 col-lg-3 col-md-4 mb-4 mb-md-0">
                      <div className="d-flex flex-column">
                        <div>
                          {/* img */}
                          {/* img */}
                          <img
                            src={storeDet.storeImage}
                            style={{
                              width: 200,
                              marginBottom: 10,
                              marginLeft: "-15px",
                            }}
                            alt="eCommerce HTML Template"
                          />
                        </div>
                        {/* heading */}
                        <div className="mt-4">
                          <h1 className="mb-1 h4">{storeDet.storeName}</h1>
                          <div className="small text-muted">
                            <span>Everyday store prices </span>
                          </div>
                          <div>
                            <span>
                              <small>
                                <Link to="#!">100% satisfaction guarantee</Link>
                              </small>
                            </span>
                          </div>
                        </div>
                      </div>
                      <hr />
                      {/* nav */}
                      <ul className="nav flex-column nav-pills nav-pills-dark">
                        {/* nav item */}
                        <li className="nav-item">
                          <Link
                            className="nav-link active"
                            aria-current="page"
                            to="#"
                          >
                            <i className="feather-icon icon-shopping-bag me-2" />
                            Shop
                          </Link>
                        </li>
                        {/* nav item */}
                        <li className="nav-item">
                          <Link className="nav-link" to="#">
                            <i className="fas fa-gift me-2" />
                            Deals
                          </Link>
                        </li>
                        {/* nav item */}
                        <li className="nav-item">
                          <Link className="nav-link" to="#">
                            <i className="fas fa-map-pin me-2" />
                            Buy It Again
                          </Link>
                        </li>
                        {/* nav item */}
                        <li className="nav-item">
                          <Link className="nav-link" to="#">
                            <i className="fas fa-star me-2" />
                            Reviews
                          </Link>
                        </li>
                        {/* nav item */}
                        <li className="nav-item">
                          <Link className="nav-link" to="#">
                            <i className="fas fa-book me-2" />
                            Recipes
                          </Link>
                        </li>
                        {/* nav item */}
                        <li className="nav-item">
                          <Link className="nav-link" to="#">
                            <i className="fas fa-phone-alt me-2" />
                            Contact
                          </Link>
                        </li>
                        {/* nav item */}
                        <li className="nav-item">
                          <Link className="nav-link" to="#">
                            <i className="fas fa-clipboard me-2" />
                            Policy
                          </Link>
                        </li>
                      </ul>
                      <hr />
                      <div>
                        <ul className="nav flex-column nav-links">
                          {storeDet.categories.map((category, index) => (
                            <li className="nav-item" key={index}>
                              <button
                                onClick={() => handleCategoryClick(category)}
                                className="nav-link"
                              >
                                {category}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="col-12 col-lg-9 col-md-8">
                      <div className="mb-8 bg-light rounded-3 d-lg-flex justify-content-lg-between">
                        <div className="align-self-center p-8">
                          <div className="mb-3">
                            <h5 className="mb-0 fw-bold">
                              {storeDet.storeName}
                            </h5>
                            <p className="mb-0 text-muted">
                              Whatever the occasion, we've got you covered.
                            </p>
                          </div>
                          <div className="position-relative">
                            <input
                              type="email"
                              className="form-control"
                              id="exampleFormControlInput1"
                              placeholder="Search E-Grocery Super Market"
                            />
                            <span className="position-absolute end-0 top-0 mt-2 me-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={14}
                                height={14}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-search"
                              >
                                <circle cx={11} cy={11} r={8} />
                                <line x1={21} y1={21} x2="16.65" y2="16.65" />
                              </svg>
                            </span>
                          </div>
                        </div>
                        <div className="py-4">
                          {/* img */}
                          <img
                            src={graphics}
                            alt="stores"
                            className="img-fluid"
                          />
                        </div>
                      </div>
                      <div className="d-md-flex justify-content-between mb-3 align-items-center">
                        <div>
                          <p className="mb-3 mb-md-0">
                            {totalProducts} Products found
                          </p>
                        </div>
                        <div className="d-flex justify-content-md-between align-items-center">
                          <div>
                            {/* select option */}
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              onChange={handleSortChange}
                            >
                              <option selected>Sort by: Featured</option>
                              <option value="Low to High">
                                Price: Low to High
                              </option>
                              <option value="High to Low">
                                Price: High to Low
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                      {/* row */}
                      <div className="row g-4 row-cols-xl-4 row-cols-lg-3 row-cols-2 row-cols-md-2 mt-2">
                        {currentProducts.map((product, index) => (
                          <div className="col" key={index}>
                            <div className="card card-product">
                              <div className="card-body">
                                <div className="text-center position-relative">
                                  {product.onSale && (
                                    <div className="position-absolute top-0 start-0">
                                      <span className="badge bg-danger">
                                        Sale
                                      </span>
                                    </div>
                                  )}
                                  <Link to="#!">
                                    <img
                                      src={
                                        product.prod_img ||
                                        "default-product-image-url"
                                      } // fallback if no image
                                      alt={product.name}
                                      className="mb-3 img-fluid"
                                      style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "contain",
                                      }}
                                    />
                                  </Link>
                                  <div className="card-product-action">
                                    <Link
                                      to="#!"
                                      className="btn-action"
                                      data-bs-toggle="modal"
                                      data-bs-target="#quickViewModal"
                                    >
                                      <i
                                        className="bi bi-eye"
                                        title="Quick View"
                                      />
                                    </Link>
                                    <Link
                                      to="#!"
                                      className="btn-action"
                                      title="Wishlist"
                                    >
                                      <i className="bi bi-heart" />
                                    </Link>
                                    <Link
                                      to="#!"
                                      className="btn-action"
                                      title="Compare"
                                    >
                                      <i className="bi bi-arrow-left-right" />
                                    </Link>
                                  </div>
                                </div>
                                <div className="text-small mb-1">
                                  <Link
                                    to="#!"
                                    className="text-decoration-none text-muted"
                                  >
                                    <small>{product.department}</small>
                                  </Link>
                                </div>
                                <h2 className="fs-6">
                                  <Link
                                    to="#!"
                                    className="text-inherit text-decoration-none"
                                  >
                                    {product.name}
                                  </Link>
                                </h2>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                  <div>
                                    <span className="text-dark">
                                      {product.price}&#8377;
                                    </span>
                                    {product.originalPrice && (
                                      <span className="text-decoration-line-through text-muted">
                                        {product.originalPrice}&#8377;
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleaddtocart(product._id)}
                                    >
                                      <i className="feather feather-plus"></i>{" "}
                                      Add
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* row */}
                      <div className="row mt-8">
                        <div className="col">
                          {/* nav */}
                          <nav>
                            <ul className="pagination">
                              {/* Previous button */}
                              <li
                                className={`page-item ${
                                  currentPage === 1 ? "disabled" : ""
                                }`}
                              >
                                <Link
                                  className="page-link mx-1 rounded-3"
                                  to="#"
                                  onClick={() => paginate(currentPage - 1)}
                                  aria-label="Previous"
                                >
                                  <i className="fa fa-chevron-left" />
                                </Link>
                              </li>

                              {/* Dynamic page numbers */}
                              {Array.from({
                                length: Math.ceil(
                                  products.length / productsPerPage
                                ),
                              }).map((_, index) => (
                                <li
                                  className={`page-item ${
                                    index + 1 === currentPage ? "active" : ""
                                  }`}
                                  key={index}
                                >
                                  <Link
                                    className="page-link mx-1 rounded-3"
                                    to="#"
                                    onClick={() => paginate(index + 1)}
                                  >
                                    {index + 1}
                                  </Link>
                                </li>
                              ))}

                              {/* Next button */}
                              <li
                                className={`page-item ${
                                  currentPage ===
                                  Math.ceil(products.length / productsPerPage)
                                    ? "disabled"
                                    : ""
                                }`}
                              >
                                <Link
                                  className="page-link mx-1 rounded-3"
                                  to="#"
                                  onClick={() => paginate(currentPage + 1)}
                                  aria-label="Next"
                                >
                                  <i className="fa fa-chevron-right" />
                                </Link>
                              </li>
                            </ul>
                          </nav>
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

export default SingleShop;
