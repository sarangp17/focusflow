const WS_URL = "ws://localhost:8765";
let socket = null;
let reconnectInterval = null;

// ─── Connect to Python backend ────────────────────────────────
function connect() {
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("FocusFlow: Connected to backend");
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  };

  socket.onclose = () => {
    console.log("FocusFlow: Disconnected. Retrying in 5s...");
    socket = null;
    if (!reconnectInterval) {
      reconnectInterval = setInterval(connect, 5000);
    }
  };

  socket.onerror = (err) => {
    console.log("FocusFlow: WebSocket error", err);
    socket = null;
  };
}

// ─── Send tab info to backend ─────────────────────────────────
function sendTabInfo(tab) {
  if (!tab || !tab.url) return;

  // Ignore internal browser pages
  if (tab.url.startsWith("chrome://") || 
      tab.url.startsWith("chrome-extension://") ||
      tab.url.startsWith("about:")) return;

  const payload = JSON.stringify({
    url: tab.url,
    title: tab.title || "",
    timestamp: new Date().toISOString()
  });

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(payload);
    console.log("FocusFlow: Sent →", tab.url);
  }
}

// ─── Listen for tab events ────────────────────────────────────
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    sendTabInfo(tab);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id === tabId) {
        sendTabInfo(tabs[0]);
      }
    });
  }
});

// ─── Start connection ─────────────────────────────────────────
connect();