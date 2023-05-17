import { useEffect, useRef, useState } from 'react';
import WebSocket from 'isomorphic-ws';

const useAssemblyAI = () => {
    const ws = useRef(null);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const newMediaRecorder = new MediaRecorder(stream);
            setMediaRecorder(newMediaRecorder);
            newMediaRecorder.start();

            newMediaRecorder.addEventListener('dataavailable', event => {
                setAudioChunks((prevAudioChunks) => [...prevAudioChunks, event.data]);
            });

            newMediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                // Pass audioBlob to the startTranscription function
                startTranscription(audioBlob);
            });
        });
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setMediaRecorder(null);
        }
    };

    useEffect(() => {
        // Replace with a call to your backend service to get the temporary token
        fetch('https://cors-anywhere.herokuapp.com/https://api.assemblyai.com/v2/realtime/token', {
            method: 'POST', // or 'POST'
            headers: {
              'Content-Type': 'application/json',
              'authorization': process.env.REACT_APP_ASSEMBLY_AI_API_KEY
            },
            body: JSON.stringify({"expires_in": 600}), // data can be `string` or {object}!
          })
            .then(response => response.json())
            .then(data => {
                const token = data.token;
                ws.current = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);

                ws.current.onopen = () => {
                    console.log('WebSocket connection opened');
                };
        
                ws.current.onmessage = (event) => {
                    // Handle incoming messages
                    const message = JSON.parse(event.data);
                    if (message.message_type === 'PartialTranscript') {
                        setTranscript(message.text);
                    } else if (message.message_type === 'FinalTranscript') {
                        setTranscript(message.text);
                    }
                };
        
                ws.current.onerror = (event) => {
                    console.log('WebSocket error', event);
                    setError(event.message);
                };
        
                ws.current.onclose = () => {
                    console.log('WebSocket closed');
                };
            });
        
        return () => {
            // Close the WebSocket connection when the component unmounts
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);
    
    const startTranscription = (audioData) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            console.error('WebSocket connection not open');
            return;
        }
    
        // Send audio data over the WebSocket connection
        sendAudio(audioData);
    };    

    const stopTranscription = () => {
        if (!ws.current) {
            console.error('WebSocket connection not available');
            return;
        }

        // Send a message to terminate the session
        const payload = { terminate_session: true };
        ws.current.send(JSON.stringify(payload));
        ws.current.close();
    };

    const sendAudio = (audioData) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            console.error('WebSocket connection not open');
            return;
        }

        const payload = {
            audio_data: Buffer.from(audioData).toString('base64'),
        };
        ws.current.send(JSON.stringify(payload));
    };

    return { startTranscription, stopTranscription, startRecording, stopRecording, transcript, error };
};

export default useAssemblyAI
