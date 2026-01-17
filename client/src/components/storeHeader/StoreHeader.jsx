import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch, faShoppingCart, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "./StoreHeader.css";
import axios from "axios";

const API_URL = "http://localhost:8081/api";

const StoreHeader = ({ searchQuery, setSearchQuery, cartCount = 3 }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/category`);
      if (response.data.EC === 0) {
        setCategories(response.data.DT);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
    setIsMenuOpen(false);
  };

  return (
    <header className="store-header-container">
      <div className="header-content">
        
        {/* BÊN TRÁI: Nút Danh mục */}
        <div className="header-left" ref={menuRef}>
          <button 
            className={`category-btn ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
            <span>Category</span>
          </button>

          {isMenuOpen && (
            <div className="category-dropdown">
              {loading ? (
                <div className="dropdown-item">Loading...</div>
              ) : categories.length === 0 ? (
                <div className="dropdown-item">No categories available</div>
              ) : (
                categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="dropdown-item"
                    onClick={() => handleCategoryClick(cat.id, cat.name)}
                  >
                    <span>{cat.name}</span>
                    <FontAwesomeIcon icon={faChevronRight} className="chevron" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* BÊN PHẢI: Nhóm Tìm kiếm + Giỏ hàng */}
        <div className="header-right">
          <div className="search-section">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="cart-section" onClick={() => navigate("/cart")} style={{ cursor: "pointer" }}>
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className="count">{cartCount}</span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default StoreHeader;