/**
 * WebAuthn Biometric Authentication Helper
 * Uses the Web Authentication API (FIDO2) for device-native biometrics:
 * - Windows Hello (fingerprint / face / PIN)
 * - Touch ID / Face ID on Mac/iOS
 * - Android biometrics
 */

const RP_ID = typeof window !== "undefined" ? window.location.hostname : "localhost";
const RP_NAME = "Dr. B-MAX Medical Companion";
const CREDENTIAL_KEY = "drBMax_webauthn_credId";

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return buffer.buffer;
}

export function isWebAuthnSupported(): boolean {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}

/**
 * Register biometric credential (called once, first time user enables biometrics)
 */
export async function registerBiometric(username: string): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = new TextEncoder().encode(username);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { id: RP_ID, name: RP_NAME },
        user: { id: userId, name: username, displayName: username },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },   // ES256
          { alg: -257, type: "public-key" },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Use device biometrics only
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none",
      },
    }) as PublicKeyCredential;

    if (credential) {
      localStorage.setItem(CREDENTIAL_KEY, bufferToBase64(credential.rawId));
      localStorage.setItem("drBMax_biometricUser", username);
      return true;
    }
    return false;
  } catch (err) {
    console.error("WebAuthn registration failed:", err);
    return false;
  }
}

/**
 * Authenticate using biometric (called on each login)
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;

  const storedCredId = localStorage.getItem(CREDENTIAL_KEY);
  if (!storedCredId) return false;

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: RP_ID,
        allowCredentials: [{
          id: base64ToBuffer(storedCredId),
          type: "public-key",
        }],
        userVerification: "required",
        timeout: 60000,
      },
    }) as PublicKeyCredential;

    return !!assertion;
  } catch (err) {
    console.error("WebAuthn authentication failed:", err);
    return false;
  }
}

export function hasBiometricRegistered(): boolean {
  return !!localStorage.getItem(CREDENTIAL_KEY);
}

export function getBiometricUsername(): string {
  return localStorage.getItem("drBMax_biometricUser") || "";
}
