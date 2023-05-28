import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const useSpeech = () => {
  const { transcript, listening } = useSpeechRecognition();

  const startRecording = () => {
    if (!listening) {
      SpeechRecognition.startListening();
    }
  };

  const stopRecording = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    }
  };

  return { startRecording, stopRecording, transcript };
};

export default useSpeech;