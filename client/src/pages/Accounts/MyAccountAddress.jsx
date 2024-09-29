import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass } from "react-loader-spinner";
import ScrollToTop from "../ScrollToTop";
import { toast } from "react-toastify";
import {
  addAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
} from "../../api";

const MyAccountAddress = () => {
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [address, setAddress] = useState([]);
  const [editmode, setEditmode] = useState(false);
  const [formdata, setFormdata] = useState({
    firstname: "",
    lastname: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    isdefault: false,
  });

  const [selectedAddress, setSelectedAddress] = useState([]);

  const handleDeleteClick = (address) => {
    setSelectedAddress(address);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormdata((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleAddAddress = async () => {
    setEditmode(false);
    try {
      const street = `${formdata.address1} | ${formdata.address2}`;
      const name = `${formdata.firstname} ${formdata.lastname}`;
      const addressData = {
        name,
        street,
        city: formdata.city,
        state: formdata.state,
        country: formdata.country,
        zip: formdata.zip,
        isdefault: formdata.isdefault,
      };
      const res = await addAddress(addressData);
      toast.success(res.message);

      setFormdata({
        firstname: "",
        lastname: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        country: "",
        zip: "",
        isdefault: false,
      });
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await deleteAddress(addressId);
      toast.success(res.message);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleEditAddress = async (addressId) => {
    try {
      const add = address.find((addr) => addr._id === addressId);
      if (!add) {
        toast.error("Address not found.");
        return;
      }

      const [firstname, lastname] = (add.name || "").split(" ");
      const [address1, address2] = (add.street || "").split(" | ");

      setFormdata({
        firstname: firstname || "",
        lastname: lastname || "",
        address1: address1 || "",
        address2: address2 || "",
        city: add.city || "",
        state: add.state || "",
        zip: add.zip || "",
        country: add.country || "",
        isdefault: add.isdefault || false,
      });

      setEditmode(true);
      setSelectedAddress(add); // Save the selected address for updating later
    } catch (error) {
      console.error("Error preparing address for editing:", error);
      toast.error("An error occurred while preparing the address.");
    }
  };

  const handleUpdateAddress = async () => {
    if (!selectedAddress) {
      toast.error("No address selected for update.");
      return;
    }

    const street = `${formdata.address1} | ${formdata.address2}`;
    const name = `${formdata.firstname} ${formdata.lastname}`;
    const addressData = {
      name,
      street,
      city: formdata.city,
      state: formdata.state,
      country: formdata.country,
      zip: formdata.zip,
      isdefault: formdata.isdefault,
    };

    try {
      const res = await updateAddress(selectedAddress._id, addressData);
      toast.success(res.message);

      // Update the address list in local state
      setAddress((prevAddresses) =>
        prevAddresses.map((addr) =>
          addr._id === selectedAddress._id ? { ...addr, ...addressData } : addr
        )
      );

      // Reset state
      setEditmode(false);
      setFormdata({
        firstname: "",
        lastname: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        country: "",
        zip: "",
        isdefault: false,
      });
      setSelectedAddress(null); // Clear selected address
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("An error occurred while updating the address.");
    }
  };

  useEffect(() => {
    const getAddress = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      try {
        const addressList = await fetchAddresses(userData.userId);
        setAddress(addressList);
      } catch (error) {
        console.error(error);
      }
    };

    getAddress();
  }, [address]);
  return (
    <div>
      <>
        <ScrollToTop />
      </>
      <>
        <div>
          {/* section */}
          <section>
            {/* container */}
            <div className="container">
              {/* row */}
              <div className="row">
                {/* col */}
                <div className="col-12">
                  <div className="p-6 d-flex justify-content-between align-items-center d-md-none">
                    {/* heading */}
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
                {/* col */}
                <div className="col-lg-3 col-md-4 col-12 border-end  d-none d-md-block">
                  <div className="pt-10 pe-lg-10">
                    {/* nav */}
                    <ul className="nav flex-column nav-pills nav-pills-dark">
                      {/* nav item */}
                      <li className="nav-item">
                        {/* nav link */}
                        <Link
                          className="nav-link "
                          aria-current="page"
                          to="/MyAccountOrder"
                        >
                          <i className="fas fa-shopping-bag me-2" />
                          Your Orders
                        </Link>
                      </li>
                      {/* nav item */}
                      <li className="nav-item">
                        <Link className="nav-link " to="/MyAccountSetting">
                          <i className="fas fa-cog me-2" />
                          Settings
                        </Link>
                      </li>
                      {/* nav item */}
                      <li className="nav-item">
                        <Link
                          className="nav-link active"
                          to="/MyAccountAddress"
                        >
                          <i className="fas fa-map-marker-alt me-2" />
                          Address
                        </Link>
                      </li>
                      {/* nav item */}
                      <li className="nav-item">
                        <Link className="nav-link" to="/MyAccountNotification">
                          <i className="fas fa-bell me-2" />
                          Notification
                        </Link>
                      </li>
                      {/* nav item */}
                      <li className="nav-item">
                        <hr />
                      </li>
                      {/* nav item */}
                      <li className="nav-item">
                        <Link className="nav-link " to="/Grocery-react/">
                          <i className="fas fa-sign-out-alt me-2" />
                          Log out
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-9 col-md-8 col-12">
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
                        <div className="p-6 p-lg-10">
                          <div className="d-flex justify-content-between mb-6">
                            {/* heading */}
                            <h2 className="mb-0">Address</h2>
                            {/* button */}
                            <Link
                              to="#"
                              className="btn btn-outline-primary"
                              data-bs-toggle="modal"
                              data-bs-target="#addAddressModal"
                            >
                              Add a new address{" "}
                            </Link>
                          </div>
                          <div className="row">
                            {address.map((address, index) => (
                              <div
                                key={index}
                                className="col-lg-5 col-xxl-4 col-12 mb-4"
                              >
                                {/* form */}
                                <div className="border p-6 rounded-3">
                                  {/* address */}
                                  <p className="mb-6">
                                    {address.name}
                                    <br />
                                    {address.street}, {address.city},<br />
                                    {address.state}, {address.zip}
                                  </p>
                                  {/* Default Address Button */}
                                  {address.isdefault ? (
                                    <Link
                                      to="#"
                                      className="btn btn-info btn-sm"
                                    >
                                      Default address
                                    </Link>
                                  ) : (
                                    <Link to="#" className="btn  btn-sm">
                                      Make it Default
                                    </Link>
                                  )}
                                  <div className="mt-4">
                                    {/* Edit Button */}
                                    <button
                                      data-bs-toggle="modal"
                                      data-bs-target="#addAddressModal"
                                      className="text-inherit border-0 bg-transparent"
                                      onClick={() =>
                                        handleEditAddress(address._id)
                                      }
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="text-danger ms-3 border-0 bg-transparent"
                                      data-bs-toggle="modal"
                                      data-bs-target="#deleteModal"
                                      onClick={() => handleDeleteClick(address)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Modal */}
          <div
            className="modal fade"
            id="deleteModal"
            tabIndex={-1}
            aria-labelledby="deleteModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              {/*delte  modal content */}
              <div className="modal-content">
                {/* modal header */}
                <div className="modal-header">
                  <h5 className="modal-title" id="deleteModalLabel">
                    Delete address
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  />
                </div>
                {/* modal body */}
                <div className="modal-body">
                  {selectedAddress ? (
                    <>
                      <h6>Are you sure you want to delete this address?</h6>
                      <p className="mb-6">
                        {selectedAddress.name}
                        <br />
                        {selectedAddress.street}, {selectedAddress.city},<br />
                        {selectedAddress.state}, {selectedAddress.zip}
                      </p>
                    </>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                {/* modal footer */}
                <div className="modal-footer">
                  {/* btn */}
                  <button
                    type="button"
                    className="btn btn-outline-gray-400"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    data-bs-dismiss="modal"
                    onClick={() => {
                      handleDeleteAddress(selectedAddress._id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Modal */}
          <div
            className="modal fade"
            id="addAddressModal"
            tabIndex={-1}
            aria-labelledby="addAddressModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              {/* modal content */}
              <div className="modal-content">
                {/* modal body */}
                <div className="modal-body p-6">
                  <div className="d-flex justify-content-between mb-5">
                    <div>
                      {/* heading */}
                      <h5 className="h6 mb-1" id="addAddressModalLabel">
                        {editmode ? "UpdateAddress" : "New Shipping Address"}
                      </h5>
                      <p className="small mb-0">
                        {editmode
                          ? "Update Existing Shipping Address"
                          : " Add new shipping address for your order delivery."}
                      </p>
                    </div>
                    <div>
                      {/* button */}
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                  </div>
                  {/* row */}
                  <div className="row g-3">
                    {/* col */}
                    <div className="col-12">
                      {/* input */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="First name"
                        aria-label="First name"
                        name="firstname"
                        value={formdata.firstname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {/* col */}
                    <div className="col-12">
                      {/* input */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Last name"
                        aria-label="Last name"
                        name="lastname"
                        value={formdata.lastname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {/* col */}
                    <div className="col-12">
                      {/* input */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Address Line 1"
                        name="address1"
                        value={formdata.address1}
                        onChange={handleInputChange}
                      />
                    </div>
                    {/* col */}
                    <div className="col-12">
                      {/* input */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Address Line 2"
                        name="address2"
                        value={formdata.address2}
                        onChange={handleInputChange}
                      />
                    </div>
                    {/* col */}
                    <div className="col-12">
                      {/* input */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="City"
                        name="city"
                        value={formdata.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    {/* col */}
                    <div className="col-12">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="State"
                        name="state"
                        value={formdata.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    {/* col */}
                    <div className="col-12">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Country"
                        name="country"
                        value={formdata.country}
                        onChange={handleInputChange}
                      />
                    </div>
                    {/* col */}
                    <div className="col-12">
                      {/* input */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Zip Code"
                        name="zip"
                        value={formdata.zip}
                        onChange={handleInputChange}
                      />
                    </div>
                    {/* col */}
                    <div className="col-12">
                      {/* form check */}
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="flexCheckDefault"
                          name="isdefault"
                          value={formdata.isdefault}
                          onChange={(e) =>
                            setFormdata({
                              ...formdata,
                              isdefault: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="flexCheckDefault"
                        >
                          Set as Default
                        </label>
                      </div>
                    </div>
                    {/* col */}
                    <div className="col-12 text-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                      {editmode ? (
                        <button
                          className="btn btn-primary"
                          type="button"
                          data-bs-dismiss="modal"
                          onClick={handleUpdateAddress}
                        >
                          Edit Address
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          type="button"
                          data-bs-dismiss="modal"
                          onClick={handleAddAddress}
                        >
                          Save Address
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* modal */}
          <div
            className="offcanvas offcanvas-start"
            tabIndex={-1}
            id="offcanvasAccount"
            aria-labelledby="offcanvasAccountLabel"
          >
            {/* offcanvas header */}
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasAccountLabel">
                My Account
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
            </div>
            {/* offcanvas body */}
            <div className="offcanvas-body">
              <ul className="nav flex-column nav-pills nav-pills-dark">
                {/* nav item */}
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    aria-current="page"
                    href="/MyAccountOrder"
                  >
                    <i className="fas fa-shopping-bag me-2" />
                    Your Orders
                  </a>
                </li>
                {/* nav item */}
                <li className="nav-item">
                  <a className="nav-link " href="/MyAccountSetting">
                    <i className="fas fa-cog me-2" />
                    Settings
                  </a>
                </li>
                {/* nav item */}
                <li className="nav-item">
                  <a className="nav-link" href="/MyAccountAddress">
                    <i className="fas fa-map-marker-alt me-2" />
                    Address
                  </a>
                </li>
                {/* nav item */}
                <li className="nav-item">
                  <a className="nav-link" href="/MyAccountPaymentMethod">
                    <i className="fas fa-credit-card me-2" />
                    Payment Method
                  </a>
                </li>
                {/* nav item */}
                <li className="nav-item">
                  <a className="nav-link" href="/MyAccountNotification">
                    <i className="fas fa-bell me-2" />
                    Notification
                  </a>
                </li>
              </ul>
              <hr className="my-6" />
              <div>
                {/* nav  */}
                <ul className="nav flex-column nav-pills nav-pills-dark">
                  {/* nav item */}
                  <li className="nav-item">
                    <a className="nav-link " href="/Grocery-react/">
                      <i className="fas fa-sign-out-alt me-2" />
                      Log out
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default MyAccountAddress;
