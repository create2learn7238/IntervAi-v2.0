import { useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export default function useFaceTracking({ webcamRef, onViolation }) {

  const faceLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const consecutiveNoFace = useRef(0);
  const lastViolationTime = useRef(0);
  const lastDetectionTime = useRef(0);

  useEffect(() => {
    let active = true;

    async function initMediaPipe() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 2 // Detect up to 2 faces
        });

        if (active) {
          detectFaces();
        }
      } catch (err) {
        console.error("MediaPipe Init Error:", err);
      }
    }

    initMediaPipe();

    function detectFaces() {
      if (!active) return;
      
      const video = webcamRef?.current?.video;
      if (video && video.readyState >= 2 && faceLandmarkerRef.current) {
        const startTimeMs = performance.now();
        
        // THROTTLE: Run face tracking at most once every 300ms to avoid blocking the main UI thread.
        if (startTimeMs - lastDetectionTime.current >= 300) {
          lastDetectionTime.current = startTimeMs;
          const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);

          const now = Date.now();
          // Cooldown to avoid spamming violations (1 violation every 3 seconds)
          const canLog = now - lastViolationTime.current > 3000;

          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            consecutiveNoFace.current = 0;
            
            if (results.faceBlendshapes.length > 1 && canLog) {
              if (onViolation) onViolation('MULTIPLE_FACES', 'Multiple faces detected in frame');
              lastViolationTime.current = now;
            }

            // Check if looking away (using blendshapes)
            const blendshapes = results.faceBlendshapes[0].categories;
            
            const lookAwayThreshold = 0.85;
            const lookCategories = [
              'eyeLookOutLeft', 'eyeLookOutRight', 
              'eyeLookUpLeft', 'eyeLookUpRight',
              'eyeLookDownLeft', 'eyeLookDownRight'
            ];
            
            const isLookingAway = blendshapes.some(b => 
              lookCategories.includes(b.categoryName) && b.score > lookAwayThreshold
            );

            if (isLookingAway && canLog) {
              if (onViolation) onViolation('LOOKING_AWAY', 'Candidate is not making eye contact with the screen');
              lastViolationTime.current = now;
            }

          } else {
            consecutiveNoFace.current++;
            // Trigger NO_FACE_DETECTED if it happens for ~90 frames (approx 3 seconds)
            // Note: Since we only run 3 times a second, 90 frames is now 30 seconds!
            // Let's adjust to 10 frames (~3 seconds)
            if (consecutiveNoFace.current > 10 && canLog) {
              if (onViolation) onViolation('NO_FACE_DETECTED', 'No face detected in camera view');
              lastViolationTime.current = now;
              consecutiveNoFace.current = 0;
            }
          }
        }
      }

      requestRef.current = requestAnimationFrame(detectFaces);
    }

    return () => {
      active = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, [webcamRef, onViolation]);
}
