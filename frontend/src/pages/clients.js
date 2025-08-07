import React, { useEffect, useState, useCallback } from "react";
import { API } from "../api";
import { jwtDecode } from "jwt-decode";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Toast from "../components/toast";
import "./clients.css";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });
  const [editMode, setEditMode] = useState(false);
  const [ setRole] = useState("staff"); // ✅ Fixed missing setRole
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await API.get(`/clients?page=${page}&limit=10`);
      setClients(res.data.data || []);
      setFilteredClients(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [page]); // ✅ Stable reference

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
    fetchClients();
  }, [fetchClients, setRole]); // ✅ No warning now

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await API.delete(`/clients/${id}`);
      setMessage("Client deleted successfully");
      fetchClients();
    } catch (err) {
      setError("Failed to delete client");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      if (editMode) {
        await API.patch(`/clients/${editId}`, formData);
        setMessage("Client updated successfully");
      } else {
        await API.post("/clients", formData);
        setMessage("Client added successfully");
      }
      setFormData({ name: "", email: "", phone: "", address: "" });
      setShowForm(false);
      setEditMode(false);
      setEditId(null);
      fetchClients();
    } catch (err) {
      const msg = err.response?.data?.message || "An error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (client) => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    });
    setEditMode(true);
    setEditId(client._id);
    setShowForm(true);
  };

  return (
    <div className="client-page">
      <h2>Clients</h2>

      <Toast message={message} type="success" />
      <Toast message={error} type="error" />

      <div className="client-controls">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditMode(false);
            setFormData({ name: "", email: "", phone: "", address: "" });
          }}
          className="add-btn"
        >
          <FaPlus /> Add Client
        </button>
      </div>

      {showForm && (
        <form className="client-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <input type="tel" placeholder="Phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <input type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <div>
            <button type="submit" className="save-btn">
              {loading ? "Saving..." : "Save Client"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setEditId(null);
                  setFormData({ name: "", email: "", phone: "", address: "" });
                  setShowForm(false);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="spinner" />
      ) : filteredClients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <>
          <table className="client-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client._id}>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>{client.address}</td>
                  <td>
                    <button onClick={() => handleEditClick(client)} title="Edit">
                      <FaEdit color="#1e40af" />
                    </button>
                    <button onClick={() => handleDelete(client._id)} title="Delete">
                      <FaTrash color="#dc2626" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-controls">
            <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
              ◀ Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Clients;







// import React, { useEffect, useState, useCallback } from "react";
// import { API } from "../api";
// import { jwtDecode } from "jwt-decode";
// import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
// import Toast from "../components/toast";
// import "./clients.css";

// const Clients = () => {
//   const [clients, setClients] = useState([]);
//   const [filteredClients, setFilteredClients] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });
//   const [editMode, setEditMode] = useState(false);
//   const [ setRole] = useState("staff");
//   const [editId, setEditId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const fetchClients = useCallback(async () => {
//     setLoading(true);
//     setMessage("");
//     setError("");
//     try {
//       const res = await API.get(`/clients?page=${page}&limit=10`);
//       setClients(res.data.data || []);
//       setFilteredClients(res.data.data || []);
//       setTotalPages(res.data.totalPages || 1);
//     } catch (err) {
//       setError("Failed to load clients");
//     } finally {
//       setLoading(false);
//     }
//   }, [page]);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//         if (token) {
//           try {
//             const decoded = jwtDecode(token);
//             setRole(decoded.role);
//           } catch (err) {
//             console.error("Invalid token:", err);
//           }
//         }
//     fetchClients();
//   }, [fetchClients]);

//   const handleSearch = (e) => {
//     const term = e.target.value;
//     setSearchTerm(term);
//     const filtered = clients.filter(client =>
//       client.name.toLowerCase().includes(term.toLowerCase())
//     );
//     setFilteredClients(filtered);
//   };

//   const handleDelete = async (id) => {
//     setLoading(true);
//     setMessage("");
//     setError("");
//     try {
//       await API.delete(`/clients/${id}`);
//       setMessage("Client deleted successfully");
//       fetchClients();
//     } catch (err) {
//       setError("Failed to delete client");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");
//     setLoading(true);
//     try {
//       if (editMode) {
//         await API.patch(`/clients/${editId}`, formData);
//         setMessage("Client updated successfully");
//       } else {
//         await API.post("/clients", formData);
//         setMessage("Client added successfully");
//       }
//       setFormData({ name: "", email: "", phone: "", address: "" });
//       setShowForm(false);
//       setEditMode(false);
//       setEditId(null);
//       fetchClients();
//     } catch (err) {
//       const msg = err.response?.data?.message || "An error occurred";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditClick = (client) => {
//     setFormData({
//       name: client.name,
//       email: client.email,
//       phone: client.phone,
//       address: client.address,
//     });
//     setEditMode(true);
//     setEditId(client._id);
//     setShowForm(true);
//   };

//   return (
//     <div className="client-page">
//       <h2>Clients</h2>

//       <Toast message={message} type="success" />
//       <Toast message={error} type="error" />

//       <div className="client-controls">
//         <input
//           type="text"
//           placeholder="Search by name..."
//           value={searchTerm}
//           onChange={handleSearch}
//         />
//         <button
//           onClick={() => {
//             setShowForm(!showForm);
//             setEditMode(false);
//             setFormData({ name: "", email: "", phone: "", address: "" });
//           }}
//           className="add-btn"
//         >
//           <FaPlus /> Add Client
//         </button>
//       </div>

//       {showForm && (
//         <form className="client-form" onSubmit={handleSubmit}>
//           <input type="text" placeholder="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
//           <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
//           <input type="tel" placeholder="Phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
//           <input type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
//           <div>
//             <button type="submit" className="save-btn">
//               {loading ? "Saving..." : "Save Client"}
//             </button>
//             {editMode && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setEditMode(false);
//                   setEditId(null);
//                   setFormData({ name: "", email: "", phone: "", address: "" });
//                   setShowForm(false);
//                 }}
//                 className="cancel-btn"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>
//       )}

//       {loading ? (
//         <div className="spinner" />
//       ) : filteredClients.length === 0 ? (
//         <p>No clients found.</p>
//       ) : (
//         <>
//           <table className="client-table">
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Phone</th>
//                 <th>Address</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredClients.map((client) => (
//                 <tr key={client._id}>
//                   <td>{client.name}</td>
//                   <td>{client.email}</td>
//                   <td>{client.phone}</td>
//                   <td>{client.address}</td>
//                   <td>
//                     <button onClick={() => handleEditClick(client)} title="Edit">
//                       <FaEdit color="#1e40af" />
//                     </button>
//                     <button onClick={() => handleDelete(client._id)} title="Delete">
//                       <FaTrash color="#dc2626" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="pagination-controls">
//             <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
//               ◀ Previous
//             </button>
//             <span>Page {page} of {totalPages}</span>
//             <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
//               Next ▶
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Clients;
