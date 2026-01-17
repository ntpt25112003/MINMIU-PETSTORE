import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./ReviewModal.css";

const ReviewModal = ({ open, onClose, product, orderId, onSubmitSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError("Please write a review");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8081/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.productId,
          orderId: orderId,
          rating: rating,
          comment: comment,
        }),
      });

      const data = await response.json();

      if (data && data.EC === 0) {
        alert("Review submitted successfully!");
        setRating(5);
        setComment("");
        onSubmitSuccess?.();
        onClose?.();
      } else {
        setError(data?.EM || "Failed to submit review");
      }
    } catch (err) {
      setError("Error submitting review: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !product) return null;

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="review-modal-header">
          <h2>Write a Review</h2>
          <div className="review-product-info">
            {product.image && (
              <img
                src={`http://localhost:8081/images/${product.image}`}
                alt={product.productName}
                className="review-product-image"
              />
            )}
            <div>
                {/* <pre style={{fontSize: 12, background: "#f5f5f5", padding: 8}}>
                    {JSON.stringify(product, null, 2)}
                    </pre> */}
              <h4>{product.productName}</h4>
              <p>{product.price?.toLocaleString()}đ</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          {/* Rating */}
          <div className="review-rating-section">
            <label>Rating</label>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`review-star ${rating >= star ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  <FontAwesomeIcon icon={faStar} />
                </button>
              ))}
            </div>
            <p className="review-rating-text">{rating} out of 5 stars</p>
          </div>

          {/* comment */}
          <div className="review-comment-section">
            <label htmlFor="review-comment">Your Review</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows="5"
              className="review-textarea"
            />
          </div>

          {error && <div className="review-error">{error}</div>}

          <div className="review-actions">
            <button type="button" className="review-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="review-btn-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
