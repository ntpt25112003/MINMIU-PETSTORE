import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ShippingAddress.css";
import AddAddressModal from "../modal/AddAddressModal";

const API_URL = "http://localhost:8081/api";

export default function ShippingAddress() {
  const [addresses, setAddresses] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
const [defaultAddressId, setDefaultAddressId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/user/shipping-addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.EC === 0) {
        setAddresses(response.data.DT || []);
        const defaultAddr = response.data.DT?.find((addr) => addr.isDefault);
        if (defaultAddr) setDefaultAddressId(defaultAddr.id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setOpenModal(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setOpenModal(true);
  };

 const handleSaveAddress = async (savedAddress) => {
    if (savedAddress) {
      if (editingAddress) {
        // edit: replace
        setAddresses((prev) =>
          prev.map((a) => (a.id === savedAddress.id ? savedAddress : a))
        );
      } else {
        // add: push lên đầu
        setAddresses((prev) => [savedAddress, ...prev]);
      }

      if (savedAddress.isDefault) setDefaultAddressId(savedAddress.id);
    } else {
      // fallback
      await fetchAddresses();
    }

    setOpenModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await axios.delete(`${API_URL}/user/shipping-address/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.EC === 0) {
        alert("Address deleted successfully!");
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/user/set-default-address/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.EC === 0) {
        setDefaultAddressId(id);
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      alert("Failed to set default address");
    }
  };

  return (
    <div className="AddressPageContainer">
        <AddAddressModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSave={handleSaveAddress}
          mode={editingAddress ? "edit" : "add"}
          address={editingAddress}
        />

          <div className="sectionHeader">
            <h2>Shipping Address</h2>
            <button className="addNewBtn" onClick={handleAddNew}>
              Add new address
            </button>
          </div>

          <div className="addressList">
            {addresses && addresses.length > 0 ? (
              addresses.map((address) => (
                <div key={address.id} className="addressCard">
                  <div className="addressInfo">
                    <h3>{address.fullName}</h3>
                    <p className="phone">({address.phoneNumber})</p>
                    {address.isDefault && (
                      <span className="defaultBadge">default</span>
                    )}
                    <p className="address">{address.address}</p>
                  </div>
                  <div className="addressActions">
                    <button
                      className="editBtn"
                      onClick={() => handleEdit(address)}
                    >
                      edit
                    </button>
                    <button
                      className="deleteBtn"
                      onClick={() => handleDelete(address.id)}
                    >
                      delete
                    </button>
                  </div>
                  {!address.isDefault && (
                    <button
                      className="setDefaultBtn"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set as default
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="noAddresses">No addresses found. Add one now!</p>
            )}
          </div>
    </div>
  );
}