import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ProductItem = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getRandomProducts = (array, num) => {
      const shuffled = array.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    };

    const getProducts = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const res = await axios.get("http://localhost:5000/api/product/", {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        });

        if (Array.isArray(res.data.products)) {
          const selectedProducts = getRandomProducts(res.data.products, 10);
          setProducts(selectedProducts);
        } else {
          alert("No products found");
        }
      } catch (error) {
        console.log("Error while fetching products:", error);
      }
    };

    getProducts();
  }, []);

  return (
    <div>
      {/* Popular Products Start*/}
      <section className="my-lg-14 my-8">
        <div className="container">
          <div className="row">
            <div className="col-12 mb-6">
              <div className="section-head text-center mt-8">
                <h3 className="h3style" data-title="Popular Products">
                  Popular Products
                </h3>
                <div className="wt-separator bg-primarys"></div>
                <div className="wt-separator2 bg-primarys"></div>
              </div>
            </div>
          </div>
          <div className="row g-4 row-cols-lg-5 row-cols-2 row-cols-md-3">
            {products.map((product, index) => (
              <div className="col fade-zoom" key={index}>
                <div className="card card-product">
                  <div className="card-body" style={{ minHeight: "300px" }}>
                    <div className="text-center position-relative">
                      <Link href="#!">
                        <img
                          src={product.prod_img}
                          alt={product.name}
                          className="mb-3 img-fluid"
                          style={{
                            maxHeight: "150px",
                            width: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </Link>
                      <div className="card-product-action">
                        <Link
                          href="#!"
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
                          href="#!"
                          className="btn-action"
                          data-bs-toggle="tooltip"
                          data-bs-html="true"
                          title="Wishlist"
                        >
                          <i className="bi bi-heart" />
                        </Link>
                        <Link
                          href="#!"
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
                        href="#!"
                        className="text-decoration-none text-muted"
                      >
                        <small>{product.department}</small>
                      </Link>
                    </div>
                    <h2 className="fs-6">
                      <Link
                        href="#!"
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Popular Products End*/}
    </div>
  );
};

export default ProductItem;
