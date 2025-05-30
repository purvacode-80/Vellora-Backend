const Event = require('../Model/event_model');

// Get all events created by the user
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.email });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving events', error: err.message });
  }
};

// Create a new event for the user
const addEvent = async (req, res) => {
  const { title, start, end, description, notify, reminderTime } = req.body;

  try {
    const newEvent = new Event({
      title,
      start,
      end,
      description,
      createdBy: req.user.email,
      notify: notify || false, // Default to false if not provided
      reminderTime: reminderTime || 5, // Default to 5 minutes if not provided
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: 'Error creating event', error: err.message });
  }
};

// Update an event by ID and user
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Extract all possible fields including notification settings
    const updateData = {};
    const allowedFields = ['title', 'start', 'end', 'description', 'notify', 'reminderTime'];
    
    // Only include fields that are present in the request body
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updateData[field] = req.body[field];
      }
    });

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, createdBy: req.user.email },
      updateData,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found or not authorized to update' });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: 'Error updating event', error: err.message });
  }
};

// Delete an event by ID and user
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const deletedEvent = await Event.findOneAndDelete({ _id: eventId, createdBy: req.user.email });

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found or not authorized to delete' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event', error: err.message });
  }
};

module.exports = { getEvents, addEvent, updateEvent, deleteEvent };