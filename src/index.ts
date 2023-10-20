import express from 'express';
const app = express();
const port = 3001;


app.get('/', (req, res) => {
  res.send('Hello World!');
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

