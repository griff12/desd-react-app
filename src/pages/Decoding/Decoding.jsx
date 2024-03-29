import React, { useState, useEffect } from 'react';
import { useRequestMicPermission } from '../../hooks/useRequestMicPermission';
import { useHandleDecodingLogic } from '../../hooks/useHandleDecodingLogic';
import AudioVisualizer from '../../components/AudioVisualizer';
import { useCountdown } from '../../hooks/useCountdown';
import ProgressBar from '../../components/ProgressBar';
import './Decoding.css';

const Decoding = () => {
  const [count, startCountdown, countdownPromise] = useCountdown();
  const [hasMicPermission, requestMicPermission] = useRequestMicPermission();
  const [isStarted, setIsStarted] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');
  const [speechResultReceived, setSpeechResultReceived] = useState(false);
  const [nextDecodingWord, currentWord, isLastWord, progress] = useHandleDecodingLogic({ startCountdown, countdownPromise, setSpeechResultReceived, setRetryMessage, isPaused, setButtonActive });

  useEffect(() => {
    requestMicPermission();
  }, [requestMicPermission]);

  useEffect(() => {
    if (!isStarted || count > 0) return 
      
    if (!speechResultReceived) {
      setIsPaused(true);
      setTimeout(() => {
        setIsPaused(false);
      }, 1000);
    }
    if (speechResultReceived) {
      setButtonActive(true);
      setRetryMessage(''); 
    }
    else {
    setRetryMessage("We didn't quite catch that. Please try again.");
    setButtonActive(true);
    } 
  }, [isStarted, speechResultReceived, count]);

  useEffect(() => {
    if (speechResultReceived) {
      setButtonActive(true);   
    }
  }, [speechResultReceived]);

  const startDecoding = async () => {
    if (!hasMicPermission) {
      await requestMicPermission();
    }

    if (hasMicPermission) {
      setIsStarted(true);
      nextDecodingWord();
    }
  };

  return (
    <div className="centered-content">
      <div className='decoding-page'>
        <div className="decoding-content">
          {!isPaused && isStarted && !isLastWord && buttonActive ? (
                  <div className="button-container">
                    <div>
                      {retryMessage && <p>{retryMessage}</p>}
                      <button onClick={nextDecodingWord}>{retryMessage ? 'Try Again' : 'Next Word'}</button>
                    </div>
                  </div>
                ) : null }
          {!isStarted && (
                <div className="button-container">
                  <div>
                  <button onClick={startDecoding}>Start</button>
                  </div>
                </div>
              )}
          {!buttonActive && isStarted && (
                <>
                  <p className='custom-p'>Say this word: </p>
                  <h2 className='custom-h2'>{currentWord}</h2>
                  <AudioVisualizer isActive={(true)} countdownValue={count} size="300"/>
                </>
              )}
        </div>
        <ProgressBar progress={progress} />
      </div>
    </div>
  );
};

export default Decoding;
