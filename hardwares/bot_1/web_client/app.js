const micBtn = document.getElementById("micBtn");
const instructionText = document.getElementById("instructionText");
const visualizer = document.getElementById("visualizer");
const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const chatContainer = document.getElementById("chatContainer");
const audioPlayer = document.getElementById("audioPlayer");

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let socket;

// --- Wake word ("CarePlus") ---
// The ASR model is Nepali-only, so it never transcribes the literal English word
// "CarePlus" — it renders the sound phonetically in Devanagari instead. These lists
// cover the plausible phonetic spellings for each half of the word; combine them
// with an optional separator to match the many ways it can come out of Whisper.
const CARE_VARIANTS = ["केयर", "कयर", "केर", "कैर", "क्येर", "क्यर", "कएर"];
const PLUS_VARIANTS = ["प्लस्", "प्लश्", "प्लस", "प्लज", "प्लश"];
const WAKE_WORD_PATTERN =
  `(?:${CARE_VARIANTS.join("|")})\\s*-?\\s*(?:${PLUS_VARIANTS.join("|")})|care\\s*-?\\s*plus`;
const WAKE_WORD_TEST_RE = new RegExp(WAKE_WORD_PATTERN, "i");
const WAKE_WORD_STRIP_RE = new RegExp(WAKE_WORD_PATTERN, "gi");

const ACTIVATION_TIMEOUT_MS = 10 * 60 * 1000; // stay awake 10 min after the wake word, like public/app.js
let isActivated = false;
let activationTimeout = null;

function activateAssistant() {
  isActivated = true;
  if (activationTimeout) clearTimeout(activationTimeout);
  activationTimeout = setTimeout(deactivateAssistant, ACTIVATION_TIMEOUT_MS);
}

function deactivateAssistant() {
  isActivated = false;
  if (activationTimeout) clearTimeout(activationTimeout);
  activationTimeout = null;
  setStatus("", "Sleeping");
  instructionText.textContent = 'Say "CarePlus" to wake me up';
}

// --- Playback queue (ADT) ---
// Sentence-sized audio chunks arrive as soon as each is synthesized, not necessarily
// in a tidy order relative to network timing. This FIFO guarantees they always play
// back in the order they were generated, one at a time.
class AudioPlaybackQueue {
  constructor() {
    this.items = [];
    this.isPlaying = false;
    this.currentUrl = null;
  }

