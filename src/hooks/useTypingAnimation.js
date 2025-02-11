import { useState, useEffect } from 'react';

const useTypingAnimation = (words, typingSpeed = 150, deletingSpeed = 100, pauseTime = 2000) => {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer;

    if (isPaused) {
      timer = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(false);
      }, pauseTime);
      return () => clearTimeout(timer);
    }

    if (isTyping) {
      if (displayText === words[wordIndex]) {
        setIsPaused(true);
        return;
      }

      timer = setTimeout(() => {
        setDisplayText(words[wordIndex].slice(0, displayText.length + 1));
      }, typingSpeed);
    } else {
      if (displayText === '') {
        setIsTyping(true);
        setWordIndex((prev) => (prev + 1) % words.length);
        return;
      }

      timer = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, deletingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isTyping, wordIndex, isPaused, words, typingSpeed, deletingSpeed, pauseTime]);

  return displayText;
};

export default useTypingAnimation; 