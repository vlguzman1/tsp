//import express
const express = require('express');

const app = express();

const IMGSURL="http://65.111.165.243/tareas/pgctsp/files";

var mysql = require('mysql');

var db = mysql.createConnection({
  host: "localhost",
  user: "pgctsp",
  password: "qMJnt3o7c",
  database: "pgctsp"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

// Rutas que manejan los requests:
app.get("/categories", (req, res, next) => {
  var sql="SELECT *,CONCAT('" + IMGSURL + "/categorias/imagen/',id,'.',SUBSTRING_INDEX(mmdd_imagen_filename,'.',-1)) as imgurl FROM categorias";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.json(data);
  });
});

app.get("/categories/:idCat", (req, res, next) => {
  var sql="SELECT *,CONCAT('" + IMGSURL + "/productos/imagen/',id,'.',SUBSTRING_INDEX(mmdd_imagen_filename,'.',-1)) as imgurl ";
  sql+=" FROM productos";
  sql+=" WHERE id_categoria=?";
  sql+=" ORDER BY id_categoria, nombre";
  var values=req.params.idCat;
  db.query(sql, values,function (err, data, fields) {
    if (err) throw err;
    res.json(data);
  });
});

app.get('/products/search/:searchTerm', function (req, res) {
  var sql="SELECT *,CONCAT('" + IMGSURL + "/productos/imagen/',id,'.',SUBSTRING_INDEX(mmdd_imagen_filename,'.',-1)) as imgurl ";
  sql+=" FROM productos";
  sql+=" WHERE nombre LIKE ?";
  sql+=" ORDER BY id_categoria, nombre";
  var values="%" + req.params.searchTerm + "%";
  db.query(sql, values,function (err, data, fields) {
    if (err) throw err;
    res.json(data);
  });
});

app.get('/products/:id', function (req, res) {
  var sql="SELECT *,CONCAT('" + IMGSURL + "/productos/imagen/',id,'.',SUBSTRING_INDEX(mmdd_imagen_filename,'.',-1)) as imgurl ";
  sql+=" FROM productos";
  sql+=" WHERE id=?";
  var values=req.params.id;
  db.query(sql, values,function (err, data, fields) {
    if (err) throw err;
    res.json(data);
  });
});

app.use('/files', express.static(__dirname + '/files'));
app.use('/', express.static(__dirname + '/public'));

module.exports = app;
