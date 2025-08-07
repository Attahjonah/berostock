import React, { useEffect, useState, useCallback } from "react";
import { API } from "../api";
import { jwtDecode } from "jwt-decode";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Toast from "../components/toast";
import ConfirmModal from "../components/confirmModal";
import "./sales.css";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("staff");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await API.get(`/sales?page=${page}&limit=5`);
      setSales(res.data.data || []);
      setFilteredSales(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError("Failed to fetch sales data");
    } finally {
      setLoading(false);
    }
  }, [page]); // ✅ Only re-create when `page` changes

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
    fetchSales();
  }, [fetchSales]); // ✅ No warning now

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = sales.filter((sale) => {
      const customerMatch = sale.customer_name.toLowerCase().includes(term);
      const productMatch = sale.products.some((p) =>
        p.product_name.toLowerCase().includes(term)
      );
      return customerMatch || productMatch;
    });

    setFilteredSales(filtered);
  };

  const showDeleteModal = (id) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await API.delete(`/sales/${deleteId}`);
      setMessage("Sale deleted successfully");
      fetchSales();
    } catch (err) {
      setError("Failed to delete sale");
    } finally {
      setModalOpen(false);
      setLoading(false);
    }
  };

  const handleEdit = (saleId) => {
    navigate(`/sale/edit/${saleId}`);
  };

  return (
    <div className="sales-page">
      <h2>Sales</h2>

      <Toast message={message} type="success" />
      <Toast message={error} type="error" />

      <ConfirmModal
        isOpen={modalOpen}
        message={`Are you sure you want to delete this sale?`}
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmDelete}
      />

      <div className="sales-controls">
        <input
          type="text"
          placeholder="Search sale..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {loading && <div className="spinner">Loading...</div>}

      {!loading && filteredSales.length === 0 && <p>No sales found.</p>}

      {!loading && filteredSales.length > 0 && (
        <>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Products</th>
                <th>Total Price</th>
                {role !== "staff" && <th>Profit</th>}
                <th>Payment Mode</th>
                <th>Date</th>
                <th>Sold By</th>
                {(role === "admin" || role === "manager") && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale._id}>
                  <td>{sale.customer_name}</td>
                  <td>
                    {sale.products.map((p) => (
                      <div key={p.product_id}>
                        {p.product_name} (x{p.quantity})
                      </div>
                    ))}
                  </td>
                  <td>₦{sale.total_price}</td>
                  {role !== "staff" && <td>₦{sale.profit_made}</td>}
                  <td>{sale.mode_of_payment}</td>
                  <td>{new Date(sale.date_of_sale).toLocaleDateString()}</td>
                  <td>{sale.sold_by}</td>
                  {(role === "admin" || role === "manager") && (
                    <td>
                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() => handleEdit(sale.sale_id)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="icon-btn delete"
                        onClick={() => showDeleteModal(sale._id)}
                        title="Delete"
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
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              ◀ Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Sales;








// import React, { useEffect, useState } from "react";
// import { API } from "../api";
// import { jwtDecode } from "jwt-decode";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import Toast from "../components/toast";
// import ConfirmModal from "../components/confirmModal";
// import "./sales.css";

// const Sales = () => {
//   const [sales, setSales] = useState([]);
//   const [filteredSales, setFilteredSales] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [role, setRole] = useState("staff");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);

//   const navigate = useNavigate();

//   const fetchSales = async () => {
//     setLoading(true);
//     setMessage("");
//     setError("");
//     try {
//       const res = await API.get(`/sales?page=${page}&limit=5`);
//       setSales(res.data.data || []);
//       setFilteredSales(res.data.data || []);
//       setTotalPages(res.data.pages || 1);
//     } catch (err) {
//       setError("Failed to fetch sales data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setRole(decoded.role);
//       } catch (err) {
//         console.error("Invalid token");
//       }
//     }
//     fetchSales();
//   }, [fetchSales]);

//   const handleSearch = (e) => {
//   const term = e.target.value.toLowerCase();
//   setSearchTerm(term);

//   const filtered = sales.filter((sale) => {
//     const customerMatch = sale.customer_name.toLowerCase().includes(term);
//     const productMatch = sale.products.some((p) =>
//       p.product_name.toLowerCase().includes(term)
//     );
//     return customerMatch || productMatch;
//   });

//   setFilteredSales(filtered);
// };


//   const showDeleteModal = (id) => {
//     setDeleteId(id);
//     setModalOpen(true);
//   };

//   const confirmDelete = async () => {
//     setLoading(true);
//     try {
//       await API.delete(`/sales/${deleteId}`);
//       setMessage("Sale deleted successfully");
//       fetchSales();
//     } catch (err) {
//       setError("Failed to delete sale");
//     } finally {
//       setModalOpen(false);
//       setLoading(false);
//     }
//   };

//   const handleEdit = (saleId) => {
//     navigate(`/sale/edit/${saleId}`);
//   };

//   return (
//     <div className="sales-page">
//       <h2>Sales</h2>

//       <Toast message={message} type="success" />
//       <Toast message={error} type="error" />

//       <ConfirmModal
//         isOpen={modalOpen}
//         message={`Are you sure you want to delete this sale?`}
//         onCancel={() => setModalOpen(false)}
//         onConfirm={confirmDelete}
//       />

//       <div className="sales-controls">
//         <input
//           type="text"
//           placeholder="Search sale..."
//           value={searchTerm}
//           onChange={handleSearch}
//         />
//       </div>

//       {loading && <div className="spinner">Loading...</div>}

//       {!loading && filteredSales.length === 0 && <p>No sales found.</p>}

//       {!loading && filteredSales.length > 0 && (
//         <>
//           <table className="sales-table">
//             <thead>
//               <tr>
//                 <th>Customer</th>
//                 <th>Products</th>
//                 <th>Total Price</th>
//                 {role !== "staff" && <th>Profit</th>}
//                 <th>Payment Mode</th>
//                 <th>Date</th>
//                 <th>Sold By</th>
//                 {(role === "admin" || role === "manager") && <th>Actions</th>}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredSales.map((sale) => (
//                 <tr key={sale._id}>
//                   <td>{sale.customer_name}</td>
//                   <td>
//                     {sale.products.map((p) => (
//                       <div key={p.product_id}>
//                         {p.product_name} (x{p.quantity})
//                       </div>
//                     ))}
//                   </td>
//                   <td>₦{sale.total_price}</td>
//                   {role !== "staff" && <td>₦{sale.profit_made}</td>}
//                   <td>{sale.mode_of_payment}</td>
//                   <td>{new Date(sale.date_of_sale).toLocaleDateString()}</td>
//                   <td>{sale.sold_by}</td>
//                   {(role === "admin" || role === "manager") && (
//                     <td>
//                       <button className="icon-btn" title="Edit" onClick={() => handleEdit(sale.sale_id)}>
//                         <FaEdit />
//                       </button>
//                       <button className="icon-btn delete" onClick={() => showDeleteModal(sale._id)} title="Delete">
//                         <FaTrash />
//                       </button>
//                     </td>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="pagination-controls">
//             <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
//               ◀ Previous
//             </button>
//             <span>Page {page} of {totalPages}</span>
//             <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
//               Next ▶
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Sales;
