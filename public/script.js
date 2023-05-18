function previewFile() {
  const preview = document.getElementById('previewImage');
  const file = document.getElementById('profileImage').files[0];
  const reader = new FileReader();

  reader.onloadend = function () {
    preview.src = reader.result;
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
}

function previewFile() {
  var preview = document.getElementById('previewImage');
  var file = document.getElementById('profileImage').files[0];
  var label = document.getElementById('noFileLabel');

  if (file) {
    var reader = new FileReader();
    reader.onloadend = function() {
      preview.src = reader.result;
      label.classList.add('hidden');
    }
    reader.readAsDataURL(file);
  } else {
    preview.src = '/a.jpg';
    label.classList.remove('hidden');
  }
}
