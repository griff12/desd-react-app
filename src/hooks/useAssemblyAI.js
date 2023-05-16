import { useEffect, useRef, useState } from 'react';
import WebSocket from 'isomorphic-ws';

const useAssemblyAI = () => {
  const ws = useRef(null);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Establish a WebSocket connection
    ws.current = new WebSocket('wss://api.assemblyai.com/v2/realtime/ws', {
      headers: {
        Authorization: '<your-assemblyai-api-key>',
      },
    });

    // Handle incoming messages
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.message_type === 'SessionBegins') {
        console.log(`Session ID: ${message.session_id}`);
        console.log(`Expires at: ${message.expires_at}`);
      } else if (message.message_type === 'PartialTranscript') {
        console.log(`Partial transcript received: ${message.text}`);
        setTranscript(message.text);
      } else if (message.message_type === 'FinalTranscript') {
        console.log(`Final transcript received: ${message.text}`);
        setTranscript(message.text);
      }
    };

    // Handle WebSocket errors
    ws.current.onerror = (event) => {
      console.log('WebSocket error', event);
      setError(event.message);
    };

    // Handle WebSocket close events
    ws.current.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const startTranscription = (sampleRate, audioData) => {
    if (!ws.current) {
      console.error('WebSocket connection not available');
      return;
    }

    // After opening the WebSocket connection, send an authentication header with your API token
    ws.current.onopen = () => {
      ws.current.send(
        `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${sampleRate}`
      );
      // Send audio data over the WebSocket connection
      sendAudio(ws.current, audioData);
    };
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

  const sendAudio = (ws, audioData) => {
    const payload = {
      audio_data: Buffer.from(audioData).toString('base64'),
    };
    ws.send(JSON.stringify(payload));
  };

  return { startTranscription, stopTranscription, transcript, error };
};

export default useAssemblyAI
