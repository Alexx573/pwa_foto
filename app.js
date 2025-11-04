// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); // Contexto 2D para dibujar en el Canvas

// --- NUEVAS REFERENCIAS ---
const switchCameraBtn = document.getElementById('switchCameraBtn');
const photoGallery = document.getElementById('photoGallery');
const clearPhotosBtn = document.getElementById('clearPhotosBtn');

let stream = null; // Variable para almacenar el MediaStream de la cámara
let currentFacingMode = 'environment'; // 'environment' (trasera), 'user' (frontal)

async function openCamera() {
    // Si ya hay un stream, cerrarlo antes de abrir uno nuevo (para cambiar cámara)
    if (stream) {
        closeCamera();
    }

    try {
        // 1. Definición de Restricciones (Constraints)
        // Usamos la variable 'currentFacingMode'
        // Eliminamos width/height fijos para que el navegador elija la mejor resolución
        const constraints = {
            video: {
                facingMode: { ideal: currentFacingMode }
            }
        };

        // 2. Obtener el Stream de Medios
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // 3. Asignar el Stream al Elemento <video>
        video.srcObject = stream;
        video.play(); // ¡Importante! Inicia la reproducción del video
        
        // Esperar a que los metadatos del video (como las dimensiones) se carguen
        video.onloadedmetadata = () => {
            console.log(`Stream iniciado: ${video.videoWidth}x${video.videoHeight}`);
        };

        // 4. Actualización de la UI
        cameraContainer.style.display = 'block';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        
        console.log('Cámara abierta exitosamente');
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        // Reemplazamos alert por console.error para una mejor experiencia
        console.error('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
        // Restaurar UI si falla
        closeCamera(); 
    }
}

function takePhoto() {
    if (!stream) {
        console.error('Primero debes abrir la cámara');
        return;
    }

    // --- SOLUCIÓN A FOTOS "APLASTADAS" ---
    // 1. Ajustar el tamaño del canvas a la resolución REAL del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 2. Dibujar el Frame de Video en el Canvas (ahora con la proporción correcta)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 3. Conversión a Data URL
    const imageDataURL = canvas.toDataURL('image/png');
    
    // 4. (Opcional) Visualización y Depuración
    console.log('Foto capturada en base64:', imageDataURL.length, 'caracteres');
    
    // --- LÓGICA DE LA GALERÍA ---
    // 5. Crear la imagen para la galería
    const img = document.createElement('img');
    img.src = imageDataURL;
    img.alt = 'Foto capturada';
    
    // 6. Añadir la imagen al contenedor de la galería
    // 'prepend' la añade al principio (más nueva primero), 'appendChild' la añade al final
    photoGallery.prepend(img);

    // 7. NO cerramos la cámara. El usuario puede tomar más fotos.
    // closeCamera(); // <- Esta línea se elimina
}

function closeCamera() {
    if (stream) {
        // Detener todos los tracks del stream (video, audio, etc.)
        stream.getTracks().forEach(track => track.stop());
        stream = null; // Limpiar la referencia
    }

    // Limpiar y ocultar UI
    video.srcObject = null;
    cameraContainer.style.display = 'none';
    
    // Restaurar el botón 'Abrir Cámara'
    openCameraBtn.textContent = 'Abrir Cámara';
    openCameraBtn.disabled = false;
    
    console.log('Cámara cerrada');
}

// Event listeners para la interacción del usuario
openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);

// --- NUEVOS EVENT LISTENERS ---

// Listener para cambiar la cámara
switchCameraBtn.addEventListener('click', () => {
    // Cambiar el modo
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    console.log('Cambiando cámara a:', currentFacingMode);
    // Volver a abrir la cámara (la función openCamera se encarga de cerrar la anterior)
    openCamera();
});

// Listener para limpiar la galería
clearPhotosBtn.addEventListener('click', () => {
    photoGallery.innerHTML = ''; // Elimina todo el contenido de la galería
    console.log('Galería limpiada');
});

// Limpiar stream cuando el usuario cierra o navega fuera de la página
window.addEventListener('beforeunload', () => {
    closeCamera();
});