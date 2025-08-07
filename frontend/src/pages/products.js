// Top imports (same as before)
import React, { useEffect, useState } from "react";
import { API } from "../api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Toast from "../components/toast";
import ConfirmModal from "../components/confirmModal";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "./products.css";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [role, setRole] = useState("staff");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const isPrivileged = role === "admin" || role === "manager";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (err) {
        console.error("Invalid token");
      }
    }
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await API.get(`/products?page=${currentPage}&search=${searchTerm}`);
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const showDeleteModal = (id) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await API.delete(`/products/${deleteId}`);
      setMessage("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      setError("Failed to delete product");
    } finally {
      setModalOpen(false);
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditData(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const productData = {
      name: form.name.value,
      description: form.description.value,
      cost_price: parseFloat(form.cost_price.value),
      quantity: parseInt(form.quantity.value),
      supplier: form.supplier.value
    };

    try {
      setLoading(true);
      if (editData) {
        await API.put(`/products/${editData._id}`, productData);
        setMessage("Product updated successfully");
      } else {
        await API.post("/products", productData);
        setMessage("Product added successfully");
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError("Failed to submit product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-page">
      <h2>Products</h2>

      <Toast message={message} type="success" />
      <Toast message={error} type="error" />

      <ConfirmModal
        isOpen={modalOpen}
        message={`Are you sure you want to delete this product?`}
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmDelete}
      />

      <div className="product-controls">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
        />
        {isPrivileged && (
          <button className="icon-btn" onClick={handleAdd} title="Add Product">
            <FaPlus /> Add Product
          </button>
        )}
      </div>

      {showForm && isPrivileged && (
        <form className="product-form" onSubmit={handleFormSubmit}>
          <h3>{editData ? "Edit Product" : "Add Product"}</h3>
          <input
            type="text"
            name="name"
            defaultValue={editData?.name || ""}
            placeholder="Product Name"
            required
          />
          <textarea
            name="description"
            defaultValue={editData?.description || ""}
            placeholder="Description"
            required
          />
          <input
            type="number"
            name="cost_price"
            defaultValue={editData?.cost_price || ""}
            placeholder="Cost Price"
            required
          />
          <input
            type="number"
            name="quantity"
            defaultValue={editData?.quantity || ""}
            placeholder="Quantity"
            required
          />
          <select name="supplier" defaultValue={editData?.supplier || ""} required>
            <option value="">Select Supplier</option>
            <option value="Fouani">Fouani</option>
            <option value="Somotex">Somotex</option>
            <option value="Guandzou China">Guandzou China</option>
          </select>
          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              {editData ? "Update" : "Add"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <div className="spinner">Loading...</div>}

      {!loading && products.length === 0 && <p>No products found.</p>}

      {!loading && products.length > 0 && (
        <>
          <table className="product-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                {isPrivileged && <th>Cost Price</th>}
                <th>Selling Price</th>
                <th>Quantity</th>
                <th>Supplier</th>
                {isPrivileged && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  {isPrivileged && <td>₦{product.cost_price}</td>}
                  <td>₦{product.selling_price}</td>
                  <td>{product.quantity}</td>
                  <td>{product.supplier}</td>
                  {isPrivileged && (
                    <td>
                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() => handleEdit(product)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="icon-btn delete"
                        title="Delete"
                        onClick={() => showDeleteModal(product._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ◀ Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Products;