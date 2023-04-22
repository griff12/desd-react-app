import React, { useState } from 'react';
import './Survey.css';

function Survey() {
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showSubmitButton, setShowSubmitButton] = useState(false);

    const questions = [
      {
        id: 1,
        question: "Hello, what's your name?",
        type: 'text',
      },
      {
        id: 2,
        question: () => `Nice to meet you, ${answers[1] || ''}, where can we send your results/get in touch?`,
        type: 'email',
      },
      {
        id: 3,
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
          '7th grade',
          '8th grade',
          'High School',
          'College',
          'Graduate School',
          'Doctorate',
        ],
      },
      {
        id: 4,
        question: "Have you ever been diagnosed with a learning disability?",
        type: 'yesNo',
      },
      {
        id: 5,
        question: "When was your last eye examination?",
        type: 'dateOrNever',
      },
      {
        id: 6,
        question: "What is your birth sex?",
        type: 'multipleChoice',
        options: ['Male', 'Female'],
      }
    ];

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

    const submitAnswers = () => {
    console.log('Submitted answers:', answers);
    };

    const goForward = () => {
    if (activeQuestion < questions.length - 1) {
        setActiveQuestion(activeQuestion + 1);
    } else {
        setShowSubmitButton(true); // Add this line
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
    
    return (
        <div className="survey">
          {showSubmitButton ? (
            <div className="submit-button-container">
              <button onClick={submitAnswers}>Submit</button>
            </div>
          ) : (
            questions.map((q, index) => (
              <div key={q.id} style={{ display: index === activeQuestion ? 'block' : 'none' }}>
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
                            selected={i === 0 && !answers[q.id]}
                        >
                        {option}
                      </option>
                        ))}
                    </select>
                )}
      
                {q.type === 'yesNo' && (
                  <div className='buttons-container'>
                      <div className='button-container'>
                          <button onClick={() => { 
                              handleChange({ target: { value: 'Yes' } }, q.id);
                              goForward();}}
                          >Yes</button>
                      </div>
                      <div className='button-container'>
                          <button onClick={() => { 
                                  handleChange({ target: { value: 'No' } }, q.id);
                                  goForward();}}
                          >No</button>
                      </div>
                  </div>
                )}
      
                {q.type === 'dateOrNever' && (
                  <div className='buttons-container'>
                      <div className='button-container'>
                          <input
                          className="input"
                          type="date"
                          value={answers[q.id] || ''}
                          autoFocus={index === activeQuestion}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => handleChange(e, q.id)}
                          />
                      </div>
                      <div className='button-container'>
                          <button onClick={() => { 
                                  handleChange({ target: { value: 'Never' } }, q.id);
                                  goForward();}}
                          >Never</button>
                      </div>
                  </div>
                )}
      
                {q.type === 'multipleChoice' && (
                  <div className='buttons-container'>
                    {q.options.map((option, i) => (
                      <div className='button-container'>
                          <button key={i} onClick={() => {
                              handleChange({ target: { value: option } }, q.id);
                              goForward();}}
                          >{option}</button>
                      </div>
                    ))}
                  </div>
                )}
      
                {['text', 'email'].includes(q.type) && (
                  <input
                    className="input"
                    type={q.type}
                    value={answers[q.id] || ''}
                    autoFocus={index === activeQuestion}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => handleChange(e, q.id)}
                  />
                )}
      
                <div className="buttons-container">
                  <div className="button-container">
                    <button onClick={goBackward} disabled={activeQuestion === 0}>
                      &larr; Back
                    </button>
                  </div>
                  <div className="button-container">
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

