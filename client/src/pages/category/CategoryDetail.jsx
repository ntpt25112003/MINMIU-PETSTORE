import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StoreHeader from "../../components/storeHeader/StoreHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import "./CategoryDetail.css";
import product from "../../images/product.png";
import { getImageSrc } from "../../utils/imageUrl";

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Get userId from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
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
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        const [resCat, resProds] = await Promise.all([
          axios.get(`http://localhost:8081/api/category`),
          axios.get(`http://localhost:8081/api/products`)
        ]);

        if (resCat.data.EC === 0 && resProds.data.EC === 0) {
          // Find category name
          const category = resCat.data.DT.find(cat => cat.id === parseInt(categoryId));
          if (category) {
            setCategoryName(category.name);
          }

          // Filter products by category
          const categoryProducts = resProds.data.DT.filter(
            p => p.categoryId === parseInt(categoryId)
          );
          setProducts(categoryProducts);
          setFilteredProducts(categoryProducts);
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryAndProducts();
      window.scrollTo(0, 0);
    }
  }, [categoryId]);

  useEffect(() => {
    // Filter products by search query
    const filtered = products.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (productItem) => {
    // Check token before adding
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("showLoginModal", "true");
      navigate("/");
      return;
    }

    const cartKey = userId ? `cart_${userId}` : "cart";
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existingItem = cart.find((item) => item.id === productItem.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...productItem, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    
    alert("Added to cart successfully!");
  };

  if (loading) {
    return (
      <div className="category-detail-page">
        <StoreHeader cartCount={cartCount} />
        <div style={{ padding: "50px", textAlign: "center" }}>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="category-detail-page">
      <StoreHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
      />

      <main className="category-detail-container">
        {/* Back Button & Category Title */}
        <div className="category-detail-header">
          {/* <button 
            className="back-btn"
            onClick={() => navigate("/store")}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Back to Store
          </button> */}
          <h1 className="category-title">{categoryName}</h1>
          <p className="product-count">{filteredProducts.length} products</p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((item,index) => (
              <div 
                className="products-card" 
                key={index}
                onClick={() => handleProductClick(item.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="products-image">
                  <img 
                    src={item.image ? getImageSrc(item.image) : product} 
                    alt={item.name}
                    onError={(e) => {e.target.onerror = null; e.target.src = product}}
                  />
                </div>
                <div className="products-info">
                  <h3 className="products-name">{item.name}</h3>
                  <p className="products-price">{Number(item.price).toLocaleString('vi-VN')} đ</p>
                  <button 
                    className="add-to-cart-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                  >
                    <FontAwesomeIcon icon={faCartPlus} /> Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>No products found in this category</p>
          </div>
        )}
      </main>
    </div>
  );
}
