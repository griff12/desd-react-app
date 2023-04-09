import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCorrectWords } from '../../utils/getWords';
import { useNavigate } from 'react-router-dom';
import "./Phonetic.css";

const Encoding = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const desdWords = location.state.desdWords;
    const gradeIndex = location.state.gradeIndex;
    console.log(desdWords);
    const { correctWords, lessThanFiveWordsCorrect } = getCorrectWords(
    gradeIndex,
    desdWords
    );
    const audioPaths = correctWords.map((word) => require(`../../assets/audio/${word}.mp3`));
    const [userInputs, setUserInputs] = useState(Array(audioPaths.length).fill(''));
    const [incompleteSubmit, setIncompleteSubmit] = useState(false);
    const [numCorrect, setNumCorrect] = useState(0);


    useEffect(() => {
        console.log(audioPaths);
    }, [audioPaths]);

  const handleSubmit = () => {
    let correct = 0;
    const incorrectWords = [];
    userInputs.some((input) => input === '') ? setIncompleteSubmit(true) : setIncompleteSubmit(false);
  
    for (let i = 0; i < audioPaths.length; i++) {
      if (userInputs[i] !== correctWords[i]) {
        incorrectWords.push(correctWords[i]);
        correct++
      } 
    }
    setNumCorrect(correct);

    if (!userInputs.some((input) => input === '')) {
        setTimeout(() => {
            navigate('/results', { state: { 
                desdWords: desdWords, 
                gradeIndex: gradeIndex, 
                readingLevel: location.state.readingLevel,
                eideticCorrect: numCorrect
            } });
          }, 500);
    } else {
        setIncompleteSubmit(true);
        setTimeout (() => {
            setIncompleteSubmit(false);
        }, 3000);
    }
  };

  return (
    <div className='encoding-container'>
      <div>
        {lessThanFiveWordsCorrect && gradeIndex !== 0 ? (
          <div>
            <p>
              You got fewer than 5 words correct, so you are reading at a
              Kindergarten level.
            </p>
            <p>
              You did not get enough words correct to proceed with the encoding
              portion of the test.
            </p>
          </div>
        ) : (
          <div>
            {audioPaths.map((audioPath, index) => (
              <React.Fragment key={index}>
                <div>
                  <audio src={audioPath} controls />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Enter spelling" 
                    value={userInputs[index]} 
                    onChange={(e) => {
                      const newInputs = [...userInputs];
                      newInputs[index] = e.target.value;
                      setUserInputs(newInputs);
                    }}
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      <div className='button-container'>
          {incompleteSubmit && <p>Please answer all items.</p>}
        <button
            // disabled={userInputs.some((input) => input === '')}
            onClick={handleSubmit}
          >
            Submit
        </button>
      </div>
    </div>
  );  
  
}

export default Encoding;