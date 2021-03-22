const fs = require('fs');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

let aboutMessage = "Inventory management API v1.0";

const productsDB = [];

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

function productList() {
    return productsDB;
}
function setAboutMessage(_, { message }) {
    return aboutMessage = message;
}
function productAdd(_, { product}) {
    product.id = productsDB.length+1;
    if (product.status == undefined) product.status ='New';
    productsDB.push(product);
    return product;
}

const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
    resolvers,
});

const app = express();
app.use(express.static('public'));
server.applyMiddleware({ app, path: '/graphql' });
app.listen(3001, function () {
    console.log('App started on port 3001');
});