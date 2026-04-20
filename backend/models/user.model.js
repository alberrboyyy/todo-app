const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Veuillez entrer une adresse email valide']
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  address: {
    type: String
  },
  zip: {
    type: Number
  },
  location: {
    type: String
  }
});

module.exports = mongoose.model('user', userSchema);
