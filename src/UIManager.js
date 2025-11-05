const videoGrid = document.getElementById('videoGrid');
const participantList = document.getElementById('participantList'); 

/**
 * Gestiona la creación y eliminación de elementos de video y UI.
 */
export const UIManager = {
    createVideoElement: (userId) => {
        // ... (Tu código existente, sin cambios)
        const videoElement = document.createElement('video');
        videoElement.id = `video-${userId}`;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.style.backgroundColor = 'black';
        videoGrid.appendChild(videoElement);
        return videoElement;
    },
    removeVideoElement: (userId) => {
        // ... (Tu código existente, sin cambios)
        const videoElement = document.getElementById(`video-${userId}`);
        if (videoElement) {
            videoElement.remove();
        }
    },

    // --- FUNCIONES NUEVAS ---
    /**
     * Añade un usuario a la lista de participantes en la UI.
     * @param {string} userId - El ID del usuario.
     * @param {boolean} [isLocal=false] - Si es true, se marca como "(Tú)".
     */
    addParticipantToList: (userId, isLocal = false) => {
        const li = document.createElement('li');
        li.id = `participant-${userId}`;
        // Acortar el ID para mostrarlo
        const shortId = userId.substring(0, 8);
        li.textContent = isLocal ? `Tú (${shortId}...)` : `Usuario (${shortId}...)`;
        participantList.appendChild(li);
    },

    /**
     * Elimina un usuario de la lista de participantes en la UI.
     * @param {string} userId - El ID del usuario.
     */
    removeParticipantFromList: (userId) => {
        const li = document.getElementById(`participant-${userId}`);
        if (li) {
            li.remove();
        }
    }
};