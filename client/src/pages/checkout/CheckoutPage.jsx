import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import "./CheckoutPage.css";
// import Heading from "../../components/header/Heading";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id ?? null;
  } catch (e) {
    console.error("Error parsing token:", e);
    return null;
  }
};

const loadCartFromStorage = (uid) => {
  try {
    const key = uid ? `cart_${uid}` : "cart";
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const CheckoutPage = () => {
 
  const [userId] = useState(() => getUserIdFromToken());

  const [cartItems, setCartItems] = useState(() => loadCartFromStorage(userId));
  const [shippingAddress, setShippingAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, []);

  // const getCartKey = () => {
  //   return userId ? `cart_${userId}` : "cart";
  // };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8081/api/user/shipping-addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data && data.EC === 0) {
        setAddresses(data.DT);
        // Set default address
        const defaultAddr = data.DT.find(addr => addr.isDefault === true);
        if (defaultAddr) {
          setShippingAddress(defaultAddr);
        } else if (data.DT.length > 0) {
          setShippingAddress(data.DT[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleChangeAddress = (address) => {
    setShippingAddress(address);
    setShowAddressModal(false);
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      setError("Please select a shipping address");
      return;
    }

    if (cartItems.length === 0) {
      setError("Cart is empty");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Create order
      const orderResponse = await fetch("http://localhost:8081/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddressId: shippingAddress.id,
          cartItems: cartItems,
          totalPrice: calculateTotal(),
        }),
      });

      const orderData = await orderResponse.json();

      if (orderData && orderData.EC === 0) {
        // Clear cart with user-specific key
        localStorage.removeItem(userId ? `cart_${userId}` : "cart");
        alert("Order placed successfully!");
        // Redirect to orders page
        window.location.href = "/user/processing-orders";
      } else {
        setError(orderData?.EM || "Failed to create order");
      }
    } catch (err) {
      setError("Error placing order: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="checkout-page">
      {/* <Heading /> */}
      
      <main className="checkout-container">
        <h1 className="page-title">Order confirmation</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="checkout-content">
          {/* CỘT TRÁI: ĐỊA CHỈ & SẢN PHẨM */}
          <div className="checkout-main">
            
            {/* 1. Phần địa chỉ nhận hàng */}
            <section className="address-card">
              <div className="address-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="marker-icon" />
                <h3>Shipping address</h3>
              </div>
              {shippingAddress ? (
                <div className="address-details">
                  <div className="user-info">
                    <strong>{shippingAddress.fullName}</strong>
                    <p>({shippingAddress.phoneNumber})</p>
                    <p>{shippingAddress.address}</p>
                  </div>
                  <button 
                    className="edit-addr-btn"
                    onClick={() => setShowAddressModal(true)}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                </div>
              ) : (
                <div className="address-details">
                  <p>No address found. Please add a shipping address first.</p>
                </div>
              )}
            </section>

            {/* 2. Danh sách sản phẩm rút gọn */}
            <section className="order-items-card">
              <div className="items-header">
                <span className="col-prod">Product ({cartItems.length})</span>
                <span className="col-price">Unit Price</span>
                <span className="col-qty">Quantity</span>
                <span className="col-total">Total</span>
              </div>
              
              <div className="items-body">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div key={item.id} className="item-row">
                      <div className="prod-info">
                        {item.image && (
                          <img 
                            src={`http://localhost:8081/images/${item.image}`} 
                            alt={item.name}
                            onError={(e) => e.target.src = "https://via.placeholder.com/50"}
                          />
                        )}
                        <span>{item.name}</span>
                      </div>
                      <div className="unit-p">{item.price.toLocaleString()}đ</div>
                      <div className="qty">x{item.quantity}</div>
                      <div className="total-p">{(item.price * item.quantity).toLocaleString()}đ</div>
                    </div>
                  ))
                ) : (
                  <div className="empty-cart">Cart is empty</div>
                )}
              </div>
            </section>
          </div>

          {/* CỘT PHẢI: TỔNG TIỀN */}
          <aside className="checkout-sidebar">
            <div className="summary-box">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{total.toLocaleString()} VND</span>
              </div>
              <div className="summary-line">
                <span>Shipping fee</span>
                <span>Free</span>
              </div>
              <div className="divider"></div>
              <div className="summary-line total-final">
                <span>Total</span>
                <span className="red-price">{total.toLocaleString()} VND</span>
              </div>
              <button 
                className="confirm-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Select Shipping Address</h2>
            <div className="address-list">
              {addresses.map((addr) => (
                <div 
                  key={addr.id} 
                  className={`address-option ${shippingAddress?.id === addr.id ? "selected" : ""}`}
                  onClick={() => handleChangeAddress(addr)}
                >
                  <div className="address-option-info">
                    <strong>{addr.fullName}</strong>
                    <p>{addr.phoneNumber}</p>
                    <p>{addr.address}</p>
                    {addr.isDefault && <span className="default-badge">Default</span>}
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="modal-close-btn"
              onClick={() => setShowAddressModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;