const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: {
    type: String,
    default: 'user'
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
