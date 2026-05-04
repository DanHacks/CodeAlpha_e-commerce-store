// Image upload service.
// Simulates a real backend upload (progress + async) and returns a hosted-style URL.
// To swap in a real backend, replace the body of `uploadImage` with a fetch() call
// to your endpoint (e.g. POST /api/uploads) and return response.url.

export type UploadProgress = (pct: number) => void;

export async function uploadImage(file: File, onProgress?: UploadProgress): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("File must be an image");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5MB");

  // Read file as data URL (acts as the "stored" asset URL in this MVP)
  const dataUrl: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });

  // Simulate network upload progress
  for (let pct = 10; pct <= 100; pct += 15) {
    await new Promise((r) => setTimeout(r, 90));
    onProgress?.(Math.min(pct, 100));
  }

  // In a real backend integration this would be: return json.url
  return dataUrl;
}
