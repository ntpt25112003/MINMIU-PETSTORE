import React, { useEffect, useState } from "react";
import "./AddProductModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const API_URL = "http://localhost:8081/api";

export default function AddProductModal({ open, onClose, onSave, mode = "add", product = null }) {
  const [form, setForm] = useState({
    name: "",
    image: null,
    quantity: "",
    price: "",
    status: "Active",
    categoryId: "",
    description: "",
  });

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && product) {
      setForm({
        name: product.name ?? "",
        image: null, // edit không bắt buộc upload lại ảnh
        quantity: String(product.quantity ?? ""),
        price: String(product.price ?? ""),
        status: product.status ?? "Active",
        categoryId: String(product.categoryId ?? ""),
        description: product.description ?? "",
      });

      // preview ảnh cũ
      if (product.image) {
        setPreview(`http://localhost:8081/images/${product.image}`);
      } else {
        setPreview(null);
      }
    }

    if (mode === "add") {
      setForm({
        name: "",
        image: null,
        quantity: "",
        price: "",
        status: "Active",
        categoryId: "",
        description: "",
      });
      setPreview(null);
    }
  }, [open, mode, product]);

  // Xử lý đóng modal bằng phím ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Fetch categories when modal opens
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/category`);
        console.log("Fetch categories response:", response.data);
        if (response.data.EC === 0) {
          setCategories(response.data.DT);
          // Set default category to first category if available
          if (response.data.DT.length > 0) {
            setForm(p => ({ ...p, categoryId: String(response.data.DT[0].id) }));
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Khóa scroll khi mở modal
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((p) => ({ ...p, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validation
    if ( !form.name || !form.quantity || !form.price || !form.categoryId || (mode === "add" && !form.image)) 
    {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("quantity", form.quantity);
      formData.append("price", form.price);
      formData.append("status", form.status);
      formData.append("categoryId", form.categoryId);
      formData.append("description", form.description);

      // chỉ append image khi có chọn
      if (form.image) {
        formData.append("image", form.image);
      }

      // 🔥 QUAN TRỌNG: phân biệt ADD / EDIT
      const url =
        mode === "edit"
          ? `${API_URL}/product/${product.id}`
          : `${API_URL}/product`;

      const method = mode === "edit" ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.EC === 0) {
        alert(mode === "edit" ? "Product updated successfully!" : "Product added successfully!");

        setPreview(null);
        onClose?.();
        onSave?.(); // 👈 parent fetchProducts()
      } else {
        alert(response.data.EM || "Failed");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error.response?.data?.EM || "Failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="productModalOverlay" onMouseDown={onClose}>
      <div className="productModalCard" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="productModalTitle">Add New Product</h2>

        <form className="productModalForm" onSubmit={handleSubmit}>
          {/* Hàng 1: Name (rộng) và Image (ngắn) */}
          <div className="topRow">
            <div className="field flex-3">
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                required
              />
            </div>
            <div className="field flex-1">
              <span>Image</span>
              <label className="uploadBox">
                {preview ? (
                  <img src={preview} alt="preview" className="imgPreview" />
                ) : (
                  <div className="uploadPlaceholder">
                    <FontAwesomeIcon icon={faUpload} className="uploadIcon" />
                    <span>Upload Image</span>
                  </div>
                )}
                <input type="file" hidden onChange={handleImageChange} />
              </label>
            </div>
          </div>

          {/* Hàng 2: Chia 4 cột bằng nhau */}
          <div className="formGrid">
            <div className="field">
              <span>Quantity</span>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={onChange}
                required
              />
            </div>
            <div className="field">
              <span>Price</span>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={onChange}
                required
              />
            </div>
            <div className="field">
              <span>Status</span>
              <select name="status" value={form.status} onChange={onChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="field">
              <span>Category</span>
              <select name="categoryId" value={form.categoryId} onChange={onChange}>
                <option value="">Select a category</option>
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No categories available</option>
                )}
              </select>
            </div>
          </div>

          {/* Hàng 3: Description */}
          <div className="field">
            <span>Description</span>
            <textarea
              name="description"
              rows="5"
              value={form.description}
              onChange={onChange}
            ></textarea>
          </div>

          {/* Hàng 4: Nút bấm */}
          <div className="productModalActions">
            <button type="button" className="cancelBtn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="saveBtn" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}