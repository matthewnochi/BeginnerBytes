document.addEventListener('DOMContentLoaded', () => {
    const micButton = document.getElementById('mic-button');
    const canvas = document.getElementById('oscilloscope');
    const ctx = canvas.getContext('2d');
    let isRecording = false; // Tracks whether we are recording
    let mediaStream; // Variable to store the media stream
    let audioContext; // Variable for the audio context
    let source; // Variable for the media stream source
    let analyser; // Analyser node for audio visualization
    let dataArray; // Array to hold audio data for visualization

    micButton.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                source = audioContext.createMediaStreamSource(mediaStream);
                analyser = audioContext.createAnalyser();
                source.connect(analyser);
                analyser.fftSize = 2048; // Set FFT size
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                isRecording = true;
                micButton.classList.add('active'); // Change button style when active
                micButton.querySelector('i').classList.remove('fa-microphone'); // Change to pause icon
                micButton.querySelector('i').classList.add('fa-pause');
                console.log('Recording started');
                drawOscilloscope(); // Start drawing the oscillogram
            } catch (error) {
                console.error('Error accessing microphone:', error);
            }
        } else {
            // Stop the microphone and clear the oscillogram
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop()); // Stop all media tracks
                isRecording = false; // Update recording state
                micButton.classList.remove('active'); // Revert button style
                micButton.querySelector('i').classList.remove('fa-pause'); // Change back to microphone icon
                micButton.querySelector('i').classList.add('fa-microphone');
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                console.log('Recording stopped');
            }
        }
    });

    function drawOscilloscope() {
        if (!isRecording) return;

        // Clear the canvas with white background
        ctx.fillStyle = '#fff'; // Set background to white
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with white

        analyser.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.747)'; // Change the line color to red
        ctx.beginPath();

        const sliceWidth = canvas.width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128; // Normalize the data
            const y = (v * canvas.height) / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        requestAnimationFrame(drawOscilloscope); // Continue drawing
    }
});