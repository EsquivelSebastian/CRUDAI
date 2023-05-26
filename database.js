const flash = require('express-flash');
const session = require('express-session');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const methodOverride = require('method-override');

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

app.use(methodOverride('_method'));
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

  const { employeeID, legajo_reporta, nombre, apellido, apellido_nombre, direccion, gerencia_area, gerencia, puesto, sucursal } = req.body;
  const insertQuery = 'INSERT INTO empleados (employeeID, legajo_reporta, nombre, apellido, apellido_nombre, direccion, gerencia_area, gerencia, puesto, sucursal, imageName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [employeeID, legajo_reporta, nombre, apellido, apellido_nombre, direccion, gerencia_area, gerencia, puesto, sucursal, req.file.filename];
  
  connection.query(insertQuery, values, (error, result) => {
    if (error) {
      console.error('Error al crear un nuevo registro:', error);
      req.flash('error', 'Error al crear un nuevo registro');
    } else {
      console.log('Nuevo registro creado correctamente');
      req.flash('success', 'Nuevo registro creado correctamente');
    }
    res.redirect('/consult');
  });
});

app.get('/', (req, res) => {
  res.render('form');
});

app.get('/editar-empleado', (req, res) => {
  const id = req.query.id; // Obtén el ID del empleado de la URL

  // Realiza una consulta a la base de datos para obtener los datos del empleado
  connection.query('SELECT * FROM empleados WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error al obtener los datos del empleado'); // Maneja errores en la consulta a la base de datos
    } else if (results.length === 0) {
      res.status(404).send('Empleado no encontrado'); // Maneja el caso cuando el empleado no existe
    } else {
      const empleado = results[0];
      res.render('editar-empleado', { empleado }); // Renderiza la vista con los datos del empleado
    }
  });
});

app.post('/editar-empleado/:id', (req, res) => {
  const id = req.params.id;
  const { employeeID, legajo_reporta, nombre, apellido, apellido_nombre, direccion, gerencia_area, gerencia, puesto, sucursal } = req.body;

  const updateQuery = 'UPDATE empleados SET employeeID = ?, legajo_reporta = ?, nombre = ?, apellido = ?, apellido_nombre = ?, direccion = ?, gerencia_area = ?, gerencia = ?, puesto = ?, sucursal = ? WHERE id = ?';
  const values = [employeeID, legajo_reporta, nombre, apellido, apellido_nombre, direccion, gerencia_area, gerencia, puesto, sucursal, id];

  connection.query(updateQuery, values, (error, result) => {
    if (error) {
      console.error('Error al actualizar el registro:', error);
      req.flash('error', 'Error al actualizar el registro');
    } else {
      console.log('Registro actualizado correctamente');
      req.flash('success', 'Registro actualizado correctamente');
    }
    res.redirect('/consult',);
  });
});


app.delete('/eliminar/:id', (req, res) => {
  const id = req.params.id;

  connection.query('DELETE FROM empleados WHERE id = ?', [id], (error, result) => {
    if (error) {
      console.error('Error al eliminar el registro:', error);
      req.flash('error', 'Error al eliminar el registro');
      res.sendStatus(500); // Envía un código de estado 500 (Error interno del servidor) en caso de error
    } else {
      console.log('Registro eliminado correctamente');
      req.flash('success', 'Registro eliminado correctamente');

      // Renderiza nuevamente la vista 'consult' después de eliminar el registro
      connection.query('SELECT * FROM empleados', (error, results) => {
        if (error) {
          throw error;
        }
        res.render('consult', { empleados: results });
      });
    }
  });
});


app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
