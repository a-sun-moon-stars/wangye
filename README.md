# 今日待办

一个用原生 HTML、CSS 和 JavaScript 写的待办清单，采用 GitHub Dark 配色，带克制的液态玻璃质感和场景进度卡。任务数据来自本仓库配套的 Flask 接口，不再是写死的 JSON 或 localStorage。

- 线上地址：https://a-sun-moon-stars.github.io/wangye/
- 仓库地址：https://github.com/a-sun-moon-stars/wangye

## 页面

| 页面 | 内容 |
| --- | --- |
| `index.html` | 今日进度、Tab 筛选、任务列表、新建/编辑/删除 |
| `detail.html` | 单条任务的步骤、备注、完成状态和上下篇 |

## 功能

- 三个筛选 Tab：全部、进行中、已完成，支持鼠标和键盘操作。
- 数据全部通过 `fetch` 调接口：`GET /api/items` 读列表，`POST` 新建，`PUT` 更新，`DELETE` 删除。
- 加载中、空数据、请求失败三种状态都有对应界面；失败时显示原因和「重试」按钮。
- 新建、编辑、删除、勾选完成后自动重新拉取列表，按 F5 数据仍在。
- 任务可设置标题、描述、标签、优先级、日期、时间、预计用时、步骤和备注。
- 接口地址集中在 `js/config.js`，页面地址后加 `?api=...` 可临时覆盖，业务代码里不写死。
- 375px 宽度下无横向滚动，任务标题和摘要自动换行。

## 截图

| 文件 | 内容 | 尺寸 | 大小 |
| --- | --- | --- | --- |
| `screenshots/task3-default.png` | 默认配置连 5000，接口返回两条任务 | 1440 × 1000 | 542KB |
| `screenshots/task3-empty.png` | 接口返回空列表 | 1440 × 1000 | 533KB |
| `screenshots/task3-success.png` | 前端 fetch 接口后渲染列表 | 1440 × 1000 | 555KB |
| `screenshots/task3-loading.png` | 加载中 | 1440 × 1000 | 535KB |
| `screenshots/task3-error.png` | 请求失败与重试按钮 | 1440 × 1000 | 547KB |
| `screenshots/task3-online-create.png` | 线上页面（GitHub Pages）写入线上接口（PythonAnywhere） | 1440 × 1000 | 522KB |
| `screenshots/task3-live.png` | 线上页面读取线上接口数据，F5 后仍在 | 1440 × 1000 | 518KB |
| `screenshots/desktop.png` | 电脑端首页 | 1440 × 900 | 185KB |
| `screenshots/desktop-full.png` | 电脑端首页整页 | 1440 × 1289 | 206KB |
| `screenshots/detail.jpg` | 详情页 | 1440 × 900 | 91KB |
| `screenshots/detail-full.jpg` | 详情页整页 | 1440 × 1143 | 109KB |
| `screenshots/mobile.jpg` | 手机端首页，375px 宽 2x | 750 × 1624 | 101KB |
| `screenshots/mobile-full.jpg` | 手机端整页 | 750 × 4760 | 267KB |
| `screenshots/network-404.png` | 本地服务器的 404 响应页 | 1440 × 900 | 6KB |

## 本地运行

先启动接口（见 `runoob-flask-test` 仓库，Flask + SQLite，默认 `http://127.0.0.1:5000`）：

```powershell
cd C:\Users\zhc\runoob-flask-test
.\.venv\Scripts\Activate.ps1
python app.py
```

再在项目根目录启动静态服务：

```bash
python -m http.server 8000
```

访问 `http://localhost:8000`。页面和接口不同源，接口返回的 CORS 头允许跨域，这是联调正常工作的前提。

如果接口换了端口，或需要指向线上后端，在页面地址后加参数即可，无需改代码：

```text
http://localhost:8000/index.html?api=http://127.0.0.1:5001
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

`js/api.js` 只读这份配置发请求，超时 8 秒，统一解析 `{code, data, msg}`。默认值已经是线上接口地址，GitHub Pages 打开时直接连 PythonAnywhere；本地调试时用 `?api=http://127.0.0.1:5000` 临时指回本地 Flask，业务代码不用动。

## 数据

任务存在后端的 `app.db`（SQLite）里。`items` 表字段：`id`、`title`、`done`、`created_at`，以及 `extra`（JSON 文本，保存 `summary`、`tag`、`priority`、`dueDate`、`dueTime`、`estimateMinutes`、`steps`、`note`）。接口返回时把 `extra` 合并进对象，前端不需要关心存储细节。

