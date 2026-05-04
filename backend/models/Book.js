const mongoose = require('mongoose');
const { ALLOWED_TAGS } = require('../constants/tags');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  photo: {
    type: String,
    default: '',
    trim: true,
  },
  pdf: {
    type: String,
    default: '',
    trim: true,
  },
  tag: {
    type: String,
    enum: ALLOWED_TAGS,
    default: ALLOWED_TAGS[0],
  },
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
