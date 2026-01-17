import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrashCan, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./AddCategory.css";
import axios from "axios";

const API_URL = "http://localhost:8081/api";

export default function AddCategory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Fetch all categories on component mount
  useEffect(() => {
    fetchCategories();
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
      alert("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newCategory.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/category`, {
        name: newCategory
      });

      if (response.data.EC === 0) {
        setCategories([...categories, response.data.DT]);
        setNewCategory("");
        alert("Category added successfully");
      } else {
        alert(response.data.EM || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert(error.response?.data?.EM || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/category/${editingId}`, {
        name: editingName
      });

      if (response.data.EC === 0) {
        setCategories(categories.map(cat => 
          cat.id === editingId ? response.data.DT : cat
        ));
        setEditingId(null);
        setEditingName("");
        alert("Category updated successfully");
      } else {
        alert(response.data.EM || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert(error.response?.data?.EM || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        setLoading(true);
        const response = await axios.delete(`${API_URL}/category/${id}`);

        if (response.data.EC === 0) {
          setCategories(categories.filter(cat => cat.id !== id));
          alert("Category deleted successfully");
        } else {
          alert(response.data.EM || "Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(error.response?.data?.EM || "Failed to delete category");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="cat-container">
      <h2 className="cat-main-title">Category</h2>

      <div className="cat-grid">
        {/* CỘT BÊN TRÁI: ADD CATEGORY */}
        <div className="cat-card">
          <h3 className="cat-card-title">Add Category</h3>
          <div className="cat-form-group">
            <label>Name</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="cat-input"
              placeholder="Enter category name"
              disabled={loading}
            />
          </div>
          <div className="cat-btn-wrapper">
            <button 
              className="cat-save-btn" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* CỘT BÊN PHẢI: LIST CATEGORY */}
        <div className="cat-card">
          <h3 className="cat-card-title">Category</h3>
          <div className="cat-list">
            {categories.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999" }}>No categories yet</p>
            ) : (
              categories.map((item, index) => (
                <div
                  key={item.id}
                  className={`cat-item ${index % 2 === 0 ? "bg-light" : ""}`}
                >
                  {editingId === item.id ? (
                    <div className="cat-edit-row"> 
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="cat-edit-input"
                        disabled={loading}
                      />
                      <div className="cat-actions">
                        <button 
                          className="cat-icon-btn save" 
                          onClick={handleSaveEdit}
                          disabled={loading}
                          title="Save"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button 
                          className="cat-icon-btn cancel" 
                          onClick={handleCancelEdit}
                          disabled={loading}
                          title="Cancel"
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="cat-name">{item.name}</span>
                      <div className="cat-actions">
                        <button 
                          className="cat-icon-btn edit" 
                          onClick={() => handleEdit(item.id, item.name)}
                          disabled={loading}
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </button>
                        <button 
                          className="cat-icon-btn delete" 
                          onClick={() => handleDelete(item.id)}
                          disabled={loading}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}