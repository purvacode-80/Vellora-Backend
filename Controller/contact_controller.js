const Contact = require('../Model/contact_model');

const getAllContacts = async (req, res) => {
  try {
    const userEmail = req.user.email;
    // console.log('Authenticated user:', req.user);
    const contacts = await Contact.find({ createdBy: userEmail }).sort({ createdAt: -1 }); // ✅ show only user data
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving contacts', error: error.message });
  }
};

const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userEmail = req.user.email;

    const contact = await Contact.findOne({
      _id: contactId,
      createdBy: userEmail, // ✅ restrict to current user
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found or not authorized' });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving contact', error: error.message });
  }
};

const createContact = async (req, res) => {
  try {
    const { fullName, email, phone, position, company, address, notes, status } = req.body;

    const contactExists = await Contact.findOne({ email });
    if (contactExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const newContact = new Contact({ fullName, email, phone, position, company, address, notes, status, createdBy: req.user.email });
    await newContact.save();

    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact', error: error.message });
  }
};

const AddConvertedContact = async (req, res) => {
  const userEmail = req.user.email;
  try {
    const { fullName, email, phone, company } = req.body;

    const contactExists = await Contact.findOne({ email, createdBy: userEmail });
    if (contactExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const newContact = new Contact({ fullName, email, phone, company, createdBy: userEmail });
    await newContact.save();

    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: 'Error converting to contact', error: error.message });
  }
};

const updateContact = async (req, res) => {
  try {
    const contactId = req.params;
    const userEmail = req.user.email;
    const updatedData = req.body;

    const contact = await Contact.findOneAndUpdate(
      { _id: contactId, createdBy: userEmail }, // ✅ only if user owns it
      updatedData,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found or not authorized to update' });
    }

    res.status(200).json({ message: 'Contact updated successfully', contact });
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact', error: error.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userEmail = req.user.email;

    const contact = await Contact.findOneAndDelete({
      _id: contactId,
      createdBy: userEmail, // ✅ restrict to current user
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found or not authorized' });
    }

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
};

module.exports = { getAllContacts, getContactById, createContact ,updateContact, deleteContact, AddConvertedContact };
