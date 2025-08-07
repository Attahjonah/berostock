const Client = require("../models/clientModel");

// Create a new client
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, email, and phone are required" });
    }

    const clientExists = await Client.findOne({ email });
    if (clientExists) {
      return res.status(409).json({ message: "Client with this email already exists" });
    }

    const client = await Client.create({ name, email, phone, address });
    res.status(201).json({ message: "Client created successfully", client });
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      Client.find().skip(skip).limit(limit),
      Client.countDocuments(),
    ]);

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: clients,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Update a client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const client = await Client.findByIdAndUpdate(
      id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ message: "Client updated successfully", client });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ message: "Server error" });
  }
};