  enqueue(url) {
    this.items.push(url);
    this._playNext();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  _playNext() {
    if (this.isPlaying || this.items.length === 0) return;
    this.isPlaying = true;
    this.currentUrl = this.items.shift();
    audioPlayer.src = this.currentUrl;
    audioPlayer.play().catch((e) => console.error("Autoplay blocked:", e));
  }

  onPlaybackEnded() {
    if (this.currentUrl) URL.revokeObjectURL(this.currentUrl);
    this.currentUrl = null;
    this.isPlaying = false;
    if (this.items.length > 0) {
      this._playNext();
    } else {
      onAudioQueueDrained();
    }
  }
}

const audioQueue = new AudioPlaybackQueue();
audioPlayer.onended = () => audioQueue.onPlaybackEnded();

let audioChunksExpected = null;
let audioChunksReceived = 0;

function onAudioQueueDrained() {
  if (audioChunksExpected !== null && audioChunksReceived >= audioChunksExpected) {
    setStatus(isActivated ? "ready" : "", isActivated ? "Ready" : "Sleeping");
    instructionText.textContent = isActivated
      ? "Tap to speak"
      : 'Say "CarePlus" to wake me up';
  }
}

function base64ToBlobUrl(base64, mime = "audio/wav") {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

function setStatus(state, text) {
  statusIndicator.className = `status-indicator ${state}`;
  statusText.textContent = text;
}

function addMessage(text, type = "system") {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.textContent = text;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return msg; // Return so we can update it if streaming
}

const API_BASE =
  window.location.port === "5500"
    ? "https://q4n8mbr4-5000.inc1.devtunnels.ms"
    : "";

function initWebSocket() {
  let wsUrl;
  if (window.location.port === "5500") {
    wsUrl = "ws://127.0.0.1:5000/ws/chat";
  } else {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    wsUrl = `${protocol}//${window.location.host}/ws/chat`;
  }

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connected");
    setStatus(isActivated ? "ready" : "", isActivated ? "Ready" : "Sleeping");
  };

  let currentAiMessage = null;

  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "token") {
      if (!currentAiMessage) {
        currentAiMessage = addMessage("", "system");
      }
      currentAiMessage.textContent += data.content;
    } else if (data.type === "audio_chunk") {
      audioChunksReceived += 1;
      const url = base64ToBlobUrl(data.audio_b64);
      audioQueue.enqueue(url);
      setStatus("processing", "Speaking...");
    } else if (data.type === "audio_chunk_error") {
      console.error(`TTS chunk ${data.seq} failed:`, data.detail);
      audioChunksReceived += 1;
      onAudioQueueDrained();
    } else if (data.type === "done") {
      currentAiMessage = null;
      audioChunksExpected = data.total_audio_chunks || 0;
      if (audioChunksExpected === 0) {
        onAudioQueueDrained();
      }
    } else if (data.type === "error") {
      addMessage(`Error: ${data.content}`, "system");
      setStatus(isActivated ? "ready" : "", isActivated ? "Ready" : "Sleeping");
    }
  };

  socket.onclose = () => {
    setStatus("", "Disconnected");
    setTimeout(initWebSocket, 2000);
  };
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    audioChunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      stream.getTracks().forEach((track) => track.stop());
      await handleAudioUpload(audioBlob);
    };

    mediaRecorder.start();
    isRecording = true;

    micBtn.classList.add("recording");
    visualizer.classList.remove("hidden");
    instructionText.textContent = "Tap to stop";
    setStatus("recording", "Listening");
  } catch (err) {
    console.error("Microphone access denied", err);
    alert("Please allow microphone access to use the assistant.");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  isRecording = false;
  micBtn.classList.remove("recording");
  micBtn.classList.add("processing");
  visualizer.classList.add("hidden");
  instructionText.textContent = "Processing...";
  setStatus("processing", "Transcribing");
}

async function handleAudioUpload(blob) {
  const formData = new FormData();
  formData.append("audio", blob, "recording.webm");

  try {
    const response = await fetch(`${API_BASE}/api/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      const transcript = result.text;

      if (transcript.trim()) {
        addMessage(transcript, "user");

        const hasWakeWord = WAKE_WORD_TEST_RE.test(transcript);
        if (hasWakeWord) activateAssistant();

        if (!isActivated) {
          setStatus("", "Sleeping");
          instructionText.textContent = 'Say "CarePlus" to wake me up';
          return;
        }

        const query = hasWakeWord
          ? transcript.replace(WAKE_WORD_STRIP_RE, "").trim()
          : transcript;

        if (!query) {
          // Wake word only, no follow-up yet — stay awake and wait for the real question.
          setStatus("ready", "Listening");
          instructionText.textContent = "Yes? I'm listening...";
          return;
        }

        // Send to WebSocket for AI response
        setStatus("processing", "Thinking");
        instructionText.textContent = "Thinking...";
        audioChunksExpected = null;
        audioChunksReceived = 0;

        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              userId: "web-user",
              message: query,
              history: [],
            }),
          );
        } else {
          addMessage("Error: Connection lost", "system");
          setStatus("ready", "Ready");
        }
      } else {
        setStatus(isActivated ? "ready" : "", isActivated ? "Ready" : "Sleeping");
        instructionText.textContent = "Tap to speak (No speech detected)";
      }
    } else {
      console.error("Transcription failed");
      setStatus(isActivated ? "ready" : "", isActivated ? "Ready" : "Sleeping");
      instructionText.textContent = "Error processing speech";
    }
  } catch (e) {
    console.error("Upload error", e);
    setStatus(isActivated ? "ready" : "", isActivated ? "Ready" : "Sleeping");
    instructionText.textContent = "Network error";
  } finally {
    micBtn.classList.remove("processing");
  }
}

micBtn.addEventListener("click", () => {
  // Stop any ongoing audio playback when the user starts speaking
  if (!audioPlayer.paused) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioQueue.onPlaybackEnded();
  }

  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
});

// Start dormant until the wake word is heard.
deactivateAssistant();

// Initialize WebSocket connection on load
initWebSocket();
