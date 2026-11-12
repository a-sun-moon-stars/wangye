/*
 * 接口地址配置。
 * 页面和接口分开部署时，只改这一处；业务代码里不出现具体地址。
 * 线上部署：后端在 PythonAnywhere，前端在 GitHub Pages（两边都是 https）。
 * 本地开发：页面用 python -m http.server 8000 打开，用 ?api=http://127.0.0.1:5000
 * 临时指回本地 Flask，业务代码不用改。
 */
window.TODO_API_CONFIG = (function () {
  // 调试时可以用 ?api=http://127.0.0.1:5000 覆盖，正式部署不用带参数。
  var override = new URLSearchParams(window.location.search).get("api");
  return {
    baseUrl: override || "https://sunmoonstars.pythonanywhere.com",
    timeoutMs: 8000
  };
})();
