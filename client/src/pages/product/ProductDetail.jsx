import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StoreHeader from "../../components/storeHeader/StoreHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faTruck,
  faRotateLeft,
  faCartPlus,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "./ProductDetail.css";
import shopCat from "../../images/product.png";
import { getImageSrc } from "../../utils/imageUrl";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(2);
  const [productData, setProductData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState("All");
  const [averageRating, setAverageRating] = useState(0);

  // ref cho carousel
  const relatedRef = useRef(null);

  const scrollRelated = (direction) => {
    const container = relatedRef.current;
    if (!container) return;

    const card = container.querySelector(".product-card");
    if (!card) return;

    const gap = 20;
    const scrollAmount = card.offsetWidth + gap;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.id);
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }

    const cartKey = userId ? `cart_${userId}` : "cart";
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  }, [userId]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        const resProduct = await axios.get(
          `http://localhost:8081/api/product/${id}`
        );

        if (resProduct.data.EC === 0) {
          const currentProduct = resProduct.data.DT;
          setProductData(currentProduct);

          const resAll = await axios.get("http://localhost:8081/api/products");
          if (resAll.data.EC === 0) {
            const allProducts = resAll.data.DT;
            const related = allProducts.filter(
              (p) =>
                p.categoryId === currentProduct.categoryId &&
                p.id !== currentProduct.id
            );
            setRelatedProducts(related.slice(0, 12));
          }

          const resReviews = await axios.get(
            `http://localhost:8081/api/product/${id}/reviews`
          );

          if (resReviews.data.EC === 0) {
            const reviewsData = resReviews.data.DT || [];
            setReviews(reviewsData);
            setFilteredReviews(reviewsData);

            if (reviewsData.length > 0) {
              const avg =
                reviewsData.reduce((sum, r) => sum + r.rating, 0) /
                reviewsData.length;
              setAverageRating(parseFloat(avg.toFixed(1)));
            } else {
              setAverageRating(0);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (loading)
    return <div style={{ padding: "50px", textAlign: "center" }}>Loading...</div>;
  if (!productData)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Product not found
      </div>
    );

  const handleAddToCart = async (product, qty = 1) => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("showLoginModal", "true");
      navigate("/");
      return;
    }

    const cartKey = userId ? `cart_${userId}` : "cart";
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) existingItem.quantity += qty;
    else cart.push({ ...product, quantity: qty });

    localStorage.setItem(cartKey, JSON.stringify(cart));
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    alert("Added to cart successfully!");
  };

  const imageUrl = productData.image
    ? getImageSrc(productData.image)
    : shopCat;

  const handleRatingFilter = (rating) => {
    setSelectedRating(rating);

    if (rating === "All") {
      setFilteredReviews(reviews);
    } else {
      const filtered = reviews.filter((r) => r.rating === parseInt(rating, 10));
      setFilteredReviews(filtered);
    }
  };

  const renderStars = (rating) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "star filled" : "star"}>
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="product-detail-page">
      <StoreHeader cartCount={cartCount} />

      <main className="container">
        {/* SECTION 1 */}
        <section className="product-main">
          <div className="product-image-large">
            <img
              src={imageUrl}
              alt={productData.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = shopCat;
              }}
            />
          </div>

          <div className="product-content">
            <h1 className="product-title">{productData.name}</h1>
            <p className="stock-status">
              {productData.status === "Active" ? "In Stock" : "Out of Stock"}
            </p>
            <h2 className="product-price-large">
              {Number(productData.price).toLocaleString("vi-VN")}đ
            </h2>

            <p className="product-description">
              {productData.description || "No description available for this product."}
            </p>

            <div className="action-area">
              <div className="quantity-selector">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  className="plus-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>

              <button
                className="add-to-cart-outline"
                onClick={() => handleAddToCart(productData, quantity)}
              >
                <FontAwesomeIcon icon={faCartPlus} /> Add to cart
              </button>

              <button className="buy-now-btn">Buy Now</button>
            </div>

            <div className="delivery-info">
              <div className="info-item">
                <FontAwesomeIcon icon={faTruck} className="info-icon" />
                <div>
                  <strong>Free Delivery</strong>
                  <p>Enter your postal code for Delivery Availability</p>
                </div>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={faRotateLeft} className="info-icon" />
                <div>
                  <strong>Return Delivery</strong>
                  <p>
                    Free 30 Days Delivery Returns. <span>Details</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: REVIEWS */}
        <section className="reviews-section">
          <div className="reviews-header">
            <div className="rating-summary">
              <div className="average-rating">
                <span className="rating-number">
                  {reviews.length > 0 ? averageRating : "0.0"}
                </span>
                <span className="rating-label">/5</span>
              </div>

              {renderStars(Math.round(averageRating || 0))}

              <p className="total-reviews">{reviews.length} reviews</p>
            </div>
          </div>

          <div className="rating-filters">
            {["All", "5", "4", "3", "2", "1"].map((rating) => (
              <button
                key={rating}
                className={`filter-btn ${selectedRating === rating ? "active" : ""}`}
                onClick={() => handleRatingFilter(rating)}
                disabled={reviews.length === 0}
              >
                {rating === "All" ? "All" : `${rating}★`}
              </button>
            ))}
          </div>

          <div className="reviews-list">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <div className="review-item" key={review.id}>
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.user?.userName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="reviewer-details">
                        <h4 className="reviewer-name">
                          {review.user?.userName || "Anonymous"}
                        </h4>
                        <p className="review-date">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {renderStars(review.rating)}
                  <p className="review-content">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="no-review">This product has no reviews yet.</div>
            )}
          </div>
        </section>

        {/* SECTION 3: OTHER PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="other-products-section">
            <div className="section-header">
              <div className="yellow-square"></div>
              <h2>Other products</h2>
            </div>

            <div className="carousel-wrapper">
              <button
                className="nav-btn left"
                onClick={() => scrollRelated("left")}
                type="button"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              <div className="product-grid" ref={relatedRef}>
                {relatedProducts.map((item) => (
                  <div
                    className="product-card"
                    key={item.id}
                    onClick={() => navigate(`/product/${item.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={
                        item.image
                          ? getImageSrc(item.image)
                          : shopCat
                      }
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = shopCat;
                      }}
                    />
                    <h3>{item.name}</h3>
                    <p className="price">
                      {Number(item.price).toLocaleString("vi-VN")} đ
                    </p>
                    <button
                      className="card-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item, 1);
                      }}
                      type="button"
                    >
                      <FontAwesomeIcon icon={faCartPlus} /> Add to cart
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="nav-btn right"
                onClick={() => scrollRelated("right")}
                type="button"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;
