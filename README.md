# 今日待办
一个用原生 HTML、CSS 和 JavaScript 写的静态待办清单，采用 GitHub Dark 配色，带克制的液态玻璃质感和场景进度卡。
- 线上地址：https://a-sun-moon-stars.github.io/wangye/
- 仓库地址：https://github.com/a-sun-moon-stars/wangye
## 页面
| 页面 | 内容 |
| --- | --- |
| `index.html` | 今日进度、Tab 筛选、任务列表、新建/编辑/删除 |
| `detail.html` | 单条任务的步骤、备注、完成状态和上下篇 |
## 功能
- 三个筛选 Tab：全部、进行中、已完成，支持鼠标和键盘操作。
- 勾选任务后更新进度环、数量和时间线；状态保存在 `localStorage`。
- 新建、编辑、删除任务，删除前有确认弹窗。
- 任务可设置标题、描述、标签、优先级、日期、时间、预计用时、步骤和备注。
- 清单与详情页共享完成状态，详情页也支持编辑和删除。
- 375px 宽度下无横向滚动，任务标题和摘要自动换行。
- 任务数据通过 `fetch("data/tasks.json")` 读取，请求失败或直接以 `file://` 打开时使用 `js/tasks-data.js` 兜底。
## 截图
| 文件 | 内容 | 尺寸 | 大小 |
| --- | --- | --- | --- |
| `screenshots/desktop.png` | 电脑端首页 | 1440 × 900 | 185KB |
| `screenshots/desktop-full.png` | 电脑端首页整页 | 1440 × 1289 | 206KB |
| `screenshots/detail.jpg` | 详情页 | 1440 × 900 | 91KB |
| `screenshots/detail-full.jpg` | 详情页整页 | 1440 × 1143 | 109KB |
| `screenshots/mobile.jpg` | 手机端首页，375px 宽 2x | 750 × 1624 | 101KB |
| `screenshots/mobile-full.jpg` | 手机端整页 | 750 × 4760 | 267KB |
| `screenshots/network-404.png` | 本地服务器的 404 响应页 | 1440 × 900 | 6KB |
## 本地运行
在项目根目录启动一个静态文件服务：
```bash
python -m http.server 8000
```
访问 `http://localhost:8000`。
直接双击 `index.html` 也能看到页面，但 `fetch` 会被浏览器的同源策略拦截，任务数据会走本地兜底。
## 数据
任务内容存放在 `data/tasks.json`，初始有0条。完成状态保存在：
```text
morrow.todo.done.v1
```
新建、编辑或删除后，整份任务列表保存在：
```text
morrow.todo.tasks.v1
```
需要恢复初始任务时，在控制台执行：
```js
localStorage.removeItem("morrow.todo.tasks.v1");
```
## 抓包记录
本地 Python 服务下的请求记录：
| # | 请求 | 类型 | Method / Status | 耗时 |
| --- | --- | --- | --- | --- |
| 1 | `index.html` | Document | GET / 200 | 3ms |
| 2 | `css/style.css` | Stylesheet | GET / 200 | 4ms |
| 3 | `data/tasks.json` | Fetch | GET / 200 | 2ms |
| 附 | `data/not-found.json` | Document | GET / 404 | 3ms |
完整记录见 [`docs/抓包记录.md`](docs/抓包记录.md)。
## 发布
站点通过 GitHub Pages 从 `main` 分支根目录发布。代码更新提交到 `main` 后，Pages 会自动重新构建。
- 仓库：https://github.com/a-sun-moon-stars/wangye
- 线上：https://a-sun-moon-stars.github.io/wangye/
## 目录
```text
wangye/
├── index.html
├── detail.html
├── css/
│   ├── style.css
│   └── refresh.css
├── js/
│   ├── tasks-data.js
│   ├── utils.js
│   ├── store.js
│   ├── editor.js
│   ├── app.js
│   └── detail.js
├── data/
│   └── tasks.json
├── assets/
│   └── progress-bg.jpg
├── docs/
│   └── 抓包记录.md
├── screenshots/
│   ├── desktop.png
│   ├── desktop-full.png
│   ├── detail.jpg
│   ├── detail-full.jpg
│   ├── mobile.jpg
│   ├── mobile-full.jpg
│   └── network-404.png
├── .nojekyll
├── favicon.ico
└── README.md
```

