(function () {
  "use strict";

  var MAX_HISTORY = 6; // 3 轮（user + assistant）
  var config = (window.TODO_API_CONFIG || {}).baseUrl || "";
  var endpoint = config.replace(/\/$/, "") + "/api/chat";

  var log = document.getElementById("chat-log");
  var empty = document.getElementById("chat-empty");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  var sendBtn = document.getElementById("chat-send");
  var stopBtn = document.getElementById("chat-stop");
  var hint = document.getElementById("chat-hint");
  var errorBox = document.getElementById("chat-error");
  var errorText = document.getElementById("chat-error-text");

  var history = [];
  var controller = null;
  var busy = false;

  function setBusy(value) {
    busy = value;
    sendBtn.disabled = value;
    input.readOnly = value;
    stopBtn.disabled = !value;
  }

  function updateHint() {
    var rounds = Math.ceil(history.length / 2);
    hint.textContent = "上下文保留最近 3 轮（当前 " + rounds + " 轮）";
  }

  function showError(message) {
    errorText.textContent = message;
    errorBox.hidden = false;
  }

  function hideError() {
    errorBox.hidden = true;
    errorText.textContent = "";
  }

  function scrollToBottom() {
    log.scrollTop = log.scrollHeight;
  }

  function addMessage(role, text) {
    if (empty) {
      empty.remove();
      empty = null;
    }
    var wrap = document.createElement("div");
    wrap.className = "chat-msg " + role;

    var label = document.createElement("div");
    label.className = "chat-role";
    label.textContent = role === "user" ? "你" : "助手";

    var bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;

    wrap.appendChild(label);
    wrap.appendChild(bubble);
    log.appendChild(wrap);
    scrollToBottom();
    return { wrap: wrap, bubble: bubble };
  }

  function parseEvent(raw, handlers) {
    var lines = raw.split("\n");
    var event = "message";
    var data = [];
    lines.forEach(function (line) {
      if (line.indexOf("event:") === 0) {
        event = line.slice(6).trim();
      } else if (line.indexOf("data:") === 0) {
        data.push(line.slice(5).replace(/^ /, ""));
      }
    });
    if (!data.length) return;
    var payload = data.join("\n");
    if (payload === "[DONE]") {
      handlers.done = true;
      return;
    }
    var parsed;
    try {
      parsed = JSON.parse(payload);
    } catch (err) {
      return;
    }
    if (event === "error") {
      if (handlers.onerror) handlers.onerror(parsed.msg || "生成失败");
    } else if (parsed.delta) {
      handlers.delta(parsed.delta);
    }
  }

  async function sendMessage(text) {
    if (busy || !text.trim()) return;
    hideError();
    setBusy(true);

    addMessage("user", text);
    history.push({ role: "user", content: text });
    var bubble = addMessage("assistant", "");
    bubble.bubble.className = "chat-bubble streaming";
    controller = new AbortController();

    var answer = "";
    var failure = null;
    var done = false;

    try {
      var res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok) {
        var message = "请求失败（HTTP " + res.status + "）";
        try {
          var body = await res.json();
          if (body && body.msg) message = body.msg;
        } catch (err) {
          /* 非 JSON 响应，用默认文案 */
        }
        throw new Error(message);
      }

      if (!res.body) {
        throw new Error("当前浏览器不支持流式读取");
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder("utf-8");
      var buffer = "";

      while (!done) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });

        var index;
        while ((index = buffer.indexOf("\n\n")) >= 0) {
          var raw = buffer.slice(0, index);
          buffer = buffer.slice(index + 2);
          parseEvent(raw, {
            delta: function (piece) {
              answer += piece;
              bubble.bubble.textContent = answer;
              scrollToBottom();
            },
            onerror: function (msg) {
              failure = msg;
            },
          });
          if (failure) {
            await reader.cancel();
            done = true;
            break;
          }
          if (done) break;
        }
      }
    } catch (err) {
      if (err && err.name === "AbortError") {
        failure = "已停止生成";
      } else {
        failure = (err && err.message) || "请求失败";
      }
    } finally {
      controller = null;
      setBusy(false);
    }

    bubble.bubble.classList.remove("streaming");

    if (failure) {
      bubble.wrap.classList.add("error");
      bubble.bubble.textContent = answer ? answer + "\n\n[" + failure + "]" : failure;
      showError(failure);
      if (answer) {
        history.push({ role: "assistant", content: answer });
      }
    } else if (answer) {
      history.push({ role: "assistant", content: answer });
      bubble.bubble.textContent = answer;
    } else {
      bubble.wrap.classList.add("error");
      bubble.bubble.textContent = "模型没有返回内容，再试一次。";
      showError("模型没有返回内容，再试一次。");
    }

    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }
    updateHint();
    input.focus();
  }

  // 事件绑定 ------------------------------------------------------------
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = input.value;
    input.value = "";
    sendMessage(text);
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  stopBtn.addEventListener("click", function () {
    if (controller) controller.abort();
  });

  document.getElementById("chat-error-close").addEventListener("click", hideError);

  updateHint();
})();
