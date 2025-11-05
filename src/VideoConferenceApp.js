/**
 * @file VideoConferenceApp.js
 * Este archivo define la clase principal que orquesta toda la aplicación de videoconferencia.
 * Actúa como el "cerebro" de la aplicación, inicializando y coordinando todos los módulos
 * (WebRTC, WebSocket, UI, etc.) para que funcionen juntos.
 */
import config from './config.js';
import { PeerConnectionManager } from './PeerConnectionManager.js';
import { WebSocketManager } from './WebSocketManager.js';
import { WebRTCManager } from './WebRTCManager.js';
import { UIManager } from './UIManager.js'; // Asegúrate que este import existe

/**
 * Clase principal que orquesta toda la aplicación de videoconferencia.
 * Responsabilidades:
 * - Inicializar todos los managers.
 * - Gestionar el flujo de arranque de la aplicación.
 * - Registrar los manejadores de eventos del WebSocket.
 */
export class VideoConferenceApp {
    /**
     * Construye la aplicación, inicializando todos los gestores necesarios.
     * @param {HTMLVideoElement} localVideoElement - El elemento de video donde se mostrará el stream local.
     */
    constructor(localVideoElement) {
        this.localVideoElement = localVideoElement;
        this.peerManager = new PeerConnectionManager();
        this.wsManager = new WebSocketManager(config.WEBSOCKET_URL);
        this.rtcManager = new WebRTCManager(this.peerManager, UIManager, this.wsManager);
    }

    /**
     * Inicia la aplicación siguiendo una secuencia ordenada:
     * 1. Configura los medios locales (cámara/micrófono).
     * 2. Registra los manejadores de eventos del WebSocket.
     * 3. Se conecta al servidor WebSocket.
     */
    async start() {
        // Acoplar el rtcManager al peerManager para la notificación del stream.
        this.peerManager.setRtcManager(this.rtcManager);

        await this.setupLocalMedia(); // Paso 1: Configurar medios locales (Cámara/Micrófono).
        this.registerWebSocketHandlers(); // Paso 2: Registrar manejadores de eventos del WebSocket.
        this.wsManager.connect(); // Paso 3: Conectar al servidor WebSocket.
    }

    /**
     * Solicita acceso a la cámara y micrófono del usuario y muestra el video en la UI.
     */
    async setupLocalMedia() {
        try {
            const stream = await this.peerManager.setupLocalStream();
            this.localVideoElement.srcObject = stream;
            console.log('Stream local obtenido y listo.');
        } catch (error) {
            console.error('Error al configurar el stream local:', error);
            alert('No se pudo acceder a la cámara y al micrófono. Por favor, verifica los permisos y refresca la página.');
            throw error; // Detener la ejecución si no se puede obtener el stream.
        }
    }

    /**
     * Registra todos los manejadores para los mensajes del WebSocket.
     * Aquí es donde la aplicación reacciona a los eventos de señalización del servidor.
     */
    registerWebSocketHandlers() {
        // Evento: El servidor nos asigna un ID único al conectarnos.
        this.wsManager.onMessage('assign-id', (message) => {
            console.log('Evento recibido: assign-id', message);
            this.rtcManager.setMyUserId(message.userId);
            console.log(`ID de usuario asignado: ${message.userId}`);

            // <-- NUEVO: Añadirnos a la lista de participantes de la UI
            UIManager.addParticipantToList(message.userId, true);
        });

        // Evento: Un nuevo usuario se ha unido a la sala.
        this.wsManager.onMessage('user-joined', (message) => {
            console.log('Procesando evento: user-joined', message);
            
            // <-- NUEVO: Añadir al nuevo usuario a la lista de la UI
            UIManager.addParticipantToList(message.userId);

            this.rtcManager.handleUserJoined(message.userId);
        });

        // Evento: Al entrar, el servidor nos envía una lista de los usuarios que ya estaban en la sala.
        this.wsManager.onMessage('existing-users', (message) => {
            console.log('Procesando evento: existing-users', message);
            message.userIds.forEach(userId => {
                
                // <-- NUEVO: Añadir cada usuario existente a la lista de la UI
                UIManager.addParticipantToList(userId);

                this.rtcManager.handleUserJoined(userId);
            });
        });

        // Evento: Un usuario ha abandonado la sala.
        this.wsManager.onMessage('user-left', (message) => {
            console.log('Procesando evento: user-left', message);

            // <-- NUEVO: Quitar al usuario de la lista de la UI
            UIManager.removeParticipantFromList(message.userId);

            this.rtcManager.handleUserLeft(message.userId);
        });

        // Evento: Recibimos una "oferta" de otro par para iniciar una conexión WebRTC.
        // ... (resto del manejador sin cambios)
        this.wsManager.onMessage('offer', (message) => {
            console.log('Procesando evento: offer (oferta)', message);
            this.rtcManager.handleOffer(message.fromUserId, message.offer);
        });

        // Evento: Recibimos una "respuesta" a una oferta que enviamos previamente.
        // ... (resto del manejador sin cambios)
        this.wsManager.onMessage('answer', (message) => {
            console.log('Procesando evento: answer (respuesta)', message);
            this.rtcManager.handleAnswer(message.fromUserId, message.answer);
        });

        // Evento: Recibimos un "candidato ICE".
        // ... (resto del manejador sin cambios)
        this.wsManager.onMessage('ice-candidate', (message) => {
            console.log('Procesando evento: ice-candidate (candidato ICE)', message);
            this.rtcManager.handleIceCandidate(message.fromUserId, message.candidate);
        });
    }
}