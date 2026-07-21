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

const App = () => {
  const [words, setWords] = useState(() => generateWords(50));
  const [typedHistory, setTypedHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [status, setStatus] = useState("waiting");
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
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
    setTypedHistory((prev) => [...prev, wordTyped]);
    setCurrentInput("");

  }
  else{
    setCurrentInput(value);

  }
};

const calculateWPM = () => {
  const  totalCharsTyped = typedHistory.join(" ").length;
  return Math.round((totalCharsTyped / 5) / (TEST_DURATION / 60)) || 60;
}

return (
  <div className = "app-container" onClick={() => inputRef.current?.focus()}>
    <header style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-correct)' }}>
        <div className="logo">type_test</div>
        <div className="stats">
          <span>{timeLeft}s</span> | <span>{status === 'finished' ? calculateWPM() : '---'} WPM</span>
        </div>
      </header>

    <main className = "words-container">
      <input ref = {inputRef} type = "text" value = {currentInput} onChange = {handleInputChange} autoFocus disabled = {status === "finished"} />

      {words.map((word, wordIndex) => {
        const isCurrentWord = wordIndex === typedHistory.length;
        const typedWord = typedHistory[wordIndex];

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
  </div>
);
};

export default App;