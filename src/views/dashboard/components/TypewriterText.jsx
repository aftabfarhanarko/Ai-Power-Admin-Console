import React, { useState, useEffect } from "react";

export default function TypewriterText({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 2000,
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    let timeout;
    const currentFullText = texts[textIndex];

    if (isDeleting) {
      if (displayedText === "") {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deletingSpeed);
      }
    } else {
      if (displayedText === currentFullText) {
        timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    displayedText,
    isDeleting,
    textIndex,
    texts,
    typingSpeed,
    deletingSpeed,
    pauseTime,
  ]);

  return (
    <span className="font-medium bg-gradient-to-r from-nexus-primary to-nexus-secondary bg-clip-text text-transparent">
      {displayedText}
      <span className="animate-pulse text-nexus-primary ml-1">|</span>
    </span>
  );
}
