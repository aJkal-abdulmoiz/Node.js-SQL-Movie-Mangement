const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

// const dbConfig = {
//   host: 'localhost',
//   user: 'mgs_user',
//   password: '',
//   database: 'MSU_Movies'
// };

// const pool = mysql.createPool(dbConfig);

// function executeQuery(sql, values, callback) {
//   pool.getConnection((err, connection) => {
//     if (err) {
//       console.error('Error getting MySQL connection:', err);
//       callback(err, null);
//       return;
//     }

//     connection.query(sql, values, (err, results) => {
//       connection.release();
//       callback(err, results);
//     });
//   });
// }

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let filePath = '';

  // Serve static files
  if (parsedUrl.pathname === '/') {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else if (parsedUrl.pathname === '/movies') {
    filePath = path.join(__dirname, 'public', 'movies.html');
  } else if (parsedUrl.pathname === '/insert') {
    filePath = path.join(__dirname, 'public', 'insert.html');
  } else if (parsedUrl.pathname === '/update') {
    filePath = path.join(__dirname, 'public', 'update.html');
  } else if (parsedUrl.pathname === '/delete') {
    filePath = path.join(__dirname, 'public', 'delete.html');
  } else if (parsedUrl.pathname === '/about') {
    filePath = path.join(__dirname, 'public', 'about.html');
  } else if (parsedUrl.pathname === '/contact') {
    filePath = path.join(__dirname, 'public', 'contact.html');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  if (parsedUrl.pathname === '/movies' && req.method === 'GET') {
    // Handle GET request for fetching all movies
    executeQuery('SELECT * FROM Movie', [], (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    });
  }
  
  else if (parsedUrl.pathname === '/insert' && req.method === 'POST') {
    // Handle POST request for inserting a new movie
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { MovieTitle, ReleaseDate, Genre } = JSON.parse(body);
      executeQuery('INSERT INTO Movie (MovieTitle, ReleaseDate, Genre) VALUES (?, ?, ?)', [MovieTitle, ReleaseDate, Genre], (err) => {
        if (err) {
          console.error('Error executing MySQL query:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(302, { 'Location': '/movies' });
        res.end();
      });
    });
  } 
  
  //UPDATE
  else if (parsedUrl.pathname === '/update' && req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { MovieID, Genre } = JSON.parse(body);
      executeQuery('UPDATE Movie SET Genre = ? WHERE MovieID = ?', [Genre, MovieID], (err) => {
        if (err) {
          console.error('Error executing MySQL query:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(302, { 'Location': '/movies' });
        res.end();
      });
    });

  } 
   //DELETE
  else if (parsedUrl.pathname === '/delete' && req.method === 'POST') {

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { MovieID } = JSON.parse(body);
      executeQuery('DELETE FROM Movie WHERE MovieID = ?', [MovieID], (err) => {
        if (err) {
          console.error('Error executing MySQL query:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(302, { 'Location': '/movies' });
        res.end();
      });
    });
  } else {
    // Return the HTML file for other URLs
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error reading HTML file:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
});



// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
