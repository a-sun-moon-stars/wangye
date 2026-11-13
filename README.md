# 今日待办

原生 HTML/CSS/JS 的待办清单，任务数据通过 `fetch` 调用 Flask 接口（[runoob-flask-test](https://github.com/a-sun-moon-stars/runoob-flask-test)），不再写死 JSON 或存在 localStorage。

- 线上页面：https://a-sun-moon-stars.github.io/wangye/
- 仓库：https://github.com/a-sun-moon-stars/wangye

## 页面

| 页面 | 内容 |
| --- | --- |
| `index.html` | 今日进度、Tab 筛选、任务列表、新建/编辑/删除 |
| `detail.html` | 单条任务的步骤、备注、完成状态 |

## 功能

- 三个 Tab：全部、进行中、已完成，支持鼠标和键盘。
- 增删改查全部走接口：`GET` / `POST` / `PUT` / `DELETE` `/api/items`。
- 加载中、空数据、请求失败三种状态都有界面；失败时显示原因和「重试」按钮。
- 新建、删除、勾选完成后自动重新拉取列表，按 F5 数据仍在。
- 接口地址集中在 `js/config.js`，业务代码里不写死地址。

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
