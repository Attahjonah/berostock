import React, { useEffect, useState } from "react";
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from "../api/client";
import { FaTrash, FaEdit } from "react-icons/fa";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editingId, setEditingId] = useState(null); // holds client._id when editing

  const loadClients = async () => {
    try {
      const res = await fetchClients(page);
      setClients(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error loading clients:", err);
    }
  };

  useEffect(() => {
    loadClients();
  }, [page]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateClient(editingId, formData);
        setEditingId(null);
      } else {
        await createClient(formData);
      }
      setFormData({ name: "", email: "", phone: "", address: "" });
      loadClients();
    } catch (err) {
      console.error("Error saving client:", err);
    }
  };

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    });
    setEditingId(client._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    try {
      await deleteClient(id);
      loadClients();
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  };

  const filteredClients = clients.filter((client) =>
    `${client.name} ${client.email} ${client.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Clients</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px",
          marginBottom: "1rem",
          width: "100%",
          maxWidth: "400px",
        }}
      />

      {/* Form */}
      <form onSubmit={handleCreateOrUpdate} style={{ marginBottom: "1rem" }}>
        <input
          placeholder="Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          placeholder="Email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          placeholder="Phone"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <input
          placeholder="Address"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
        <button type="submit">{editingId ? "Update" : "Add"} Client</button>
      </form>

      {/* Client List */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
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
                <button
                  onClick={() => handleEdit(client)}
                  style={{ marginRight: "8px" }}
                  title="Edit"
                >
                  <FaEdit color="#1e3a8a" />
                </button>
                <button onClick={() => handleDelete(client._id)} title="Delete">
                  <FaTrash color="crimson" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: "1rem" }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            style={{
              margin: "0 5px",
              fontWeight: i + 1 === page ? "bold" : "normal",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Clients;
