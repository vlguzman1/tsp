//import express
const express = require('express');
var cors = require('cors');
const app = express();

const IMGSURL="http://65.111.165.243/tareas/pgctsp/files";

/*
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Cache-Control,Pragma');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});*/
app.use(cors());
app.use(express.json({type: '*/*'}));

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
app.post("/cart", express.json({type: '*/*'}), (req, res, next) => {
  console.log(req.body);
  sql="INSERT INTO pedidos (fecha,id_usuario,direccion)";
  sql+=" VALUES(now(),?,?)";
  console.log(sql);
  values=[req.body.userId,req.body.direccion];
  db.query(sql, values,function (err, data, fields) {
    if (err) throw err;
    console.log(data);
    var id_pedido=data.insertId;
    for(i=0;i<req.body.cart.length;i++){
      sql="INSERT INTO pedidos_productos (id_pedido,id_producto,cantidad)";
      sql+=" VALUES(?,?,?)";
      console.log(sql);
      values=[id_pedido,req.body.cart[i].id,req.body.cart[i].cant];
      db.query(sql, values,function (err, data, fields) {
        if (err) throw err;
        console.log(data);
      });
    }
    respuesta={id:id_pedido};
    res.json(respuesta);
  });

  //res.json({id:6654654});
});

app.post("/register", express.json({type: '*/*'}), (req, res, next) => {

  console.log(req.body);

  var sql="SELECT *";
  sql+=" FROM usuarios";
  sql+=" WHERE email=?";
  var values=req.body.email;
  db.query(sql, values,function (err, data, fields) {
    if (err) throw err;
    console.log(data);
    if(data.length==0){//No existe, hay que crearlo.
      console.log("No existe...");
      sql="INSERT INTO usuarios (nombre,apellido,email,password)";
      sql+=" VALUES(?,?,?,?)";
      console.log(sql);
      values=[req.body.nombre,req.body.apellido,req.body.email,req.body.password];
      db.query(sql, values,function (err, data, fields) {
        if (err) throw err;
        console.log(data);
        respuesta={ok:'ok',id:data.insertId};
        res.json(respuesta);
      });
    } else{
      respuesta={error:'Usuario ya existe'};
      res.json(respuesta);
    }

  });

});

app.post("/login", express.json({type: '*/*'}), (req, res, next) => {

  console.log(req.body);

  var sql="SELECT *";
  sql+=" FROM usuarios";
  sql+=" WHERE email=? AND password=?";
  var values=[req.body.email,req.body.password];
  db.query(sql, values,function (err, data, fields) {
    if (err) throw err;

    console.log(data);
    if(data.length==0){//No existe
      respuesta={error:'Usuario no existe'};
      res.json(respuesta);
    } else{
      res.json(data);
    }
  });
});

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

app.get("/cart/:ids", (req, res, next) => {
  var sql="SELECT *,CONCAT('" + IMGSURL + "/productos/imagen/',id,'.',SUBSTRING_INDEX(mmdd_imagen_filename,'.',-1)) as imgurl ";
  sql+=" FROM productos";
  sql+=" WHERE id IN(" + req.params.ids + ")";
  sql+=" ORDER BY id_categoria, nombre";
  db.query(sql, function (err, data, fields) {
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
