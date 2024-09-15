import React, { useEffect, useState } from "react";
import { MagnifyingGlass } from "react-loader-spinner";
import { Link, useParams } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

import ScrollToTop from "../ScrollToTop";
import axios from "axios";

function Dropdown() {
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [departmentsAndTypes, setDepartmentsAndTypes] = useState([]);
  const [type, setType] = useState("");
  const [openDropdowns, setOpenDropdowns] = useState([]);
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  const { department } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get(
          `http://localhost:5000/api/product/${department}`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );
        console.log("data:", response.data);

        setProducts(response.data.products);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [department]);

  useEffect(() => {
    const getprod = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const res = await axios.get(
          `http://localhost:5000/api/product/${department}/${type}`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );
        if(!res){
          console.log("not found:",res.data);
        }
        console.log("data found:",res.data);
        setProducts(res.data.products);
      } catch (error) {
        console.log("error fetching products:", error);
      }
    };
    getprod();
  },[department,type]);


  useEffect(() => {
    const fetchDepartmentsAndTypes = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get(
          "http://localhost:5000/api/product/departmentsandtypes",
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );

        if (response.data.success) {
          setDepartmentsAndTypes(response.data.data);
          setLoaderStatus(false);
        } else {
          console.error("Error fetching data:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching departments and types:", error);
      }
    };
    fetchDepartmentsAndTypes();
  }, []);

  const toggleDropdown = (index) => {
    setOpenDropdowns((prevOpenDropdowns) =>
      prevOpenDropdowns.includes(index)
        ? prevOpenDropdowns.filter((i) => i !== index)
        : [...prevOpenDropdowns, index]
    );
  };

  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);
  }, []);

  const handleViewChange = (view) => {
    setViewMode(view);
  };
  const productClasses = {
    list: "row row-cols-1 gap-2",
    grid: "row row-cols-2 row-cols-md-2",
    gridgap: "row row-cols-4 row-cols-md-4",
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
          <div className="container ">
            <div className="row">
              {/* Vertical Dropdowns Column */}
              <h5 className="mb-3 mt-8">Categories</h5>
              <div className="col-md-3">
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
                  departmentsAndTypes.map(([department, types], index) => (
                    <ul className="nav flex-column" key={index}>
                      <li className="nav-item">
                        <Link
                          className="nav-link"
                          to={`/shop/${department}`}
                          onClick={() => {
                            toggleDropdown(index);;
                          }}
                          aria-expanded={
                            openDropdowns.includes(index) ? "true" : "false"
                          }
                          aria-controls={`categoryFlush${index + 1}`}
                        >
                          {department} <i className="fa fa-chevron-down" />
                        </Link>
                        <div
                          className={`collapse ${
                            openDropdowns.includes(index) ? "show" : ""
                          }`}
                          id={`categoryFlush${index + 1}`}
                        >
                          <div>
                            <ul className="nav flex-column ms-3">
                              {types.map((type, itemIndex) => (
                                <li className="nav-item" key={itemIndex}>
                                  <Link className="nav-link" to="#" onClick={()=>setType(type)}>
                                    {type}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
                  ))
                )}
              </div>
              {/* Cards Column */}
              <div className="col-lg-9 col-md-8">
                {/* card */}
                <div className="card mb-4 bg-light border-0">
                  {/* card body */}
                  <div className=" card-body p-9">
                    <h1 className="mb-0">{department}</h1>
                  </div>
                </div>
                {/* list icon */}
                <div className="d-md-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-3 mb-md-0">
                      {" "}
                      <span className="text-dark">{products.length}</span>{" "}
                      Products found{" "}
                    </p>
                  </div>
                  {/* icon */}
                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      className={`text-muted me-3 border-0 bg-transparent ${
                        viewMode === "list" ? "active" : ""
                      }`}
                      onClick={() => handleViewChange("list")}
                    >
                      <i className="bi bi-list-ul" />
                    </button>

                    <button
                      className={`me-3 border-0 bg-transparent ${
                        viewMode === "grid" ? "active" : ""
                      }`}
                      onClick={() => handleViewChange("grid")}
                    >
                      <i className="bi bi-grid" />
                    </button>

                    <button
                      className={`me-3 text-muted border-0 bg-transparent ${
                        viewMode === "gridgap" ? "active" : ""
                      } d-none d-md-block`}
                      onClick={() => handleViewChange("gridgap")}
                    >
                      <i className="bi bi-grid-3x3-gap" />
                    </button>
                    <div>
                      {/* select option */}
                      <select
                        className="form-select"
                        aria-label="Default select example"
                      >
                        <option selected>Sort by: Featured</option>
                        <option value="Low to High">Price: Low to High</option>
                        <option value="High to Low"> Price: High to Low</option>
                        <option value="Release Date"> Release Date</option>
                        <option value="Avg. Rating"> Avg. Rating</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* row */}
                <div className="container">
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
                    <div className={productClasses[viewMode]}>
                      {currentProducts.length === 0 ? (
                        <div className="col-12 text-center">
                          <p>No products available.</p>
                        </div>
                      ) : (
                        currentProducts.map((product, index) => (
                          <div className="col" key={index}>
                            <div className="card card-product m-1">
                              <div className="card-body">
                                <div className="text-center position-relative">
                                  <div className="position-absolute top-0 start-0">
                                    <span className="badge bg-danger">
                                      Sale
                                    </span>
                                  </div>
                                  <Link to="#!">
                                    <img
                                      src={product.prod_img}
                                      alt={product.name}
                                      className="mb-3 img-fluid"
                                      style={{
                                        height: "200px",
                                        width: "200px",
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
                                        data-bs-toggle="tooltip"
                                        data-bs-html="true"
                                        title="Quick View"
                                      />
                                    </Link>
                                    <Link
                                      to="shop-wishlist.html"
                                      className="btn-action"
                                      data-bs-toggle="tooltip"
                                      data-bs-html="true"
                                      title="Wishlist"
                                    >
                                      <i className="bi bi-heart" />
                                    </Link>
                                    <Link
                                      to="#!"
                                      className="btn-action"
                                      data-bs-toggle="tooltip"
                                      data-bs-html="true"
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
                                    <small>{product.category}</small>
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
                                    </span>{" "}
                                    <span className="text-decoration-line-through text-muted">
                                      {product.originalPrice}
                                    </span>
                                  </div>
                                  <div>
                                    <Link
                                      to="#!"
                                      className="btn btn-primary btn-sm"
                                    >
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
                                        className="feather feather-plus"
                                      >
                                        <line x1={12} y1={5} x2={12} y2={19} />
                                        <line x1={5} y1={12} x2={19} y2={12} />
                                      </svg>{" "}
                                      Add
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {/* pagination*/}
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
                          length: Math.ceil(products.length / productsPerPage),
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
        </>
      )}
    </div>
  );
}

export default Dropdown;
