import { VideoConferenceApp } from './VideoConferenceApp.js';

// --- Elementos del DOM y Variables Globales ---
const localVideo = document.getElementById('localVideo');
const muteButton = document.getElementById('muteButton'); 
let isMuted = false; // <-- NUEVO

// --- Inicialización de la Aplicación ---
async function main() {
    try {
        const app = new VideoConferenceApp(localVideo);
        await app.start();
        console.log('Aplicación iniciada con éxito');
        muteButton.addEventListener('click', () => {
            // 1. Obtener el stream local desde el peerManager
            const localStream = app.peerManager.localStream;
            if (!localStream) return;

            // 2. Invertir el estado de silencio
            isMuted = !isMuted;

            // 3. Habilitar o deshabilitar todas las pistas de audio
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });

            // 4. Actualizar el texto del botón
            muteButton.textContent = isMuted ? 'Quitar Silencio 🔈' : 'Silenciar 🔇';
        });

    } catch (error) {
        console.error('Fallo al iniciar la aplicación:', error);
    }
}

main().catch(console.error);