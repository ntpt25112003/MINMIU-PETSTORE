import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import "./ShoppingCart.css";
import productPlaceholder from "../../images/product.png";
import { getImageSrc } from "../../utils/imageUrl";

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

const ShoppingCart = () => {
  const navigate = useNavigate();

  // ✅ Không cần useEffect + setUserId nữa
  const [userId] = useState(() => getUserIdFromToken());

  const [cartItems, setCartItems] = useState(() => loadCartFromStorage(userId));
  const [selectedItems, setSelectedItems] = useState(new Set());

  const getCartKey = () => (userId ? `cart_${userId}` : "cart");

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem(getCartKey(), JSON.stringify(items));
  };

  const updateQuantity = (id, delta) => {
    const newCart = cartItems.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: Math.max(1, parseInt(item.quantity || 0, 10) + delta),
          }
        : item
    );
    saveCart(newCart);
  };

  const removeItem = (id) => {
    const ok = window.confirm("Remove this item from cart?");
    if (ok) {
      const newCart = cartItems.filter((item) => item.id !== id);
      setSelectedItems((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
      saveCart(newCart);
    }
  };

  const toggleItemSelection = (id) => {
    setSelectedItems((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(cartItems.map((i) => i.id)));
  };

  const calculateTotal = (items = cartItems) =>
    items.reduce((total, item) => total + item.price * item.quantity, 0);

  const getSelectedTotal = () =>
    calculateTotal(cartItems.filter((i) => selectedItems.has(i.id)));

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      alert("Please select at least one product to checkout");
      return;
    }

    const selectedCartItems = cartItems.filter((i) => selectedItems.has(i.id));

    // NOTE: đoạn này bạn đang overwrite cart thành chỉ items được chọn.
    // Nếu đúng ý bạn thì giữ nguyên.
    localStorage.setItem(getCartKey(), JSON.stringify(selectedCartItems));

    navigate("/checkout");
  };

  const deleteAllSelected = () => {
    if (selectedItems.size === 0) {
      alert("Please select at least one product to delete");
      return;
    }

    const ok = window.confirm(`Delete ${selectedItems.size} selected item(s)?`);
    if (ok) {
      const newCart = cartItems.filter((i) => !selectedItems.has(i.id));
      setSelectedItems(new Set());
      saveCart(newCart);
    }
  };

  const getImageUrl = (imageName) =>
    imageName ? getImageSrc(imageName) : productPlaceholder;

  return (
    <div>
      <div className="shopping-cart-page">
        <main className="cart-container">
          <h1 className="cart-title">Shopping cart</h1>

          <div className="cart-content">
            <div className="cart-items-list">
              <div className="cart-header-row">
                <input
                  type="checkbox"
                  className="cart-checkbox"
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                  onChange={toggleSelectAll}
                />
                <span className="col-product">Product ({cartItems.length})</span>
                <span className="col-price">Unit Price</span>
                <span className="col-quantity">Quantity</span>
                <span className="col-total">Total</span>
                <button
                  className="delete-all-btn"
                  onClick={deleteAllSelected}
                  title="Delete selected items"
                  disabled={selectedItems.size === 0}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <input
                    type="checkbox"
                    className="cart-checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                  />

                  <div className="product-info">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="product-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = productPlaceholder;
                      }}
                    />
                    <span className="product-name">{item.name}</span>
                  </div>

                  <div className="unit-price">{Number(item.price).toLocaleString()}đ</div>

                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <input type="text" value={item.quantity} readOnly />
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>

                  <div className="total-price">{(item.price * item.quantity).toLocaleString()}đ</div>

                  <button className="delete-btn" onClick={() => removeItem(item.id)}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <div className="summary-box">
                <div className="summary-row">
                  <span>Total</span>
                  <span>{getSelectedTotal().toLocaleString()} VND</span>
                </div>
                <div className="summary-row">
                  <span>Shipping fee</span>
                  <span>Free</span>
                </div>
                <hr />
                <div className="summary-row total-final">
                  <span>Total</span>
                  <span className="final-price">{getSelectedTotal().toLocaleString()} VND</span>
                </div>
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={selectedItems.size === 0}
                >
                  Process to checkout
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShoppingCart;
