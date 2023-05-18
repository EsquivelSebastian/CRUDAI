const flash = require('express-flash');
const session = require('express-session');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');

// Establecer conexión con la base de datos MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'basetest'
};

// Creación de la conexión a la base de datos
const connection = mysql.createConnection(dbConfig);

// Conexión a la base de datos
connection.connect((error) => {
  if (error) {
    console.error('Error de conexión a la base de datos:', error);
  } else {
    console.log('Conexión a la base de datos exitosa');
  }
});

// Creación del servidor Express
const app = express();

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Middleware para procesar los datos del formulario
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

// Consultar registros de la tabla "empleados"
app.get('/consult', (req, res) => {
  connection.query('SELECT * FROM empleados', (error, results) => {
    if (error) {
      throw error;
    }
    res.render('consult', { empleados: results });
  });
});

// Configuración de Multer para gestionar la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directorio donde se guardarán las imágenes cargadas
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Se utiliza el nombre original del archivo
  }
});

const upload = multer({ storage: storage });

// Ruta para la carga de la imagen
app.post('/crear-entrada', upload.single('profileImage'), (req, res) => {
  const { employeeID, legajo_reporta, nombre, apellido, apellido_nombre, direccion, gerencia_area, gerencia, puesto, sucursal } = req.body;

  // Obtenemos el nombre de la imagen cargada desde req.file.filename
  const imageName = req.file.filename;

  const query = `INSERT INTO empleados (employeeID, legajo_reporta, nombre, apellido, apellido_nombre, direccion, gerencia_area, gerencia, puesto, sucursal, imageName) 
    VALUES ('${employeeID}', '${legajo_reporta}', '${nombre}', '${apellido}', '${apellido_nombre}', 
    '${direccion}', '${gerencia_area}', '${gerencia}', '${puesto}', '${sucursal}', '${imageName}')`;

  connection.query(query, (error, result) => {
    if (error) {
      console.error('Error al insertar los datos:', error);
      res.redirect('/');
    } else {
      console.log('Datos insertados correctamente');
      res.redirect('/consult');
    }
  });
});

// Ruta para el formulario
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/form.html');
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
