// src/pages/StorePage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StoreHeader from "../../components/storeHeader/StoreHeader";
import "./StorePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus} from "@fortawesome/free-solid-svg-icons";
import banner1 from "../../images/banner1.png";
import banner2 from "../../images/banner2.png";
import banner3 from "../../images/banner3.png";
import product from "../../images/product.png";

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

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
    const fetchData = async () => {
      try {
        const [resCat, resProd] = await Promise.all([
          axios.get("http://localhost:8081/api/category"),
          axios.get("http://localhost:8081/api/products")
        ]);

        if (resCat.data.EC === 0 && resProd.data.EC === 0) {
          const cats = resCat.data.DT;
          const prods = resProd.data.DT;

          const grouped = cats.map(cat => ({
            id: cat.id,
            title: cat.name,
            items: prods.filter(p => p.categoryId === cat.id)
          }));

          setCategories(grouped);
        }
      } catch (error) {
        console.error("Error fetching store data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.items.length > 0);

  const handleProductClick = (id) => {
    console.log("Navigating to product ID:", id);
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (product) => {
    // ✅ Check token trước khi add
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("showLoginModal", "true");
      navigate("/");
      return;
    }

    const cartKey = userId ? `cart_${userId}` : "cart";
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    // Update local state for header
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    
    alert("Added to cart successfully!");
  };

  return (
    <>
      {/* <Heading /> */}

      <main className="store">

        <header className="store-header">
          <StoreHeader 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            cartCount={cartCount} 
          />
        </header>
        
        {/* BANNER SECTION */}
        <section className="banner">
          <div className="banner-images">
            <img
              src={banner1}
              alt="Medical Security for Your Pet"
              className="banner-img"
            />
            <img
              src={banner2}
              alt="Pet Food Best Quality"
              className="banner-img"
            />
            <img
              src={banner3}
              alt="Make a New Friend Adopt a Pet"
              className="banner-img"
            />
          </div>
        </section>

        {/* PRODUCTS GRID */}
        {loading ? <div style={{textAlign: "center", padding: "40px"}}>Loading products...</div> : filteredCategories.map((category) => (
          <section className="product-category" key={category.id}>
            <div className="category-header">
              <div className="yellow-square"></div>
              <h2>{category.title}</h2>
            </div>

            <div className="product-grid">
              {category.items.map((item) => (
                <div 
                  className="product-card" 
                  key={item.id} 
                  onClick={() => handleProductClick(item.id)}
                  style={{cursor: "pointer"}}
                >
                  <div className="product-image">
                    <img 
                      src={item.image ? `http://localhost:8081/images/${item.image}` : product} 
                      alt={item.name} 
                      onError={(e) => {e.target.onerror = null; e.target.src = product}}
                    />
                  </div>
                  <div className="store-product-info">
                    <h3 className="store-product-name">{item.name}</h3>
                    <p className="store-product-price">{Number(item.price).toLocaleString('vi-VN')} đ</p>
                    <button className="add-to-cart-btn" onClick={(e) => {
                      e.stopPropagation(); // Ngăn chặn click vào card khi bấm nút Add to cart
                      handleAddToCart(item);
                    }}>
                      <FontAwesomeIcon icon={faCartPlus} /> Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="see-more-container">
              <button 
                className="see-more-btn"
                onClick={() => navigate(`/category/${category.id}`)}
              >
                See more
              </button>
            </div>
          </section>
        ))}

      </main>
    </>
  );
}
