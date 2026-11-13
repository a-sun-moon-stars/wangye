# 今日待办

原生 HTML/CSS/JS 的待办清单，任务数据通过 `fetch` 调用 Flask 接口（[runoob-flask-test](https://github.com/a-sun-moon-stars/runoob-flask-test)），不再写死 JSON 或存在 localStorage。

- 线上页面：https://a-sun-moon-stars.github.io/wangye/
- 仓库：https://github.com/a-sun-moon-stars/wangye

## 页面

| 页面 | 内容 |
| --- | --- |
| `index.html` | 今日进度、Tab 筛选、任务列表、新建/编辑/删除 |
| `detail.html` | 单条任务的步骤、备注、完成状态 |
| `chat.html` | 任务助手：流式对话、3 轮上下文、停止生成 |

## 功能

- 三个 Tab：全部、进行中、已完成，支持鼠标和键盘。
- 增删改查全部走接口：`GET` / `POST` / `PUT` / `DELETE` `/api/items`。
- 加载中、空数据、请求失败三种状态都有界面；失败时显示原因和「重试」按钮。
- 新建、删除、勾选完成后自动重新拉取列表，按 F5 数据仍在。
- 接口地址集中在 `js/config.js`，业务代码里不写死地址。
- 对话页把消息发给后端 `/api/chat`，后端转发大模型并流式回传；Key 不在前端。

## 对话页

线上：https://a-sun-moon-stars.github.io/wangye/chat.html

本地：先按上面的步骤起后端和静态服务，打开 `http://localhost:8000/chat.html?api=http://127.0.0.1:5000`。

- 输入框 Enter 发送、Shift + Enter 换行；回答逐字出现，生成中「停止生成」可中断。
- 前端只保留最近 3 轮上下文；后端再加一道 6000 字符上限，超了从最早的消息丢。
- 失败时气泡和顶部提示都显示中文原因（Key 无效、限流、余额不足、超时、连不上），页面不白屏。
- 系统提示词在服务端，角色限定为整理待办，回答不超过 200 字。

线上验收：连发「我叫小明，记住这个名字」→「我叫什么？」，回答「小明」，底部显示「上下文保留最近 3 轮（当前 2 轮）」，没有报错横幅（截图 `screenshots/task4-online.png`）。

## 本地运行

先启动接口（另开一个终端）：

```powershell
cd C:\Users\zhc\runoob-flask-test
.\.venv\Scripts\Activate.ps1
python app.py
```

再启动静态服务：

```bash
python -m http.server 8000
```

访问 `http://localhost:8000`。页面和接口不同源，跨域由接口的 CORS 头放行。

接口默认指向线上 `https://sunmoonstars.pythonanywhere.com`；要连本地 Flask，在地址后加参数：

```text
http://localhost:8000/index.html?api=http://127.0.0.1:5000
```

## 接口地址配置

`js/config.js`：

```js
window.TODO_API_CONFIG = (function () {
  var override = new URLSearchParams(location.search).get("api");
  return {
    baseUrl: override || "https://sunmoonstars.pythonanywhere.com",
    timeoutMs: 8000
  };
})();
```

`js/api.js` 只读这份配置发请求，8 秒超时，统一解析 `{code, data, msg}`。

## 三种状态

- 加载中：列表上方出现「正在从接口加载清单…」。
- 空数据：显示「今天还没有任务」，不显示错误。
- 请求失败：列表清空，显示「连不上接口服务（地址）…」和「重试」按钮。

## CORS 记录

接口没有返回跨域头时，浏览器控制台原文：

```text
Access to fetch at 'http://127.0.0.1:5002/api/items' from origin 'http://127.0.0.1:8000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

页面上只显示「连不上接口服务…」，看不出是跨域。后端 `app.py` 用 `after_request` 回显 `Origin`，并让 `OPTIONS` 预检返回 `204`，没有改浏览器安全策略。

## 部署

后端在 PythonAnywhere（https://sunmoonstars.pythonanywhere.com），前端在 GitHub Pages。两边都是 https，否则会被浏览器按混合内容拦截，表现就是「本地好好的、线上白屏」。

线上验收：打开 https://a-sun-moon-stars.github.io/wangye/ 能看到库里的任务，新建或删除后列表重新拉取，F5 数据仍在。

## 产出物

| 要求 | 位置 |
| --- | --- |
| 线上可操作页面 | https://a-sun-moon-stars.github.io/wangye/ |
| 三态截图 | `screenshots/task3-loading.png`、`task3-empty.png`、`task3-error.png`、`task3-success.png` |
| 接口文档表 | 后端仓库 README 的「接口列表」 |
| 参数校验与错误码 | 后端仓库 README 的「参数校验」「错误返回」 |
| CORS 问题记录 | 本文「CORS 记录」 |
| 对话页 | https://a-sun-moon-stars.github.io/wangye/chat.html |
| 对话页线上验收 | `screenshots/task4-online.png` |
| 流式输出与停止生成 | `screenshots/task4-stream.gif`（录屏）、`task4-stream.png`、`task4-stop.png` |
| 出错提示 | `screenshots/task4-error.png` |
| Key 不进仓库 | `screenshots/task4-key-safe.png`；后端仓库 `.env.example`、`.gitignore`（`.env` 已忽略） |
