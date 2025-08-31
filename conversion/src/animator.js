import React, { useState, useRef, useEffect } from 'react';
import './animator.css';

// ✅ Import MediaPipe utilities at top (fixes ESLint no-undef)
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const Animator = () => {
  const [inputText, setInputText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentGesture, setCurrentGesture] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaPipeRef = useRef(null);

  // Pre-trained sign language gestures database
  const signLanguageGestures = {
    'hi': {
      name: 'Hello',
      description: 'Wave hand from side to side',
      handPositions: [
        { x: 0.3, y: 0.5, z: 0.1 },
        { x: 0.7, y: 0.5, z: 0.1 },
        { x: 0.5, y: 0.5, z: 0.1 }
      ],
      fingerPositions: [1, 1, 1, 1, 1],
      duration: 2000
    },
    'hello': {
      name: 'Hello',
      description: 'Wave hand from side to side',
      handPositions: [
        { x: 0.3, y: 0.5, z: 0.1 },
        { x: 0.7, y: 0.5, z: 0.1 },
        { x: 0.5, y: 0.5, z: 0.1 }
      ],
      fingerPositions: [1, 1, 1, 1, 1],
      duration: 2000
    },
    'thank you': {
      name: 'Thank You',
      description: 'Touch chin with fingertips and move forward',
      handPositions: [
        { x: 0.5, y: 0.3, z: 0.2 },
        { x: 0.5, y: 0.4, z: 0.1 }
      ],
      fingerPositions: [1, 1, 1, 1, 1],
      duration: 1500
    },
    'please': {
      name: 'Please',
      description: 'Flat hand, palm up, moving in circular motion',
      handPositions: [
        { x: 0.5, y: 0.6, z: 0.1 },
        { x: 0.6, y: 0.5, z: 0.1 },
        { x: 0.4, y: 0.5, z: 0.1 }
      ],
      fingerPositions: [1, 1, 1, 1, 1],
      duration: 1800
    },
    'yes': {
      name: 'Yes',
      description: 'Fist moving up and down',
      handPositions: [
        { x: 0.5, y: 0.4, z: 0.1 },
        { x: 0.5, y: 0.6, z: 0.1 },
        { x: 0.5, y: 0.4, z: 0.1 }
      ],
      fingerPositions: [0, 0, 0, 0, 0],
      duration: 1200
    },
    'no': {
      name: 'No',
      description: 'Index and middle finger extended, moving side to side',
      handPositions: [
        { x: 0.3, y: 0.5, z: 0.1 },
        { x: 0.7, y: 0.5, z: 0.1 }
      ],
      fingerPositions: [1, 1, 0, 0, 0],
      duration: 1000
    },
    'help': {
      name: 'Help',
      description: 'Thumb up with other hand supporting',
      handPositions: [
        { x: 0.4, y: 0.5, z: 0.1 },
        { x: 0.6, y: 0.5, z: 0.1 }
      ],
      fingerPositions: [1, 0, 0, 0, 0],
      duration: 2000
    },
    'good': {
      name: 'Good',
      description: 'Thumb up gesture',
      handPositions: [
        { x: 0.5, y: 0.5, z: 0.1 }
      ],
      fingerPositions: [1, 0, 0, 0, 0],
      duration: 1500
    },
    'bad': {
      name: 'Bad',
      description: 'Thumb down gesture',
      handPositions: [
        { x: 0.5, y: 0.5, z: 0.1 }
      ],
      fingerPositions: [1, 0, 0, 0, 0],
      duration: 1500
    },
    'love': {
      name: 'Love',
      description: 'Crossed arms over chest',
      handPositions: [
        { x: 0.3, y: 0.5, z: 0.1 },
        { x: 0.7, y: 0.5, z: 0.1 }
      ],
      fingerPositions: [1, 1, 1, 1, 1],
      duration: 2500
    }
  };

  useEffect(() => {
    initializeMediaPipe();
    return () => {
      if (mediaPipeRef.current) {
        mediaPipeRef.current.close();
      }
    };
  }, []);

  const initializeMediaPipe = () => {
    try {
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onResults);
      mediaPipeRef.current = hands;

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480
      });
      camera.start();
    } catch (error) {
      console.error('Error initializing MediaPipe:', error);
    }
  };

  const onResults = (results) => {
    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, Hands.HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
        drawLandmarks(canvasCtx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3
        });
      }
    }
    canvasCtx.restore();
  };

  const findMatchingGesture = (text) => {
    const lowerText = text.toLowerCase();

    if (signLanguageGestures[lowerText]) {
      return signLanguageGestures[lowerText];
    }

    for (const [key, gesture] of Object.entries(signLanguageGestures)) {
      if (lowerText.includes(key)) {
        return gesture;
      }
    }

    return {
      name: 'Unknown',
      description: 'Gesture not found in database',
      handPositions: [{ x: 0.5, y: 0.5, z: 0.1 }],
      fingerPositions: [1, 1, 1, 1, 1],
      duration: 2000
    };
  };

  const animateGesture = async (gesture) => {
    setIsAnimating(true);
    setCurrentGesture(gesture);
    await new Promise(resolve => setTimeout(resolve, gesture.duration));
    setIsAnimating(false);
    setCurrentGesture(null);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      const gesture = findMatchingGesture(inputText);
      animateGesture(gesture);
    }
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);
  };

  return (
    <div className="animator-container">
      <div className="text-input-section">
        <h2>Text to Sign Language Converter</h2>
        <p className="description">
          Type text to see sign language gestures for deaf and non-speaking people
        </p>
        
        <form onSubmit={handleTextSubmit} className="input-form">
          <div className="input-group">
            <input
              type="text"
              value={inputText}
              onChange={handleTextChange}
              placeholder="Type your message here (e.g., hi, thank you, please)..."
              className="text-input"
              disabled={isAnimating}
            />
            <button 
              type="submit" 
              className="convert-btn"
              disabled={isAnimating || !inputText.trim()}
            >
              {isAnimating ? 'Converting...' : 'Convert to Sign'}
            </button>
          </div>
        </form>

        {currentGesture && (
          <div className="gesture-info">
            <h3>Current Gesture: {currentGesture.name}</h3>
            <p>{currentGesture.description}</p>
            <div className="gesture-animation">
              <div className="skeleton-hands">
                <div className="hand left-hand">
                  <div className="fingers">
                    {currentGesture.fingerPositions.map((extended, index) => (
                      <div 
                        key={index} 
                        className={`finger ${extended ? 'extended' : 'closed'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="hand right-hand">
                  <div className="fingers">
                    {currentGesture.fingerPositions.map((extended, index) => (
                      <div 
                        key={index} 
                        className={`finger ${extended ? 'extended' : 'closed'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="camera-section">
        <h3>Hand Tracking</h3>
        <div className="camera-container">
          <video
            ref={videoRef}
            style={{ display: 'none' }}
            width="640"
            height="480"
          />
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            className="hand-canvas"
          />
        </div>
        <p className="camera-note">
          Camera view shows hand tracking for gesture recognition
        </p>
      </div>

      <div className="help-section">
        <h3>Supported Words</h3>
        <div className="supported-words">
          {Object.keys(signLanguageGestures).map(word => (
            <span key={word} className="word-tag" onClick={() => setInputText(word)}>
              {word}
            </span>
          ))}
        </div>
        <p className="help-text">
          Click on any word above to quickly test the gesture
        </p>
      </div>
    </div>
  );
};

export default Animator;

