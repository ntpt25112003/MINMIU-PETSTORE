import React, { useState, useEffect } from "react";
import "./ProcessOrder.css";

export default function ProcessOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8081/api/user/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data && data.EC === 0) {
        // Filter orders with Pending or Ongoing status
        const processingOrders = data.DT.filter(
          (order) => order.status === "Pending" || order.status === "Processing"
        );
        setOrders(processingOrders);
      } else {
        setError(data?.EM || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Connection error!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const processingOrders = orders.filter((order) => order.status === "Processing");

  const displayOrders = activeTab === "pending" ? pendingOrders : processingOrders;

  if (loading) return <div className="po-loading">Loading...</div>;

  return (
    <div className="po-container">
      <h2 className="po-title">Processing Orders</h2>

      <div className="po-tabs">
        <button
          className={`po-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Order
        </button>
        <button
          className={`po-tab ${activeTab === "processing" ? "active" : ""}`}
          onClick={() => setActiveTab("processing")}
        >
          Processing Order
        </button>
      </div>

      {error && <div className="po-error">{error}</div>}

      <div className="po-content">
        {displayOrders.length === 0 ? (
          <div className="po-empty">
            No {activeTab === "pending" ? "pending" : "processing"} orders
          </div>
        ) : (
          displayOrders.map((order) => (
            <div key={order.id} className="po-order-card">
              <div className="po-order-header">
                <span
                  className={`po-status-badge ${
                    order.status === "Pending" ? "pending" : "processing"
                  }`}>{order.status}</span>
                <span className="po-order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="po-order-items">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="po-item">
                    {item.image && (
                      <img
                        src={`http://localhost:8081/images/${item.image}`}
                        alt={item.productName}
                        className="po-item-image"
                      />
                    )}
                    <div className="po-item-info">
                      <h4>{item.productName}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p className="po-item-price">{item.price}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="po-order-footer">
                <span className="po-total">
                  Total: <strong>{order.totalPrice} VND</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
