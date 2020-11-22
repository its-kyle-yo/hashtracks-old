import dotenv from 'dotenv';

dotenv.config();

export default {
  node: {
    env: process.env.NODE_ENV
  },
  firebaseConf: {
    dev: {
      apiKey: "AIzaSyDXGBfJe83DVFSLYeA7bHxH5kgy427wt3M",
      authDomain: "the-yearbook-dev-7982f.firebaseapp.com",
      databaseURL: "https://the-yearbook-dev-7982f.firebaseio.com",
      projectId: "the-yearbook-dev-7982f",
      storageBucket: "the-yearbook-dev-7982f.appspot.com",
      messagingSenderId: "717657270183",
      appId: "1:717657270183:web:ac5cbc6a30267cad59b882"
    },
    prod: {
      apiKey: "AIzaSyDXGBfJe83DVFSLYeA7bHxH5kgy427wt3M",
      authDomain: "the-yearbook-dev-7982f.firebaseapp.com",
      databaseURL: "https://the-yearbook-dev-7982f.firebaseio.com",
      projectId: "the-yearbook-dev-7982f",
      storageBucket: "the-yearbook-dev-7982f.appspot.com",
      messagingSenderId: "717657270183",
      appId: "1:717657270183:web:ac5cbc6a30267cad59b882"
    }
  }
};
