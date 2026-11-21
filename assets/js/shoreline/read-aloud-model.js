// Pure helpers for read-aloud (read-aloud.js does the speaking).

export const CHUNK_LIMIT = 220;

/**
 * Split text into short pieces at sentence ends (falling back to spaces), because Chrome
 * stops speaking a single long utterance after about 15 seconds.
 */
export function speechChunks(text, limit = CHUNK_LIMIT) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return [];
    const sentences = clean.match(/[^.!?。！？]+[.!?。！？]*\s*/g) || [clean];
    const chunks = [];
    let current = '';
    const push = piece => { if (piece.trim()) chunks.push(piece.trim()); };
    for (const sentence of sentences) {
        if ((current + sentence).length <= limit) { current += sentence; continue; }
        push(current);
        current = '';
        if (sentence.length <= limit) { current = sentence; continue; }
        // One very long sentence: break it at spaces.
        let rest = sentence;
        while (rest.length > limit) {
            const cut = rest.lastIndexOf(' ', limit);
            const at = cut > 0 ? cut : limit;
            push(rest.slice(0, at));
            rest = rest.slice(at);
        }
        current = rest;
    }
    push(current);
    return chunks;
}

/** The voice to use: the saved one if this device has it, else null (browser default). */
export function pickVoice(voices, savedName) {
    if (!savedName || !Array.isArray(voices)) return null;
    return voices.find(voice => voice.name === savedName) || null;
}
