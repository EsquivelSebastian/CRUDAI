const flash = require('express-flash');
const session = require('express-session');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const XLSX = require('xlsx');

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
  const file = req.file;

  if (!file) {
    req.flash('error', 'No se ha proporcionado ningún archivo');
    return res.redirect('/');
  }

  const workbook = XLSX.readFile(file.path);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log(jsonData); // Imprimir los datos del archivo Excel en formato JSON

  const insertQuery = `INSERT INTO empleados (employeeID, legajo_reporta, nombre, apellido, apellido_nombre, direccion, gerencia_area, gerencia, puesto, sucursal, imageName) VALUES ?`;

  const values = jsonData.map((data) => [
    data.employeeID || '',
    data.legajo_reporta || '',
    data.nombre || '',
    data.apellido || '',
    data.apellido_nombre || '',
    data.direccion || '',
    data.gerencia_area || '',
    data.gerencia || '',
    data.puesto || '',
    data.sucursal || '',
    file.originalname || ''
  ]);

  connection.query(insertQuery, [values], (error, result) => {
    if (error) {
      console.error('Error al insertar los datos:', error);
      req.flash('error', 'Error al insertar los datos');
    } else {
      console.log('Datos insertados correctamente');
      req.flash('success', 'Datos insertados correctamente');
    }
    res.redirect('/consult');
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/form.html');
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
