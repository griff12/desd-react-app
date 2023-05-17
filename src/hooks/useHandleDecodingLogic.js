import { useState, useEffect, useCallback } from 'react';
import convertNumberToWords from '../utils/numToWord';
import { useNavigate } from 'react-router-dom';
import { useSessionStorage } from './useSessionStorage';
import useAssemblyAI from './useAssemblyAI';

export const useHandleDecodingLogic = ({ startCountdown, 
                                            countdownPromise,
                                            setSpeechResultReceived,
                                            setRetryMessage,
                                            isPaused,
                                            setButtonActive  }) => {
    const navigate = useNavigate();
    const [testWords, setTestWords] = useSessionStorage('testWords', '');
    const [wordIndex, setWordIndex] = useSessionStorage('wordIndex', 0);
    const [levelIndex, setLevelIndex] = useSessionStorage('levelIndex', 0);
    const [correct, setCorrect] = useSessionStorage('correct', 0);
    const [wrong, setWrong] = useSessionStorage('wrong', 0);
    const [wrongAboveCurrentLevel, setWrongAboveCurrentLevel] = useSessionStorage('wrongAboveCurrentLevel', 0);
    const [frozenWrongAboveCurrentLevel, setFrozenWrongAboveCurrentLevel] = useSessionStorage('frozenWrongAboveCurrentLevel', false);
    const [isLastWord, setIsLastWord] = useSessionStorage('isLastWord', false);
    const [readingLevel, setReadingLevel] = useSessionStorage('readingLevel', null);
    const [currentLevel, setCurrentLevel] = useState(testWords[levelIndex].level);
    const [words, setWords] = useState(Object.keys(testWords[levelIndex].words));
    const [currentWord, setCurrentWord] = useState(words[wordIndex]);
    const lastLevelIndex = testWords.length - 1;
    const lastWordIndex = Object.keys(testWords[lastLevelIndex].words).length - 1;
    const { startRecording, stopRecording, transcript } = useAssemblyAI();
    let speechResult;

    const nextDecodingWord = async () => {
        setButtonActive(false);
        setSpeechResultReceived(false);
        setRetryMessage('');

        try {
          startCountdown(3);
          // start recording
          startRecording();
          // Wait for the countdownPromise to resolve, then stop recording
          await countdownPromise;
          stopRecording();
          setSpeechResultReceived(true);
          // The transcript result from AssemblyAI will be available as `transcript`
          speechResult = convertNumberToWords(transcript).toLowerCase();
          console.log('Speech result:', speechResult);
        } catch (error) {
          console.error('Speech recognition error:', error);
          return;
        }

        let isCorrect;
        if (currentWord === 'clique') {
            isCorrect = speechResult === 'click' || speechResult === 'clique'
        } else if (currentWord === 'know') {
            isCorrect = speechResult === 'no' || speechResult === 'know'
        } else if (currentWord === 'could') {
            isCorrect = speechResult === 'could' || speechResult === "couldn't"
        } else if (currentWord === 'meadow') {
            isCorrect = speechResult === 'metal' || speechResult === 'meadow'
        } else if (currentWord === 'glisten') {
            isCorrect = speechResult === 'listen' || speechResult === 'glisten'
        } else if (currentWord === 'toughen') {
            isCorrect = speechResult === 'toughen' || speechResult === 'puffin'
        } else if (currentWord === 'islet') {
            isCorrect = speechResult === 'eyelet' || speechResult === 'islet'
        } else if (currentWord === 'leitmotif') {
            isCorrect = speechResult === 'leitmotiv' || speechResult === 'leitmotif'
        } else {
            isCorrect = speechResult === currentWord;
        }
        const updatedCorrect = isCorrect ? correct + 1 : correct;
        const updatedWrong = !isCorrect ? wrong + 1 : wrong;
        const lastWordReached = levelIndex === lastLevelIndex && wordIndex === lastWordIndex;

        setIsLastWord(lastWordReached);
        setCorrect(updatedCorrect);
        setWrong(updatedWrong);
        setWrongAboveCurrentLevel((prevWrongAboveCurrentLevel) => {
            if (!frozenWrongAboveCurrentLevel && !isCorrect) {
            return prevWrongAboveCurrentLevel + 1;
            } else {
            return prevWrongAboveCurrentLevel;
            }
        });
        setWordIndex((prevState) => prevState + 1);
        testWords[levelIndex].words[currentWord] = isCorrect;
    };
  
    useEffect(() => {
        setCurrentLevel(testWords[levelIndex].level);
        setWords((prevWords) => {
        const newWords = Object.keys(testWords[levelIndex].words);
        setCurrentWord(newWords[wordIndex]);
        return newWords;
        });
    }, [levelIndex, wordIndex, testWords]);


    const handleLogic = useCallback(() => {
        if (testWords[levelIndex] && correct >= words.length / 2) {
          setReadingLevel(testWords[levelIndex].level);
          setWrongAboveCurrentLevel(0);
          setFrozenWrongAboveCurrentLevel(true);
        }
    
        if (wrong >= words.length / 2 && wrongAboveCurrentLevel >= words.length && wordIndex >= words.length) {
          setTestWords(testWords);
          setTimeout(() => {
            navigate('/eidetic');
          }, 500);
        }
    
        if (isLastWord) {
            navigate('/completed');
        }
      }, [correct, levelIndex, isLastWord, navigate, wrongAboveCurrentLevel, wordIndex, wrong, words, testWords, setTestWords, setFrozenWrongAboveCurrentLevel, setReadingLevel, setWrongAboveCurrentLevel]);
    
      useEffect(() => {
        handleLogic();
      }, [handleLogic]);
    
      useEffect(() => {
        if (wordIndex >= lastWordIndex + 1) {
          if (levelIndex < testWords.length - 1) {
            setLevelIndex((prevState) => (prevState + 1 ));
            setFrozenWrongAboveCurrentLevel(false);
            setWrongAboveCurrentLevel(0);
          }
          setCorrect(0)
          setWrong(0);
          setWordIndex(0)
        }
      }, [wordIndex, levelIndex, lastWordIndex, testWords, setCorrect, setFrozenWrongAboveCurrentLevel, setLevelIndex, setWordIndex, setWrong, setWrongAboveCurrentLevel]);
    
      useEffect(() => {
        console.log(`current word: ${words[wordIndex]} word index: ${wordIndex}, grade index: ${levelIndex}, 
                    grade level: ${currentLevel}, correct: ${correct}, wrong: ${wrong}, 
                    wrong above grade level: ${wrongAboveCurrentLevel}, reading level: ${readingLevel}
                    is_paused: ${isPaused}`);
      }, [words, wordIndex, levelIndex, currentLevel, correct, wrong, wrongAboveCurrentLevel, readingLevel, isPaused]);

    return [nextDecodingWord, currentWord, isLastWord];
};


