"use client";

import { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";

const texts = [
  "One hot summer day, a thirsty crow found a pitcher with a little water at the bottom. He tried to drink but couldn’t reach it.",
  "The clever crow had an idea. He picked up small stones and dropped them into the pitcher one by one. Slowly, the water rose to the top.",
  "Finally, the crow drank the cool water and flew away happily.",
  "Moral: Where there’s a will, there’s a way!",
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useSpring(() => ({ opacity: 0 }));
  const [isClient, setIsClient] = useState(false);
  const [voices, setVoices] = useState([]);
  const [highlightedText, setHighlightedText] = useState("");

  // Set client-side flag after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load voices only once when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const voicesList = window.speechSynthesis.getVoices();
      if (voicesList.length > 0) {
        setVoices(voicesList); // Set initial voices
      } else {
        const onVoicesChanged = () => {
          const updatedVoices = window.speechSynthesis.getVoices();
          if (updatedVoices.length > 0) {
            setVoices(updatedVoices);
            window.speechSynthesis.onvoiceschanged = null; // Cleanup
          }
        };
        window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      }
    }
  }, []); // Run only once on component mount

  // Speak the current text with word highlighting
  // const speakText = (text) => {
  //   if (voices.length > 0) {
  //     const utterance = new SpeechSynthesisUtterance(text);
  //     utterance.voice = voices[0]; // Use the first available voice
  //     window.speechSynthesis.cancel(); // Stop any ongoing speech

  //     const words = text.split(" ");
  //     utterance.onboundary = (event) => {
  //       if (event.name === "word") {
  //         const wordIndex = event.charIndex;
  //         const highlighted = words
  //           .map((word, i) =>
  //             i === wordIndex ? `<span style="color: red">${word}</span>` : word
  //           )
  //           .join(" ");
  //         setHighlightedText(highlighted);
  //       }
  //     };

  //     utterance.onend = () => {
  //       setHighlightedText("");
  //     };

  //     window.speechSynthesis.speak(utterance);
  //   } else {
  //     console.error("No voices available for speech synthesis."); // Log error if no voices
  //   }
  // };

  const speakText = (text) => {
    if (voices.length > 0) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voices[0]; // Use the first available voice
      utterance.rate = 0.55;
      window.speechSynthesis.cancel(); // Stop any ongoing speech

      const words = text.split(" ");
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;

          // Find the index of the word being spoken
          let cumulativeLength = 0;
          const highlighted = words
            .map((word) => {
              const start = cumulativeLength;
              const end = cumulativeLength + word.length;
              cumulativeLength += word.length + 1; // Account for space between words

              if (charIndex >= start && charIndex < end) {
                return `<span style=" background-color:#ffff0073; padding: 0 5px; font-weight: bold;">${word}</span>`;
              }
              return word;
            })
            .join(" ");

          setHighlightedText(highlighted);
        }
      };

      utterance.onend = () => {
        setHighlightedText(""); // Clear highlight after speech ends
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.error("No voices available for speech synthesis."); // Log error if no voices
    }
  };

  // Update fade-in when the index changes
  useEffect(() => {
    if (isClient) {
      setFade({ opacity: 1, reset: true });
    }
  }, [index, setFade, isClient]);

  // Handle "Next Slide" button click
  const handleNext = () => {
    setFade({ opacity: 0 });
    setTimeout(
      () => setIndex((prevIndex) => (prevIndex + 1) % texts.length),
      300
    );
  };

  // Handle "Play" button click
  const handlePlay = () => {
    speakText(texts[index]);
  };

  if (!isClient) return null; // Avoid rendering until client-side

  return (
    <div style={styles.container}>
      <animated.div style={{ ...fade, ...styles.textContainer }}>
        <h1
          style={styles.text}
          dangerouslySetInnerHTML={{
            __html: highlightedText || texts[index],
          }}
        ></h1>
      </animated.div>
      <div style={styles.buttonContainer}>
        <button onClick={handlePlay} style={styles.button}>
          Play
        </button>
        <button onClick={handleNext} style={styles.button}>
          Next Slide
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundImage: "url('../2.jpg')",
    backgroundSize: "contain",
    position: "relative",
  },
  textContainer: {
    // border: "5px dashed #FF69B4",
    border: "none",
    borderRadius: "20px",
    padding: "60px",
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
    // boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    width: "90%",
    maxWidth: "600px",
    textAlign: "center",
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
  },
  buttonContainer: {
    position: "absolute",
    bottom: "60px",
    display: "flex",
    gap: "20px",
  },
  button: {
    padding: "15px 30px",
    fontSize: "18px",
    cursor: "pointer",
    backgroundColor: "#FF4500",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    transition: "background-color 0.3s, transform 0.2s",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  text: {
    fontSize: "28px",
    color: "#000",
    // color: "#FF1493",
  },
};
