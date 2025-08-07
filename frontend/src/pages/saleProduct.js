import React, { useState, useEffect } from "react";
import { API } from "../api";
import { useParams } from "react-router-dom";
import Toast from "../components/toast";
import "./saleProduct.css";

const SaleProduct = () => {
  const { saleId } = useParams(); // get sale ID from URL
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isEditMode = !!saleId;

  // ✅ Fetch sale data if editing
  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await API.get(`/sales/${saleId}`);
        const sale = res.data.data;

        setCustomerName(sale.customer_name);
        setPaymentMode(sale.mode_of_payment);

        // Flatten product list
        const items = sale.products.map((item) => ({
          ...item,
          product_id: item.product_id._id || item.product_id,
          name: item.product_name || item.product_id.name,
          selling_price: item.selling_price || item.product_id.selling_price,
        }));

        setSelectedItems(items);
      } catch (err) {
        console.error("Error loading sale:", err);
        setError("Failed to load sale for editing");
      }
    };

    if (isEditMode) fetchSale();
  }, [isEditMode, saleId]);

  // 🔍 Live search
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length < 1) {
      setProducts([]);
      return;
    }

    try {
      const res = await API.get(`/products?search=${value}`);
      const list = (res.data.data || []).map((p) => ({
        ...p,
        product_id: p.product_id || p._id,
      }));
      setProducts(list);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search products");
    }
  };

  const handleAddToSale = (product) => {
    if (product.quantity < 1) return;
    const exists = selectedItems.find((p) => p.product_id === product.product_id);
    if (exists) return;

    setSelectedItems([...selectedItems, { ...product, quantity: 1 }]);
    setProducts([]);
    setSearchTerm("");
  };

  const handleRemoveItem = (product_id) => {
    setSelectedItems(selectedItems.filter((p) => p.product_id !== product_id));
  };

  const handleQuantityChange = (product_id, quantity) => {
    if (quantity <= 0) return;
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.product_id === product_id
          ? { ...item, quantity: Number(quantity) }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return setError("No products selected");

    setLoading(true);
    setError("");
    setMessage("");

    const payload = {
      products: selectedItems.map((p) => ({
        product_id: p.product_id,
        quantity: p.quantity,
      })),
      customer_name: customerName || "Walk-in Customer",
      mode_of_payment: paymentMode,
    };

    try {
      let res;
      if (isEditMode) {
        res = await API.put(`/sales/${saleId}`, payload);
      } else {
        res = await API.post("/sales", payload);
      }

      const { invoice_url } = res.data;

      // ✅ Print invoice in background
      const fileRes = await fetch(invoice_url);
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      };

      setMessage(isEditMode ? "Sale updated and invoice printing..." : "Sale completed and invoice printing...");
      setSelectedItems([]);
      setCustomerName("");
      setSearchTerm("");
    } catch (err) {
      console.error("❌", err);
      setError("Failed to submit sale.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sale-container">
      <h2>{isEditMode ? "Edit Sale" : "Sell Products"}</h2>

      <Toast message={message} type="success" />
      <Toast message={error} type="error" />

      <div className="sale-form">
        <input
          type="text"
          placeholder="Search product by name..."
          value={searchTerm}
          onChange={handleSearch}
        />

        {products.length > 0 && (
          <div className="product-list">
            {products.map((product) => (
              <div key={product.product_id} className="product-item">
                <span>
                  {product.name} <small>(Qty: {product.quantity})</small>
                </span>
                <button
                  disabled={product.quantity < 1}
                  onClick={() => handleAddToSale(product)}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="selected-list">
          <h3>Selected Products</h3>
          {selectedItems.map((item) => (
            <div key={item.product_id} className="selected-item">
              <span>{item.name}</span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(item.product_id, e.target.value)
                }
              />
              <button onClick={() => handleRemoveItem(item.product_id)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <input
          type="text"
          placeholder="Customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
        >
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Transfer">Transfer</option>
        </select>

        <div className="sale-summary">
          <h3>Sale Summary</h3>
          <ul>
            {selectedItems.map((item) => (
              <li key={item.product_id}>
                {item.name} - ₦{(item.selling_price || 0).toLocaleString()} ×{" "}
                {item.quantity} = ₦
                {(item.selling_price * item.quantity).toLocaleString()}
              </li>
            ))}
          </ul>
          <h4>
            Total: ₦
            {selectedItems
              .reduce(
                (sum, item) => sum + item.selling_price * item.quantity,
                0
              )
              .toLocaleString()}
          </h4>
        </div>

        <button onClick={handleSubmit} disabled={loading}>
          {loading
            ? "Processing..."
            : isEditMode
            ? "Update Sale & Print"
            : "Complete Sale & Print Invoice"}
        </button>
      </div>
    </div>
  );
};

export default SaleProduct;
