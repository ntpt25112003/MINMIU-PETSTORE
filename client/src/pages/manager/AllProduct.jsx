import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import AddProductModal from "./modal/AddProductModal";
import "./AllProduct.css";

export default function AllProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/products');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.EC === 0) {
        setProducts(data.DT);
      } else {
        console.error('Error fetching products:', data.EM);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // const handleSaveProduct = async (formData) => {
  //   try {
  //     const response = await fetch("http://localhost:8081/api/product", {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     const responseText = await response.text();
      
  //     try {
  //       const result = JSON.parse(responseText);
  //       if (result.EC === 0) {
  //         setIsModalOpen(false);
  //         fetchProducts(); // Refresh product list
  //       } else {
  //         alert(`Error: ${result.EM}`);
  //       }
  //     } catch (e) {
  //       console.error("Server response was not JSON:",e, responseText);
  //       alert(`Server Error: ${responseText.substring(0, 200)}...`); // Hiển thị một phần lỗi từ server
  //     }

  //   } catch (error) {
  //     console.error("Error saving product:", error);
  //     alert(`An error occurred while saving the product: ${error.message}`);
  //   }
  // };

  const handleEdit = (id) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      const res = await fetch(`http://localhost:8081/api/product/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.EC === 0) {
        await fetchProducts(); // refresh list
      } else {
        alert(data.EM || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // Helper để lấy class màu cho Status
  const getStatusClass = (status) => {
    return status === "Active" ? "ap-status-active" : "ap-status-inactive";
  };

  if (loading) {
    return <div className="ap-container">Loading products...</div>;
  }

  return (
    <div className="ap-container">
      {/* Modal Add Product */}
      <AddProductModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={fetchProducts}
        mode={editingProduct ? "edit" : "add"}
        product={editingProduct}
      />

      {/* Header section with Title and Add Button */}
      <div className="ap-header-section">
        <h2 className="ap-title">All Products</h2>
        <button className="ap-add-btn" onClick={handleAddProduct}>
          Add new product
        </button>
      </div>

      {/* Table section */}
      <div className="ap-table-container">
        <table className="ap-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Products</th>
              <th className="ap-text-center">Quantity</th>
              <th>Price</th>
              <th className="ap-text-center">Category</th>
              <th className="ap-text-center">Status</th>
              <th className="ap-text-center">Upd ate</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="ap-product-info">
                    <img 
                      src={`http://localhost:8081/images/${product.image}`}
                      alt={product.name}
                      className="ap-product-img"
                    />
                    <span className="ap-product-name">{product.name}</span>
                  </div>
                </td>
                <td className="ap-text-center">{product.quantity}</td>
                <td className="ap-price">
                  {Number(product.price ?? 0).toLocaleString("vi-VN")}đ
                </td>
                <td className="ap-text-center">
                  <span className="ap-badge ap-badge-category">
                    {product.category?.name}
                  </span>
                </td>
                <td className="ap-text-center">
                  <span
                    className={`ap-badge ap-badge-status ${getStatusClass(
                      product.status
                    )}`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="ap-text-center">
                  <div className="ap-actions">
                    <button
                      className="ap-action-btn edit-button"
                      onClick={() => handleEdit(product.id)}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </button>
                    <button
                      className="ap-action-btn delete-btn"
                      onClick={() => handleDelete(product.id)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}