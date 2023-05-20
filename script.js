var inputArchivo = document.getElementById('profileImage');
var labelArchivo = document.getElementById('labelArchivo');
inputArchivo.addEventListener("change", function() {
  let nombreArchivo = this.files[0].name;
  if (this.value !== "") {
    labelArchivo.innerHTML = nombreArchivo;
  } else {
    labelArchivo.innerHTML = 'Selecciona un archivo';
  }
});

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    
    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Puedes mostrar un mensaje de éxito o hacer algo con la respuesta del backend
    })
    .catch(error => {
      console.error(error);
      // Puedes mostrar un mensaje de error o manejar la excepción de alguna otra forma
    });
  } else {
    console.log('No se ha seleccionado ningún archivo');
    // Puedes mostrar un mensaje indicando que no se seleccionó ningún archivo
  }
}

