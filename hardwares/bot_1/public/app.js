const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const transcriptEl = document.getElementById("transcript");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const userIdInput = document.getElementById("userId");
const aiUrlInput = document.getElementById("aiUrl");
const ttsUrlInput = document.getElementById("ttsUrl");
const askBtn = document.getElementById("askBtn");
const autoReplyToggle = document.getElementById("autoReplyToggle");
const replyEl = document.getElementById("reply");
const replyAudio = document.getElementById("replyAudio");
const aiStatusEl = document.getElementById("aiStatus");
const aiErrorEl = document.getElementById("aiError");
const continuousToggle = document.getElementById("continuousToggle");
const interimToggle = document.getElementById("interimToggle");
const wakeWordToggle = document.getElementById("wakeWordToggle");
const activationIndicator = document.getElementById("activationIndicator");
const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");

let recognition;
let isListening = false;
let lastFinalTranscript = "";
let replyAudioUrl = "";
let autoRestartBlocked = false;

// Wake word state
let isActivated = false;
let activationTimeout = null;

const AUTO_START_LISTENING = true;
const AUTO_REPLY_ENABLED = true;
const AUTO_PLAY_AUDIO = true;

const activateAssistant = () => {
  isActivated = true;
  console.log("%c Assistant Activated - 10 min timer started ", "background: #222; color: #bada55");
  activationIndicator.dataset.active = "true";
  activationIndicator.textContent = "Active";
  if (activationTimeout) clearTimeout(activationTimeout);
  activationTimeout = setTimeout(() => {
    console.log("10 minute inactivity timeout reached");
    deactivateAssistant();
  }, 600000); 
};

const deactivateAssistant = () => {
  isActivated = false;
  console.log("%c Assistant Deactivated ", "background: #222; color: #ff0000");
  activationIndicator.dataset.active = "false";
  activationIndicator.textContent = (wakeWordToggle && wakeWordToggle.checked) ? "Sleeping" : "Disabled";
  if (activationTimeout) clearTimeout(activationTimeout);
};

const DEFAULT_AI_URL = "/api/chat/agent";
const DEFAULT_TTS_URL = "/tts";
const DEFAULT_USER_ID = "web-user";

const loadSetting = (key, fallback) =>
  window.localStorage.getItem(key) || fallback;
const saveSetting = (key, value) =>
  window.localStorage.setItem(key, value);

const errorMessages = {
  "not-allowed": "Microphone permission blocked. Allow mic access and retry.",
  "service-not-allowed": "Microphone access blocked by browser policy.",
  "network": "Network error from speech service. Check your connection and retry.",
  "no-speech": "No speech detected. Try speaking closer to the mic.",
  "aborted": "Recognition aborted. Click Start Listening to try again.",
  "audio-capture": "No microphone found or busy. Check audio input settings.",
  "language-not-supported": "Nepali (ne-NP) not supported by this browser."
};

const updateStatus = (text, state = "idle") => {
  statusEl.textContent = text;
  statusEl.dataset.state = state;
};

const updateAiStatus = (text, state = "idle") => {
  aiStatusEl.textContent = text;
  aiStatusEl.dataset.state = state;
};

const setButtons = (listening) => {
  startBtn.disabled = listening;
  startBtn.dataset.listening = listening;
  stopBtn.disabled = !listening;
};

toggleSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

closeSidebarBtn.addEventListener("click", () => {
  sidebar.classList.add("hidden");
});

const handleError = (event) => {
  const message = errorMessages[event.error] || event.message || "Unknown error";
  errorEl.textContent = message;
  updateStatus("Error", "error");
  if (event.error === "not-allowed" || event.error === "service-not-allowed") {
    autoRestartBlocked = true;
  }
  console.error("SpeechRecognition error:", event.error, event.message || "");
};

const updateReply = (text) => {
  replyEl.textContent = text || "";
};

const clearReplyAudio = () => {
  if (replyAudioUrl) {
    URL.revokeObjectURL(replyAudioUrl);
    replyAudioUrl = "";
  }
  replyAudio.removeAttribute("src");
  replyAudio.load();
};

const setReplyAudio = (blob) => {
  clearReplyAudio();
  replyAudioUrl = URL.createObjectURL(blob);
  replyAudio.src = replyAudioUrl;
  console.log("Audio blob received, starting playback...");
  if (AUTO_PLAY_AUDIO) {
    replyAudio.play().catch((e) => {
      console.warn("Autoplay blocked by browser. Interaction required.", e);
      aiErrorEl.textContent = "Click to play audio";
    });
  }
};

const parseAiResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await response.json();
    const replyText =
      data.reply ||
      data.response ||
      data.text ||
      data.message ||
      data.output ||
      JSON.stringify(data);
    return { replyText };
  }

  const replyText = await response.text();
  return { replyText };
};

const handleTtsResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.startsWith("audio/")) {
    const audioBlob = await response.blob();
    setReplyAudio(audioBlob);
    return;
  }

  if (contentType.includes("application/json")) {
    const data = await response.json();
    if (data.audioUrl || data.audio_url) {
      clearReplyAudio();
      replyAudio.src = data.audioUrl || data.audio_url;
      return;
    }

    if (data.audio_base64) {
      const binary = atob(data.audio_base64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const audioBlob = new Blob([bytes], { type: "audio/wav" });
      setReplyAudio(audioBlob);
      return;
    }
  }

  throw new Error("Unsupported TTS response format");
};

let socket;

const initWebSocket = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log("WebSocket connected");
  };
  
  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === "token") {
      replyEl.textContent += data.content;
      updateAiStatus("Streaming…", "listening");
    } else if (data.type === "done") {
      updateAiStatus("Reply ready", "idle");
      const fullReply = data.full_reply;

      const ttsUrl = ttsUrlInput.value.trim();
      if (ttsUrl) {
        updateAiStatus("Synthesizing…", "listening");
        console.log(`Requesting TTS from: ${ttsUrl} for text: "${fullReply.substring(0, 30)}..."`);
        try {
          const ttsResponse = await fetch(ttsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: fullReply })
          });
          if (ttsResponse.ok) {
            console.log("TTS Response received successfully");
            await handleTtsResponse(ttsResponse);
          } else {
            const errText = await ttsResponse.text();
            console.error(`TTS Request failed with status ${ttsResponse.status}: ${errText}`);
            updateAiStatus("TTS Error", "error");
          }
        } catch (e) {
          console.error("TTS Fetch failed:", e);
          updateAiStatus("TTS Network Error", "error");
        }
        updateAiStatus("Ready", "idle");
      }
    }
 else if (data.type === "error") {
      aiErrorEl.textContent = data.content;
      updateAiStatus("Error", "error");
    }
  };
  
  socket.onclose = () => {
    console.log("WebSocket closed, retrying...");
    setTimeout(initWebSocket, 2000);
  };
};

const requestAiReply = (text) => {
  const userId = userIdInput.value.trim() || DEFAULT_USER_ID;

  updateAiStatus("Thinking…", "listening");
  aiErrorEl.textContent = "None";
  updateReply("");
  clearReplyAudio();

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      userId,
      message: text,
      history: []
    }));
  } else {
    // Fallback to HTTP if socket is down
    requestAiReplyHttp(text);
  }
};

const requestAiReplyHttp = async (text) => {
  // Existing implementation for robustness
  let aiUrl = aiUrlInput.value.trim() || DEFAULT_AI_URL;
  const userId = userIdInput.value.trim() || DEFAULT_USER_ID;
  try {
    const response = await fetch(aiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message: text, history: [] })
    });
    const { replyText } = await parseAiResponse(response);
    updateReply(replyText);
    const ttsUrl = ttsUrlInput.value.trim();
    if (ttsUrl) {
      const ttsResponse = await fetch(ttsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText })
      });
      await handleTtsResponse(ttsResponse);
    }
  } catch (error) {
    aiErrorEl.textContent = error.message;
    updateAiStatus("Error", "error");
  }
};

initWebSocket();

const appendTranscript = (finalText, interimText) => {
  // Use a temporary container for interim results to avoid polluting the main transcript
  let interimEl = transcriptEl.querySelector(".interim-row");
  if (!interimEl) {
    interimEl = document.createElement("div");
    interimEl.className = "interim-row";
    transcriptEl.appendChild(interimEl);
  }

  if (finalText) {
    const finalEl = document.createElement("div");
    finalEl.className = "final-row";
    finalEl.textContent = finalText;
    transcriptEl.insertBefore(finalEl, interimEl);
    // Keep only last 5 lines for clean UI
    while (transcriptEl.children.length > 6) {
      transcriptEl.removeChild(transcriptEl.firstChild);
    }
  }

  interimEl.textContent = interimText;
  
  // Auto-scroll to bottom
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
};

