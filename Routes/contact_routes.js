const express = require('express');
const { getAllContacts, getContactById, createContact, updateContact } = require('../Controller/contact_controller');
const validateContact = require('../Middleware/contact_validators');
const router = express.Router();

router.get('/all', getAllContacts);
router.get('/:contactId', getContactById);
router.post('/', validateContact, createContact);
router.put('/editcontact/:_id',updateContact)

module.exports = router;
