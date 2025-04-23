const Contact = require('../Model/contact_model');

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  }
  catch (error) {
    res.status(500).json({ message: 'Error retrieving contacts', error: error.message });
  }
};

const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(200).json(contact);
  }
  catch (error) {
    res.status(500).json({ message: 'Error retrieving contact', error: error.message });
}
};

const createContact = async (req, res) => {
  try {
    const { name, email, phone, position, company, address, notes, status } = req.body;
    const contactExists = await Contact.findOne({ email })
      if(contactExists) {
          return res.status(400).json({ message : "User with this email already exists" })
    }

    const newContact = new Contact({ name, email, phone, position, company, address, notes, status });
    await newContact.save();
    res.status(201).json(newContact);
  }
  catch (error) {
    res.status(500).json({ message: 'Error creating contact', error: error.message });
  }
};
const updateContact = async (req, res) => {
  try {

      const _id = req.params._id;
      const updatedData = req.body;
      const updatedUser = await Contact.findByIdAndUpdate(_id, updatedData, {
          new: true
      });


      if (!updatedUser) {
          return res.status(404).send('No user found to update');
      }

      res.status(200).send({ message: "User updated successfully", updatedUser });
  } catch (error) {
      res.status(500).send(error.message);
  }
};

  


module.exports = { getAllContacts, getContactById, createContact ,updateContact};
