# Dr. B-Max - Project Documentation & Executive Blueprint

## 1. Project Vision
Dr. B-Max is a comprehensive, offline-first AI medical companion. It bridges the gap between hospital-grade diagnostics and home-based care using cutting-edge Edge AI (TensorFlow.js and TFLite), providing instant medical insights without compromising user privacy.

## 2. Technical Architecture
The ecosystem operates entirely on-device and is structured into a Monorepo:
*   **Web App (`dr-b-max/`):** A Next.js 16 Progressive Web App (PWA) with React 19. It serves as the main UI, handling data visualization, PDF medical report generation, and emergency SOS systems.
*   **Mobile App (`dr-b-max-mobile/`):** A React Native (Expo) application. It leverages native camera APIs (`react-native-vision-camera`) and edge ML (`react-native-fast-tflite`) for hardware-level flashlight control and high-speed inference.
*   **AI Engine (`dr-b-max-ai/`):** Python-based training pipeline utilizing PyTorch to train 3D-CNN (PhysNet) and Vision Transformer models on the UBFC-rPPG dataset for vital sign extraction.

## 3. Core Modules & Innovations

### A. The Biometric Scanner
The heart of Dr. B-Max. It utilizes Remote Photoplethysmography (rPPG).
*   **Process:** Extracts the Region of Interest (ROI) from the user's face/finger using `blazeface`. It isolates the green channel pixel intensity, mapping micro-fluctuations in blood volume.
*   **Denoising (Kalman Filter):** Raw signals are piped through a custom 1D Kalman Filter and a moving-average window. This successfully mitigates motion artifacts (e.g., hand tremors), vastly improving accuracy.
*   **Output:** Calculates Heart Rate (BPM), Blood Oxygen (SpO2), and Stress Level (HRV).
*   **Thermal Management:** Incorporates a "Battery Saver" mode that intelligently throttles the `requestAnimationFrame` loop (Duty Cycling) to prevent device overheating during extended use.

### B. Emergency SOS System
*   **Anomaly Detection:** Monitors vitals against clinical thresholds.
*   **False-Alarm Mitigation:** Implements a strict 10-second verification countdown to prevent alarm fatigue and accidental emergency calls.
*   **Sensory Alerts:** Generates a 800Hz sawtooth wave siren via the Web Audio API alongside high-contrast visual flashing.

### C. Offline-First Database (HIPAA Compliant)
*   **Engine:** `dexie` (IndexedDB wrapper).
*   **Encryption:** Secured via `dexie-encrypted`. All non-indexed sensitive medical records (vitals, medication logs) are heavily encrypted at rest using AES-256. The schema is currently at Version 5.

### D. Accessibility & Inclusivity (WCAG AA)
*   **Screen Reader Support:** Strict implementation of `aria-label`, `aria-live="assertive"`, and `role="alert"` attributes across all modules.
*   **Text-to-Speech (TTS):** Integrated natively to assist users with cognitive or visual impairments.

## 4. Current State & Next Milestones
The project has successfully implemented the core algorithms and privacy measures. 
**Pending/Future Roadmap:**
1.  **Clinical Validation:** Testing the rPPG output against physical pulse oximeters.
2.  **WebAuthn:** Full implementation of biometric login (Fingerprint/FaceID) to unlock the encrypted database.
3.  **LLM Integration:** Future integration with a local Go-based LLM (e.g., Ollama) or WebLLM to provide personalized, offline AI health analysis based on the IndexedDB records.
