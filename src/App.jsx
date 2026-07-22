import { useState, useEffect, useRef } from 'react'

const WORD_POOL = ["the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog", "apple", "banana", "computer", "engineer", "software", "system", "react", "network", "code", "debug"];
const generateWords = (count) => {
  const words = [];
  for (let i = 0; i<count; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_POOL.length);
    words.push(WORD_POOL[randomIndex]);
  }
  return words;
}

const TEST_DURATION = 60;
const BATCH_SIZE = 30;

const App = () => {
  const [words, setWords] = useState(() => generateWords(BATCH_SIZE));
  const [typedHistory, setTypedHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [status, setStatus] = useState("waiting");
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [totalCorrectChars, setTotalCorrectChars] = useState(0);
  const inputRef = useRef(null);
  


useEffect(() => {
  let timerInterval;
  if (status === "typing") {
    timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setStatus("finished");
          clearInterval(timerInterval);
          return 0;
        }
        return prevTime -1;
      });
    }, 1000);
  }
  return () => {
    clearInterval(timerInterval);
  };
}, [status]);

const handleInputChange = (e) => {
  if (status === "finished") return;
  if (status === "waiting") {
    setStatus("typing");
  }

  const value = e.target.value;
  if (value.endsWith(" "))  {
    const wordTyped = value.trim();
    const newHistory = [...typedHistory, wordTyped];

    //setTypedHistory((prev) => [...prev, wordTyped]);

    if (newHistory.length === words.length) {
      let batchCorrectChars = 0;
      words.forEach((targetWord, index) => {
        const typedW = newHistory[index];

        for (let i = 0;i < targetWord.length; i++) {
          if (targetWord[i] === typedW[i]) batchCorrectChars++;
        }
        batchCorrectChars++;
      });
      setCurrentInput("");
      setTotalCorrectChars((prev) => prev + batchCorrectChars);
      setWords(generateWords(BATCH_SIZE));
      setTypedHistory([]);
    } 
    else {
      setTypedHistory(newHistory);
      setCurrentInput("");
    }

  }
  else{
    setCurrentInput(value);

  }
};


const restartTest = () => {
  setWords(generateWords(BATCH_SIZE));
  setTypedHistory([]);
  setCurrentInput("");
  setStatus("waiting");
  setTimeLeft(TEST_DURATION);
  setTotalCorrectChars(0);
  setTimeout(() => inputRef.current?.focus(), 0);
};

const calculateWPM = () => {
  let currentBatchCorrectChars = 0;
  words.forEach((targetWord, index) => {
    const typedW = typedHistory[index] !== undefined ? typedHistory[index] : (index === typedHistory.length ? currentInput.trim() : "");

    if (typedW) {
      for (let i=0; i<targetWord.length; i++) {
        if (targetWord[i] === typedW[i]) currentBatchCorrectChars++;
      }

      if (typedHistory[index] !== undefined) currentBatchCorrectChars++;
    }
  });

  const totalChars = totalCorrectChars + currentBatchCorrectChars;
  //const  totalCharsTyped = typedHistory.join(" ").length;
  return Math.round((totalChars / 5) / (TEST_DURATION / 60)) || 0;
}

return (
  <div className = "app-container" onClick={() => inputRef.current?.focus()} style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace', padding: '20px' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-correct)' }}>
        <div className="logo">Typing Speed Test</div>
        <div className="stats">
          <span>{timeLeft}s</span> | <span>{status === 'finished' ? calculateWPM() : '---'} WPM</span>
        </div>
      </header>

    <main className = "words-container">
      <input className = "hidden-input" ref = {inputRef} type = "text" value = {currentInput} onChange = {handleInputChange} autoFocus disabled = {status === "finished"} />

      {words.map((word, wordIndex) => {
        const isCurrentWord = wordIndex === typedHistory.length;
        const typedWord = typedHistory[wordIndex];
        const actualInput = isCurrentWord ? currentInput : typedWord || "";
        

        return (
          <div key = {wordIndex} className = "word">
            {word.split("").map((char, charIndex) => {
              let statusClass = "";
              if (typedWord) {
                statusClass = typedWord[charIndex] === char ? "correct" : "incorrect";
              }
              else if (isCurrentWord && charIndex < currentInput.length) {
                statusClass = currentInput[charIndex] === char ? "correct" : "incorrect";
              }
              const isCaretActive = isCurrentWord && charIndex === currentInput.length;

              return (
                <span key = {charIndex} style={{ display: 'flex' }}>
                  {status === "typing" && isCaretActive && <div className="caret" />}
                    <span className={`letter ${statusClass}`}>
                      {char}
                    </span>
                  </span>
              );
            })
            }

            {/* Fallback for when the user types MORE letters than the word has */}
              {isCurrentWord && currentInput.length >= word.length && (
                <span style={{ display: 'flex' }}>
                  {status === "typing" && <div className="caret" />}
                  {/* We could render extra red letters here later! */}
                </span>
              )}

            
          </div>
        );

      })}
    </main>
    <div className="results-container" style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Test Complete!</h2>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '20px 0' }}>
            {calculateWPM()} WPM
          </div>
          <button 
            onClick={restartTest}
            style={{ padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px' }}
          >
            Restart Test
          </button>
        </div>
  </div>
);
};

export default App;