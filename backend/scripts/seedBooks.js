const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');
const { ALLOWED_TAGS } = require('../constants/tags');

const mongoURI = process.env.MONGO_URI || "mongodb+srv://myomyataung1211_db_user:latious123@cluster0.qkocicn.mongodb.net/?appName=Cluster0";
const count = Number(process.argv[2] || 10);

const adjectives = ['Hidden', 'Lost', 'Silent', 'Ancient', 'Golden', 'Broken', 'Burning', 'Cold', 'Secret', 'Wild'];
const nouns = ['Library', 'Kingdom', 'Forest', 'River', 'Empire', 'Code', 'Machine', 'Island', 'City', 'Journey'];
const firstNames = ['Alex', 'Mia', 'Noah', 'Liam', 'Emma', 'Ava', 'Ethan', 'Leo', 'Sofia', 'Lucas'];
const lastNames = ['Smith', 'Brown', 'Taylor', 'Wilson', 'Clark', 'Davis', 'Lopez', 'Young', 'Hill', 'Lee'];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function makeRandomBook() {
  const title = `${randomItem(adjectives)} ${randomItem(nouns)}`;
  const author = `${randomItem(firstNames)} ${randomItem(lastNames)}`;
  const description = `A test book about ${randomItem(nouns).toLowerCase()} and ${randomItem(nouns).toLowerCase()}.`;

  const tag = ALLOWED_TAGS[Math.floor(Math.random() * ALLOWED_TAGS.length)];

  return { title, author, description, tag };
}

async function seed() {
  try {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error('Count must be a positive integer.');
    }

    await connectDB(mongoURI);
    const books = Array.from({ length: count }, makeRandomBook);
    await Book.insertMany(books);

    console.log(`Inserted ${books.length} random books.`);
  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
