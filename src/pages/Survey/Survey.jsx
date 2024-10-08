import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Survey.css';
import { createClient } from '@supabase/supabase-js';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { getSkillValue } from "../../utils/scoring";

function Survey() {
  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
  const SUPABASE_API_KEY = process.env.REACT_APP_SUPABASE_API_KEY;
  const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [eideticCorrect] = useSessionStorage('eideticCorrect', '');
  const [phoneticCorrect] = useSessionStorage('phoneticCorrect', '');
  const [readingLevel] = useSessionStorage('readingLevel', '');
  const [testName] = useSessionStorage('testName', '');
  const [testWords] = useSessionStorage('testWords', '');
  const [eideticResults] = useSessionStorage('eideticResults', '');
  const [phoneticResults] = useSessionStorage('phoneticResults', '');
  const emailInputRef = useRef(null);
  const [eideticSkillValue, setEideticSkillValue] = useState(null);
  const [phoneticSkillValue, setPhoneticSkillValue] = useState(null);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const questions = useMemo(() => [
    {
      id: 'q1',
      question: "Hello, what's your name?",
      type: 'text',
    },
    {
      id: 'q2',
      question: () => `Nice to meet you, ${answers['q1'] || ''}, where can we send your results/get in touch?`,
      type: 'email',
    },
    {
      id: 'q3',
      question: 'What is the highest level of education that you have reached?',
      type: 'select',
      options: [
        'Select a level of education', 
        'Kindergarten',
        '1st grade',
        '2nd grade',
        '3rd grade',
        '4th grade',
        '5th grade',
        '6th grade',
        '7th grade or 8th grade',
        'High School',
        'College',
        'Graduate School',
        'Doctorate',
        'Post-Doctorate'
      ],
    },
    {
      id: 'q4',
      question: "Have you ever been diagnosed with a learning disability?",
      type: 'yesNo',
    },
    {
      id: 'q5',
      question: "When was your last eye examination?",
      type: 'dateOrNever',
    },
  ], [answers]);

  useEffect(() => {
    if (emailInputRef.current && activeQuestion === questions.findIndex(q => q.type === 'email')) {
      emailInputRef.current.focus();
    }
  }, [activeQuestion, questions]);

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (activeQuestion < questions.length - 1) {
          setActiveQuestion(activeQuestion + 1);
        } else {
          submitAnswers();
        }
      } else if (e.key === 'Backspace' && !e.target.value && activeQuestion > 0) {
        setActiveQuestion(activeQuestion - 1);
      }
    };
  
  const handleChange = (e, questionId) => {
  setAnswers({ ...answers, [questionId]: e.target.value });
  };

  const submitAnswers = async () => {
    // Prepare the data for submission
    const submissionData = {
      "name": answers['q1'],
      "email": answers['q2'],
      "education": answers['q3'],
      "learning_disability": answers['q4'] === 'Yes',
      "last_eye_exam": answers['q5'] === 'Never' ? null : answers['q5'],
      "eidetic_correct": eideticCorrect,
      "phonetic_correct": phoneticCorrect,
      "reading_level": readingLevel,
      "test": testName,
      "test_words": testWords,
      "eidetic_result": eideticResults,
      "phonetic_result": phoneticResults
    };

    setEideticSkillValue(getSkillValue(testName, eideticCorrect, readingLevel, answers['q3']));
    setPhoneticSkillValue(getSkillValue(testName, phoneticCorrect, readingLevel, answers['q3']));
    setShowFinalResults(false);
    // Upload data to Supabase
    try {
      const { data, error } = await supabase.from('results').insert([submissionData]);
      if (error) {
          throw error;
      }
      console.log('Data uploaded successfully:', data);
    } catch (error) {
        console.error('Error uploading data:', error);
    }
      setSubmitted(true);
  };

  const goForward = () => {
  if (activeQuestion < questions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
  } else {
      setShowSubmitButton(true); 
  }
  };

  const goBackward = () => {
  if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
  }
  };

  const isValidInput = (questionId) => {
  const answer = answers[questionId];
  
  if (!answer) {
      return false;
  }
  
  // Find the question with the matching questionId
  const question = questions.find((q) => q.id === questionId);
  
  if (question && question.type === 'email') {
      const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,}$/;
      return emailRegex.test(answer);
  }
  
  return true;
  };
  
  return submitted ? (
    <div className="survey">
      {showFinalResults ? (
        <>
        <p>Sight-Word Analysis Skill: {eideticSkillValue}</p>
        <p>Phonetic Analysis Skill: {phoneticSkillValue}</p>
        </>
      ) : (
        <>
        <h1>Thank You!</h1>
        <p>We will follow up with your results shortly.</p>
        </>
      )}
      
    </div>
    ) : (
      <div className="survey">
        {showSubmitButton ? (
          <div className="submit-button-container">
            <button onClick={submitAnswers}>Submit</button>
          </div>
        ) : (
          questions.map((q, index) => (
              <div className="question-container" key={q.id} style={{ display: index === activeQuestion ? 'flex' : 'none' }}>
                <div className="question">
                  {typeof q.question === 'function' ? q.question() : q.question}
                </div>
            
                {q.type === 'select' && (
                  <select
                    className="input"
                    value={answers[q.id] || ''}
                    autoFocus={index === activeQuestion}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => handleChange(e, q.id)}
                  >
                    {q.options.map((option, i) => (
                      <option
                        key={`${q.id}-${i}`}
                        value={option}
                        hidden={i === 0}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                )}
            
                {q.type === 'yesNo' && (
                  <div className='buttons-container' key={`${q.id}-buttons`}>
                    <div className='button-container' key={`${q.id}-yes-button`}>
                      <button onClick={() => { 
                        handleChange({ target: { value: 'Yes' } }, q.id);
                        goForward();
                      }}>Yes</button>
                    </div>
                    <div className='button-container' key={`${q.id}-no-button`}>
                      <button onClick={() => { 
                        handleChange({ target: { value: 'No' } }, q.id);
                        goForward();
                      }}>No</button>
                    </div>
                  </div>
                )}
            
                {q.type === 'dateOrNever' && (
                  <div className='buttons-container' key={`${q.id}-buttons`}>
                    <div className='button-container' key={`${q.id}-date-input`}>
                      <input
                        className="input"
                        type="date"
                        value={answers[q.id] || ''}
                        autoFocus={index === activeQuestion}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => handleChange(e, q.id)}
                      />
                    </div>
                    <div className='button-container' key={`${q.id}-never-button`}>
                      <button onClick={() => { 
                        handleChange({ target: { value: 'Never' } }, q.id);
                        goForward();
                      }}>Never</button>
                    </div>
                  </div>
                )}
                {['text'].includes(q.type) && (
                  <input
                    className="input"
                    type={q.type}
                    value={answers[q.id] || ''}
                    autoFocus
                    onKeyDown={handleKeyDown}
                    onChange={(e) => handleChange(e, q.id)}
                    key={`${q.id}-input`}
                    placeholder='Name'
                  />
                )}
                {['email'].includes(q.type) && (
                  <input
                    className="input"
                    type={q.type}
                    value={answers[q.id] || ''}
                    ref={emailInputRef}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => handleChange(e, q.id)}
                    key={`${q.id}-input`}
                    placeholder='Email Address'
                  />
                )}
                <div className="buttons-container" key={`${q.id}-nav-buttons`}>
                  <div className="button-container" key={`${q.id}-back-button`}>
                    <button onClick={goBackward} disabled={activeQuestion === 0}>
                    &larr; Back
                  </button>
                </div>
                <div className="button-container" key={`${q.id}-forward-button`}>
                    <button onClick={goForward} disabled={!isValidInput(q.id)}>
                      Next &rarr;
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
  );   
}

export default Survey

