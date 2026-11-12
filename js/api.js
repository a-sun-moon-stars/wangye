/*
 * 接口访问层：只负责发请求、解析统一返回、把失败变成可读的错误。
 * 所有请求都走 config.js 里的 baseUrl，业务代码不拼地址。
 */
(function () {
  "use strict";

  var config = window.TODO_API_CONFIG || {};
  var baseUrl = String(config.baseUrl || "").replace(/\/+$/, "");
  var timeoutMs = Number(config.timeoutMs) || 8000;

  function networkHint() {
    return "连不上接口服务（" + (baseUrl || "未配置 baseUrl") + "）。" +
      "请确认后端已启动，并检查页面和接口的协议、端口是否一致。";
  }

  async function request(path, options) {
    options = options || {};
    var controller = new window.AbortController();
    var timer = window.setTimeout(function () {
      controller.abort();
    }, timeoutMs);
    var response;

    try {
      response = await fetch(baseUrl + path, {
        method: options.method || "GET",
        headers: options.body ? { "Content-Type": "application/json" } : {},
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });
    } catch (error) {
      if (error && error.name === "AbortError") {
        throw new Error("请求超时，接口没有在 " + timeoutMs + " 毫秒内响应。");
      }
      throw new Error(networkHint());
    } finally {
      window.clearTimeout(timer);
    }

    var text = await response.text();
    var body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch (error) {
      body = null;
    }

    if (!body || typeof body.code !== "number") {
      throw new Error("接口返回的不是约定的 JSON（HTTP " + response.status + "）。");
    }
    if (!response.ok || body.code !== 0) {
      throw new Error(body.msg || ("请求失败（HTTP " + response.status + "）"));
    }
    return body.data;
  }

  window.TodoApi = {
    baseUrl: baseUrl,
    list: function () {
      return request("/api/items");
    },
    create: function (payload) {
      return request("/api/items", { method: "POST", body: payload });
    },
    update: function (id, payload) {
      return request("/api/items/" + encodeURIComponent(id), { method: "PUT", body: payload });
    },
    remove: function (id) {
      return request("/api/items/" + encodeURIComponent(id), { method: "DELETE" });
    }
  };
})();
