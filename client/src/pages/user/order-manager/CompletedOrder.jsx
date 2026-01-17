import React, { useState, useEffect } from "react";
import ReviewModal from "../../../components/review/ReviewModal";
import "./CompletedOrder.css";

export default function CompletedOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("delivered");

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // map productId -> true/false
  const [reviewedMap, setReviewedMap] = useState({});

  useEffect(() => {
    fetchUserOrders();
  }, []);

  /* ================= FETCH ORDERS ================= */
  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8081/api/user/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.EC === 0) {
        const completed = data.DT.filter(
          (o) => o.status === "Delivered" || o.status === "Canceled"
        );
        setOrders(completed);
        await fetchReviewedMap(completed);
      } else {
        setError(data.EM || "Failed to fetch orders");
      }
    } catch (e) {
      console.error(e);
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHECK REVIEWED ================= */
  const fetchReviewedMap = async (completedOrders) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const productIds = Array.from(
        new Set(
          completedOrders
            .filter((o) => o.status === "Delivered")
            .flatMap((o) => o.orderItems.map((it) => it.productId))
        )
      );

      if (productIds.length === 0) return;

      const results = await Promise.all(
        productIds.map(async (pid) => {
          const res = await fetch(
            `http://localhost:8081/api/review/check?productId=${pid}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          return { pid, reviewed: !!data?.DT?.reviewed };
        })
      );

      const map = {};
      results.forEach((r) => (map[r.pid] = r.reviewed));
      setReviewedMap(map);
    } catch (e) {
      console.error("fetchReviewedMap error:", e);
    }
  };

  /* ================= HANDLERS ================= */
  const handleReviewClick = (product, orderId) => {
    setSelectedProduct(product);
    setSelectedOrderId(orderId);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    fetchUserOrders(); // refresh sau khi review
  };

  if (loading) return <div className="co-loading">Loading...</div>;

  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const canceledOrders = orders.filter((o) => o.status === "Canceled");
  const displayOrders =
    activeTab === "delivered" ? deliveredOrders : canceledOrders;

  return (
    <div className="co-container">
      <h2 className="co-title">Completed Orders</h2>

      <div className="co-tabs">
        <button
          className={`co-tab ${activeTab === "delivered" ? "active" : ""}`}
          onClick={() => setActiveTab("delivered")}
        >
          Delivered Order
        </button>
        <button
          className={`co-tab ${activeTab === "canceled" ? "active" : ""}`}
          onClick={() => setActiveTab("canceled")}
        >
          Canceled Order
        </button>
      </div>

      {error && <div className="co-error">{error}</div>}

      <div className="co-content">
        {displayOrders.length === 0 ? (
          <div className="co-empty">No orders</div>
        ) : (
          displayOrders.map((order) => (
            <div key={order.id} className="co-order-card">
              <div className="co-order-header">
                <span className={`co-status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
                <span className="co-order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="co-order-items">
                {order.orderItems.map((item, idx) => {
                  const reviewed = !!reviewedMap[item.productId];

                  return (
                    <div key={idx} className="co-item">
                      <img
                        src={`http://localhost:8081/images/${item.image}`}
                        alt={item.productName}
                        className="co-item-image"
                      />

                      <div className="co-item-info">
                        <h4>{item.productName}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p className="co-item-price">{item.price}đ</p>
                      </div>

                      {activeTab === "delivered" && (
                        <button
                          className={`co-review-btn ${
                            reviewed ? "reviewed" : ""
                          }`}
                          disabled={reviewed}
                          onClick={() =>
                            !reviewed &&
                            handleReviewClick(item, order.id)
                          }
                        >
                          {reviewed ? "Reviewed" : "Review Product"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="co-order-footer">
                Total: <strong>{order.totalPrice} VND</strong>
              </div>
            </div>
          ))
        )}
      </div>

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={selectedProduct}
        orderId={selectedOrderId}
        onSubmitSuccess={handleReviewSuccess}
      />
    </div>
  );
}