## 三种状态

- 加载中：列表上方出现「正在从接口加载清单…」，请求结束后消失。
- 空数据：接口返回空数组时显示「今天还没有任务」，不显示错误提示。
- 请求失败：列表清空，显示「连不上接口服务（地址）…」，并提供「重试」按钮；点击后重新发起请求。

## CORS 记录

页面跑在 `http://127.0.0.1:8000`，接口跑在 `http://127.0.0.1:5000`，跨源。接口没有返回跨域头时浏览器控制台的原始报错：

```text
Access to fetch at 'http://127.0.0.1:5002/api/items' from origin 'http://127.0.0.1:8000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
Failed to load resource: net::ERR_FAILED
```

页面表现是 fetch 抛 `TypeError: Failed to fetch`，列表区只显示错误提示，看不出是跨域问题。

前端代码里的表现：

```text
连不上接口服务（http://127.0.0.1:5002）。请确认后端已启动，并检查页面和接口的协议、端口是否一致。
```

解决方式在后端 `app.py`，用 `after_request` 统一回显 `Origin`，并给 `OPTIONS` 预检返回 204：

```python
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Max-Age"] = "86400"
    return response
```

验证：

```bash
curl.exe -i -X OPTIONS http://127.0.0.1:5000/api/items -H "Origin: http://localhost:8000" -H "Access-Control-Request-Method: POST"
```

响应应为 `204`，并带 `Access-Control-Allow-Origin: http://localhost:8000`。没有改浏览器安全策略，也没有用代理绕过。

## 部署

前后端分开部署，两边都是 https：

- 后端：PythonAnywhere，https://sunmoonstars.pythonanywhere.com
- 前端：GitHub Pages，https://a-sun-moon-stars.github.io/wangye/

后端步骤（免费账号即可）：

1. Files 里建 `/home/USERNAME/runoob-flask-test`，上传后端的 `app.py`。
2. Web → Add a new web app → Manual configuration，项目路径填 `/home/USERNAME/runoob-flask-test`。
3. WSGI 配置文件用后端仓库里的 `pythonanywhere_wsgi.py` 内容替换，`USERNAME` 改成自己的用户名。
4. Reload，访问 `https://USERNAME.pythonanywhere.com/api/items` 确认返回 `{"code":0,...}`。

前端只需把 `js/config.js` 的默认 `baseUrl` 指向后端地址，提交并推送，GitHub Pages 会自动更新。页面是 https，接口也必须是 https，否则浏览器会按混合内容拦截，表现就是「本地好好的、线上白屏」。

线上验收：打开 https://a-sun-moon-stars.github.io/wangye/ ，列表里能看到 PythonAnywhere 数据库里的任务；新建或删除后列表会重新拉取，按 F5 数据仍在。

## 抓包记录

本地 Python 服务下的请求记录（任务一阶段，接口尚未接入）：

| # | 请求 | 类型 | Method / Status | 耗时 |
| --- | --- | --- | --- | --- |
| 1 | `index.html` | Document | GET / 200 | 3ms |
| 2 | `css/style.css` | Stylesheet | GET / 200 | 4ms |
| 3 | `data/tasks.json` | Fetch | GET / 200 | 2ms |
| 附 | `data/not-found.json` | Document | GET / 404 | 3ms |

完整记录见 [`docs/抓包记录.md`](docs/抓包记录.md)。

## 目录

```text
wangye/
├── index.html
├── detail.html
├── css/
│   ├── style.css
│   ├── refresh.css
│   └── api-state.css
├── js/
│   ├── config.js
│   ├── api.js
│   ├── utils.js
│   ├── store.js
│   ├── editor.js
│   ├── app.js
│   ├── detail.js
│   └── tasks-data.js
├── data/
│   └── tasks.json
├── assets/
│   └── progress-bg.jpg
├── docs/
│   └── 抓包记录.md
├── screenshots/
│   ├── task3-default.png
│   ├── task3-empty.png
│   ├── task3-success.png
│   ├── task3-loading.png
│   ├── task3-error.png
│   ├── desktop.png
│   ├── desktop-full.png
│   ├── detail.jpg
│   ├── detail-full.jpg
│   ├── mobile.jpg
│   └── mobile-full.jpg
├── .nojekyll
├── favicon.ico
└── README.md
```

## 素材

进度卡背景来自本地 Wallpaper Engine 场景《鸣潮 守岸人》视频第 3.6 秒的一帧，压缩为 1600 × 900 的静态 JPG，仅用于个人作业演示。素材版权归原作者。
