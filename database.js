const flash = require('express-flash');
const session = require('express-session');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');

const app = express();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'basetest'
};

const connection = mysql.createConnection(dbConfig);

connection.connect((error) => {
  if (error) {
    console.error('Error de conexión a la base de datos:', error);
  } else {
    console.log('Conexión a la base de datos exitosa');
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: 'kakawate',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.get('/consult', (req, res) => {
  connection.query('SELECT * FROM empleados', (error, results) => {
    if (error) {
      throw error;
    }
    res.render('consult', { empleados: results });
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directorio donde se guardarán las imágenes cargadas
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Se utiliza el nombre original del archivo
  }
});

const upload = multer({ storage: storage });

app.post('/crear-entrada', upload.single('profileImage'), (req, res) => {
  // Resto del código para la carga y procesamiento de archivos
  // ...

  res.redirect('/consult');
});

app.get('/', (req, res) => {
  res.render('form');
});

app.get('/editar-empleado', (req, res) => {
  const empleadoId = req.query.id;

  // Obtener los detalles del empleado con el ID proporcionado
  connection.query('SELECT * FROM empleados WHERE id = ?', [empleadoId], (error, results) => {
    if (error) {
      console.error('Error al obtener los detalles del empleado:', error);
      req.flash('error', 'Error al obtener los detalles del empleado');
      return res.redirect('/consult');
    }

    const empleado = results[0];
    res.render('editar-empleado', { empleado: results });
  });
});

app.put('/editar-empleado/:id', (req, res) => {
  const id = req.params.id;
  const { nombre, apellido, direccion, gerencia } = req.body;

  const updateQuery = 'UPDATE empleados SET nombre = ?, apellido = ?, direccion = ?, gerencia = ? WHERE id = ?';
  const values = [nombre, apellido, direccion, gerencia, id];

  connection.query(updateQuery, values, (error, result) => {
    if (error) {
      console.error('Error al actualizar el registro:', error);
      req.flash('error', 'Error al actualizar el registro');
    } else {
      console.log('Registro actualizado correctamente');
      req.flash('success', 'Registro actualizado correctamente');
    }
    res.render('editar-empleado', { empleado: result });
  });
});

app.delete('/eliminar/:id', (req, res) => {
  const id = req.params.id;

  connection.query('DELETE FROM empleados WHERE id = ?', [id], (error, result) => {
    if (error) {
      console.error('Error al eliminar el registro:', error);
      req.flash('error', 'Error al eliminar el registro');
    } else {
      console.log('Registro eliminado correctamente');
      req.flash('success', 'Registro eliminado correctamente');
    }
    res.render('consult', { empleados: result });
  });
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
