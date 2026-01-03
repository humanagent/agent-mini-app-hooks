const STORAGE_KEY = "xmtp-ephemeral-account-key";

export function getOrCreateEphemeralAccountKey(): Uint8Array {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const bytes = Uint8Array.from(JSON.parse(stored));
    return bytes;
  }

  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(key)));
  return key;
}
