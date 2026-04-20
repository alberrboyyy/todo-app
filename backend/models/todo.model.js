const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: null
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
});

module.exports = mongoose.model('todo', todoSchema);
