import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import "./AllOrder.css";
import { getImageSrc } from "../../utils/imageUrl";

export default function AllOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // ✅ dùng object: { [orderId]: true/false }
  const [expandedOrders, setExpandedOrders] = useState({});

  const API_BASE = "http://localhost:8081/api";
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      if (!token) {
        setError("No token found. Please login as Manager first.");
        setOrders([]);
        return;
      }

      const response = await fetch(`${API_BASE}/order`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const msg =
          response.status === 401
            ? "Unauthorized (401). Token invalid/expired. Please login again."
            : response.status === 403
            ? "Forbidden (403). This page is for Manager only."
            : `Request failed (${response.status}).`;
        setError(msg);
        setOrders([]);
        return;
      }

      const data = await response.json();

      if (data && data.EC === 0) {
        setOrders(data.DT || []);
      } else {
        setError(data?.EM || "Failed to fetch orders");
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setError("Connection error. Please check backend server.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (order) => {
    setEditingOrder(order);
    setNewStatus(order.status || "Pending");
  };

  const handleStatusChange = async () => {
    if (!editingOrder || !newStatus) return;

    try {
      setUpdating(true);

      const token = getToken();
      if (!token) {
        alert("No token found. Please login as Manager first.");
        return;
      }

      const response = await fetch(`${API_BASE}/order/${editingOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const msg =
          response.status === 401
            ? "Unauthorized (401). Please login again."
            : response.status === 403
            ? "Forbidden (403). Manager only."
            : `Update failed (${response.status}).`;
        alert(msg);
        return;
      }

      const data = await response.json();

      if (data && data.EC === 0) {
        setOrders((prev) =>
          prev.map((o) => (o.id === editingOrder.id ? { ...o, status: newStatus } : o))
        );
        setEditingOrder(null);
        setNewStatus("");
      } else {
        alert(data?.EM || "Failed to update order status");
      }
    } catch (err) {
      alert("Error updating order: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getFilteredOrders = () => {
    if (filterStatus === "all") return orders;
    return orders.filter((o) => o.status?.toLowerCase() === filterStatus.toLowerCase());
  };

  const getStatusClass = (status) => {
    if (!status) return "ao-status-pending";
    const s = status.toLowerCase();
    if (s === "delivered") return "ao-status-delivered";
    if (s === "canceled") return "ao-status-canceled";
    if (s === "processing") return "ao-status-processing";
    return "ao-status-pending";
  };

  const buildImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/50?text=No+Image";
    if (img.startsWith("http")) return img;
    // nếu backend serve static: /public/images => /images
    return getImageSrc(img);
  };

  const filteredOrders = getFilteredOrders();

  if (loading)
    return (
      <div className="ao-container ao-loading">
        <p>Loading orders...</p>
      </div>
    );

  const filters = [
    { name: "All Orders", value: "all", className: "filter-all" },
    { name: "Pending", value: "pending", className: "filter-pending" },
    { name: "Processing", value: "processing", className: "filter-processing" },
    { name: "Canceled", value: "canceled", className: "filter-canceled" },
    { name: "Delivered", value: "delivered", className: "filter-delivered" },
  ];

  return (
    <div className="ao-container">
      <div className="ao-header">
        <h2>All Orders</h2>
      </div>

      <div className="ao-filters">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`ao-filter-btn ${filter.className} ${filterStatus === filter.value ? "active" : ""}`}
            onClick={() => setFilterStatus(filter.value)}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {error && <div className="ao-error">{error}</div>}

      <div className="ao-table-responsive">
        <table className="ao-table">
          <thead>
            <tr>
              <th className="ao-text-center">No.</th>
              <th>Products</th>
              <th className="ao-text-center">Total Items</th>
              <th className="ao-text-center">Customer</th>
              <th className="ao-text-center">Date</th>
              <th className="ao-text-center">Total</th>
              <th className="ao-text-center">Status</th>
              <th className="ao-text-center">Update</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => {
                const items = order.orderItems || [];
                const firstItem = items[0];
                const moreCount = items.length > 1 ? items.length - 1 : 0;

                const totalQty = items.reduce((sum, it) => sum + (it.quantity || 0), 0);

                const formattedDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-GB")
                  : "N/A";

                const isExpanded = !!expandedOrders[order.id];

                return (
                  <React.Fragment key={order.id || index}>
                    {/* Main row (1 row per order) */}
                    <tr>
                      <td className="ao-text-center">{index + 1}</td>

                      <td>
                        <div className="ao-product-cell" style={{ alignItems: "center", gap: 12 }}>
                          <img
                            src={buildImageUrl(firstItem?.image)}
                            alt={firstItem?.productName || "Product"}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/50?text=Error";
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span className="ao-product-name">{firstItem?.productName || "N/A"}</span>

                            {moreCount > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(order.id)}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  padding: 0,
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  width: "fit-content",
                                  fontSize: 13,
                                }}
                              >
                                {isExpanded ? "Hide products" : `View more`}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total quantity of the whole order */}
                      <td className="ao-text-center">{totalQty}</td>

                      <td className="ao-text-center">{order.user?.userName || "N/A"}</td>
                      <td className="ao-text-center">{formattedDate}</td>

                      <td className="ao-total-price ao-text-center">
                        {order.totalPrice ? Number(order.totalPrice).toLocaleString("vi-VN") : "0"}đ
                      </td>

                      <td className="ao-text-center">
                        <span className={`ao-status-badge ${getStatusClass(order.status)}`}>
                          {order.status || "Pending"}
                        </span>
                      </td>

                      <td className="ao-action ao-text-center">
                        <button className="ao-update-btn" onClick={() => handleUpdate(order)} title="Edit Order">
                          <FontAwesomeIcon icon={faPencil} />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded products (details row) */}
                    {isExpanded && items.length > 1 && (
                      <tr>
                        <td colSpan="8" style={{ background: "#f8fbff" }}>
                          <div >
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {items.map((it, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "8px 10px",
                                    borderRadius: 8,
                                    background: "white",
                                  }}
                                >
                                  <img
                                    src={buildImageUrl(it.image)}
                                    alt={it.productName || "Product"}
                                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://via.placeholder.com/40?text=Error";
                                    }}
                                  />

                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{it.productName || "N/A"}</div>
                                    <div style={{ fontSize: 13, opacity: 0.8 }}>
                                      Quantity: <b>{it.quantity || 0}</b>{" "}
                                      {it.price ? (
                                        <>
                                          • Price: <b>{Number(it.price).toLocaleString("vi-VN")}đ</b>
                                        </>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="ao-no-data">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Status Modal */}
      {editingOrder && (
        <div className="ao-modal-overlay" onClick={() => setEditingOrder(null)}>
          <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Update Order Status</h3>
            <p className="ao-modal-info">Order ID: {editingOrder.id}</p>
            <p className="ao-modal-info">Customer: {editingOrder.user?.userName || "N/A"}</p>

            <div className="ao-modal-body">
              <label>New Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="ao-status-select"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>

            <div className="ao-modal-actions">
              <button className="ao-btn-cancel" onClick={() => setEditingOrder(null)}>
                Cancel
              </button>
              <button className="ao-btn-confirm" onClick={handleStatusChange} disabled={updating}>
                {updating ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
