const fs = require('fs');
require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { MongoClient } = require('mongodb');

const url = process.env.DB_URL || 'mongodb+srv://sivapreethi:1234qwe@cluster0.6eduu.mongodb.net/products?retryWrites=true&w=majority';

let db;
let aboutMessage = 'Inventory management API v1.0';

async function productList() {
  const products = await db.collection('products').find({}).toArray();
  return products;
}

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  console.log('Connected to MongoDB at ', url);
  db = client.db();
}

function setAboutMessage(_, { message }) {
  aboutMessage = message;
  return aboutMessage;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function productAdd(_, { product }) {
  const newProduct = { ...product };
  newProduct.id = await getNextSequence('products');
  const result = await db.collection('products').insertOne(newProduct);

  const savedProduct = await db.collection('products')
    .findOne({ _id: result.insertedId });

  return savedProduct;
}

const resolvers = {
  Query: {
    about: () => aboutMessage,
    productList,
  },
  Mutation: {
    setAboutMessage,
    productAdd,
  },
};
const server = new ApolloServer({
  typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
  resolvers,
});

const app = express();
// app.use(express.static('public'));
server.applyMiddleware({ app, path: '/graphql' });
const port = process.env.API_SERVER_PORT || 3000;
(async function start() {
  try {
    await connectToDb();
    app.listen(port, () => {
      console.log(`API Server started on port ${port}`);
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
}());
