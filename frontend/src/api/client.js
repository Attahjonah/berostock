import API from "./index";

// Fetch clients with pagination
export const fetchClients = (page = 1, limit = 10) => {
  return API.get(`/clients?page=${page}&limit=${limit}`);
};

// Create a new client
export const createClient = (clientData) => {
  return API.post("/clients", clientData);
};

// Update a client
export const updateClient = (id, clientData) => {
  return API.patch(`/clients/${id}`, clientData);
};

// Delete a client
export const deleteClient = (id) => {
  return API.delete(`/clients/${id}`);
};