const setupRecognition = () => {
  if (!SpeechRecognition) {
    updateStatus("STT Not Supported", "error");
    errorEl.textContent = "Web Speech API not supported in this browser.";
    return;
  }

  recognition = new SpeechRecognition();
  // Try ne-NP, fallback to en-US if needed
  recognition.lang = "ne-NP";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    setButtons(true);
    updateStatus("Listening…", "listening");
    console.log("STT Started");
  };

  recognition.onend = () => {
    isListening = false;
    setButtons(false);
    updateStatus("Idle", "idle");
    console.log("STT Ended");
    if (AUTO_START_LISTENING && !autoRestartBlocked) {
      setTimeout(() => startListening(), 500);
    }
  };

  recognition.onerror = (event) => {
    handleError(event);
  };

  recognition.onresult = (event) => {
    let finalText = "";
    let interimText = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result[0].transcript.trim();

      if (result.isFinal) {
        finalText += transcript + " ";
      } else {
        interimText += transcript + " ";
      }
    }

    appendTranscript(finalText.trim(), interimText.trim());

    const combinedText = (finalText + interimText).toLowerCase();
    const hasWakeWord = /careplus|care plus|केयर प्लस/i.test(combinedText);
    
    if (wakeWordToggle.checked && hasWakeWord) {
      // Check for voice commands right after the wake word
      if (combinedText.includes("sleep") || combinedText.includes("सुत")) {
        console.log("Voice Command: Sleep");
        deactivateAssistant();
        return;
      }
      if (combinedText.includes("clear") || combinedText.includes("मेटाऊ")) {
        console.log("Voice Command: Clear");
        clearBtn.click();
        deactivateAssistant();
        return;
      }
      if (combinedText.includes("stop") || combinedText.includes("रोक")) {
        console.log("Voice Command: Stop");
        stopBtn.click();
        return;
      }
      
      activateAssistant();
    }

    if (finalText.trim()) {
      lastFinalTranscript = finalText.trim();
      
      // Secondary check for final commands if they weren't caught in interim
      const lowerFinal = lastFinalTranscript.toLowerCase();
      if (hasWakeWord) {
        if (lowerFinal.includes("sleep") || lowerFinal.includes("सुत") ||
            lowerFinal.includes("clear") || lowerFinal.includes("मेटाऊ") ||
            lowerFinal.includes("stop") || lowerFinal.includes("रोक")) {
          return; // Already handled or should be ignored as query
        }
      }

      // Reset the 10-minute timer on any speech that isn't just a command
      if (isActivated && !hasWakeWord) {
        console.log("Activity detected - Resetting 10 min timer");
        activateAssistant();
      }

      if (autoReplyToggle.checked) {
        const isWakeWordEnabled = wakeWordToggle && wakeWordToggle.checked;
        const shouldReply = !isWakeWordEnabled || isActivated;
        
        if (shouldReply) {
          // Strip wake word for the query
          const query = isWakeWordEnabled 
            ? lastFinalTranscript.replace(/careplus|care plus|केयर प्लस/gi, "").trim()
            : lastFinalTranscript;
          
          if (query) {
            console.log("Triggering AI reply for:", query, "Activated:", isActivated);
            requestAiReply(query);
            // No longer deactivating here; stay active for 10 minutes
          }
        }
      }
    }
  };
};

const startListening = () => {
  if (!recognition) {
    setupRecognition();
  }

  if (!recognition || isListening) {
    return;
  }

  recognition.continuous = continuousToggle.checked;
  recognition.interimResults = interimToggle.checked;
  errorEl.textContent = "None";
  try {
    recognition.start();
  } catch (error) {
    errorEl.textContent = "Failed to start recognition. Try reloading the page.";
    updateStatus("Error", "error");
    console.error("SpeechRecognition start error:", error);
  }
};

const armUserGestureStart = () => {
  const handler = () => {
    startListening();
  };

  window.addEventListener("click", handler, { once: true });
  window.addEventListener("keydown", handler, { once: true });
  window.addEventListener("touchstart", handler, { once: true });
};

const autoStartListening = () => {
  if (!AUTO_START_LISTENING) {
    return;
  }

  startListening();
  setTimeout(() => {
    if (!isListening && !autoRestartBlocked) {
      updateStatus("Tap anywhere to start listening", "idle");
      armUserGestureStart();
    }
  }, 400);
};

startBtn.addEventListener("click", () => {
  startListening();
});

stopBtn.addEventListener("click", () => {
  if (recognition && isListening) {
    recognition.stop();
  }
  deactivateAssistant();
});

clearBtn.addEventListener("click", () => {
  transcriptEl.innerHTML = "";
  errorEl.textContent = "None";
  updateReply("");
  aiErrorEl.textContent = "None";
  updateAiStatus("Idle", "idle");
  clearReplyAudio();
});

askBtn.addEventListener("click", () => {
  if (!lastFinalTranscript) {
    aiErrorEl.textContent = "Speak first or select auto reply.";
    updateAiStatus("Error", "error");
    return;
  }

  requestAiReply(lastFinalTranscript);
});

aiUrlInput.addEventListener("change", () => {
  saveSetting("aiUrl", aiUrlInput.value.trim());
});

userIdInput.addEventListener("change", () => {
  saveSetting("userId", userIdInput.value.trim());
});

ttsUrlInput.addEventListener("change", () => {
  saveSetting("ttsUrl", ttsUrlInput.value.trim());
});

continuousToggle.addEventListener("change", () => {
  if (recognition) {
    recognition.continuous = continuousToggle.checked;
  }
});

interimToggle.addEventListener("change", () => {
  if (recognition) {
    recognition.interimResults = interimToggle.checked;
  }
});

wakeWordToggle.addEventListener("change", () => {
  if (!wakeWordToggle.checked) {
    deactivateAssistant();
    activationIndicator.textContent = "Disabled";
  } else {
    activationIndicator.textContent = "Sleeping";
  }
});

setupRecognition();

aiUrlInput.value = loadSetting("aiUrl", DEFAULT_AI_URL);
ttsUrlInput.value = loadSetting("ttsUrl", DEFAULT_TTS_URL);
userIdInput.value = loadSetting("userId", DEFAULT_USER_ID);
autoReplyToggle.checked = AUTO_REPLY_ENABLED;
wakeWordToggle.checked = true; // Default to ON as per user request
replyAudio.autoplay = AUTO_PLAY_AUDIO;
updateAiStatus("Idle", "idle");
autoStartListening();
