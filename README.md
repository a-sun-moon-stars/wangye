# 今日待办

原生 HTML/CSS/JS 的待办清单 + 任务助手。数据全部来自 Flask 接口（[runoob-flask-test](https://github.com/a-sun-moon-stars/runoob-flask-test)），对话走 `/api/chat`，Key 只在服务端。

- 线上：https://a-sun-moon-stars.github.io/wangye/
- 对话页：https://a-sun-moon-stars.github.io/wangye/chat.html
- 仓库：https://github.com/a-sun-moon-stars/wangye

## 使用方法

线上直接打开上面的地址。本地跑：

```bash
# 终端 1：后端（见 runoob-flask-test 仓库）
cd C:\Users\zhc\runoob-flask-test && python app.py

# 终端 2：静态页
cd web-phase4-todo && python -m http.server 8000
```

打开 `http://localhost:8000/index.html?api=http://127.0.0.1:5000`。不带 `?api=` 时连线上接口；地址集中在 `js/config.js`，业务代码不写死。

- 清单页：新建、编辑、删除、勾选完成，列表自动刷新，F5 后数据仍在；加载中、空数据、请求失败（带「重试」）三种状态都有界面。
- 对话页：Enter 发送、Shift + Enter 换行，回答逐字出现，「停止生成」可中断；保留最近 3 轮上下文；Key 无效、限流、余额不足、超时会显示中文原因，页面不白屏。
- 工具调用：说「帮我加一条明天交实验报告」，模型会调 `add_item` 写库，底部「工具调用日志」显示工具名、参数、耗时和执行结果。

## CORS 记录

接口没有跨域头时，浏览器控制台原文：

```text
Access to fetch at 'http://127.0.0.1:5002/api/items' from origin 'http://127.0.0.1:8000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

页面上只显示「连不上接口服务…」，看不出是跨域。后端 `app.py` 用 `after_request` 回显 `Origin`、`OPTIONS` 预检返回 `204`，没有改浏览器安全策略。

## 产出物

| 要求 | 位置 |
| --- | --- |
| 线上可操作页面 | https://a-sun-moon-stars.github.io/wangye/ |
| 三态截图 | `screenshots/task3-loading.png`、`task3-empty.png`、`task3-error.png`、`task3-success.png` |
| 对话页 | https://a-sun-moon-stars.github.io/wangye/chat.html |
| 对话页线上验收 | `screenshots/task4-online.png` |
| 流式输出与停止生成 | `screenshots/task4-stream.gif`（录屏）、`task4-stream.png`、`task4-stop.png` |
| 出错提示 | `screenshots/task4-error.png` |
| Key 不进仓库 | `screenshots/task4-key-safe.png`；后端 `.env.example`、`.gitignore` |
| 工具调用完整链路 | `screenshots/task5-chain.png`（本地）、`task5-online.png`（线上） |
| 调用前后数据 | `screenshots/task5-before.png`、`task5-after.png` |
| 工具定义与失败案例 | 后端仓库 README「工具调用」「失败案例」 |
| 接口文档表 / 参数校验 / 错误码 | 后端仓库 README |
