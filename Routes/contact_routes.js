const express = require('express');
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  AddConvertedContact
} = require('../Controller/contact_controller');
const validateContact = require('../Middleware/contact_validators');
const verifyToken = require('../Configuration/auth'); // ✅ your auth middleware

const router = express.Router();

// 🔐 Protect all routes
router.get('/all', verifyToken, getAllContacts);
router.get('/:contactId', verifyToken, getContactById);
router.post('/', verifyToken, validateContact, createContact);
router.put('/editcontact/:contactId', verifyToken, updateContact);
router.delete('/delete-contact/:contactId', verifyToken, deleteContact);
router.post('/add-converted-contact', verifyToken, validateContact, AddConvertedContact);

module.exports = router;