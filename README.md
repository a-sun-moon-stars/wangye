# 今日待办 · wangye

> 26 级第四阶段任务 1：静态页面上线，顺便读懂一次请求。  
> 选题：真实小场景 / 待办清单　·　JS 交互：Tab 切换　·　部署：GitHub Pages

一个不依赖任何框架的静态待办清单，界面采用 GitHub Dark 深色配色（背景 `#0d1117`），顶栏、进度卡、任务卡和编辑弹窗带一层克制的液态玻璃质感：半透明、背景模糊、边缘高光。首页把「全部 / 进行中 / 已完成」放进清单标题行，右侧是「今晚的节奏」时间线；进度卡使用本地壁纸场景静帧，保留深色蒙层保证文字可读。清单默认有 6 件待办；可以筛选、勾选完成，也可以新建、编辑或删除任务。点任务标题进入详情页，可以看到拆解后的完成步骤。页面用原生 HTML、CSS、JavaScript 写成，没有构建步骤，推上 GitHub Pages 就能访问。

---

## 一、提交信息

| 项目 | 内容 |
| --- | --- |
| 仓库链接 | `https://github.com/a-sun-moon-stars/wangye`（已创建，当前为空仓库；Pages 未启用） |
| 线上 URL | `https://a-sun-moon-stars.github.io/wangye/`（尚未启用；上传并开启 Pages 后生效） |
| 电脑端截图 | [`screenshots/desktop.png`](screenshots/desktop.png)（1440×900，185KB） |
| 电脑端整页 | [`screenshots/desktop-full.png`](screenshots/desktop-full.png)（1440×1289，206KB） |
| 详情页截图 | [`screenshots/detail.jpg`](screenshots/detail.jpg)（1440×900，91KB） |
| 详情页整页 | [`screenshots/detail-full.jpg`](screenshots/detail-full.jpg)（1440×1143，109KB） |
| 手机端截图 | [`screenshots/mobile.jpg`](screenshots/mobile.jpg)（750×1624，101KB，375px 宽 2x） |
| 手机端整页 | [`screenshots/mobile-full.jpg`](screenshots/mobile-full.jpg)（750×4760，267KB） |
| 404 截图 | [`screenshots/network-404.png`](screenshots/network-404.png)（真实 404 响应页，6KB） |
| 抓包记录 | [`docs/抓包记录.md`](docs/抓包记录.md)（3 条请求 + 404） |

> 截图由 Edge 在本地真实页面生成，已压到单张 300KB 内。GitHub 账号已按 `a-sun-moon-stars` 填入；仓库 `wangye` 已创建但仍是空仓库，Pages 尚未启用。把本目录最终代码上传到 `main`，再在 Settings → Pages 选择 `main` / root，就能得到线上地址。部署后建议用线上地址重拍，替换同名文件即可。

---

## 二、页面与功能

### 1. 清单页 `index.html`

- 顶部是今天日期、今日进度环、完成件数。
- 三个 Tab：**全部 / 进行中 / 已完成**，带实时数量；支持鼠标点击，也支持键盘 `←` `→` `Home` `End` 切换。
- 勾选任务后：卡片变灰、标题划线、进度环与侧栏统计同步更新；状态写入 `localStorage`，刷新不丢。
- 「重置进度」会清空所有勾选，方便重新演示。
- 每张任务卡都有「编辑 / 删除」；标题旁的「新建任务」可以加一件自己的事。编辑支持标题、描述、标签、优先级、截止日期与时间、预计用时、步骤和备注。
- 删除前会弹二次确认；删除任务时，对应的完成状态也会一起清掉。
- 进度卡背景取自本地 Wallpaper Engine 场景《鸣潮 守岸人》视频第 3.6 秒的一帧，压缩成 1600×900 的静态 JPG；素材版权归原作者，仅作个人作业演示。

### 2. 详情页 `detail.html`

- 通过 `detail.html?id=t1` 读取任务，展示标签、优先级、截止时间、预计用时、完成步骤和一句提示。
- 可以在详情页直接「标记为完成 / 取消勾选」，状态与清单页共享。
- 详情页同样提供「编辑任务 / 删除任务」，改完立即同步到清单页。
- 底部有上一个 / 下一个任务，可以连续翻看。
- 如果 `id` 不存在，会显示一个友好的 404 状态，而不是白屏。

### 3. 数据与交互

- 任务数据首次从 `data/tasks.json` 读取，页面用 `fetch()`，**这是抓包练习里的第 3 条请求**。
- 如果 `fetch` 失败（例如直接双击 HTML、断网），自动退回 `js/tasks-data.js` 里的同一份数据，页面仍能使用。
- 完成状态只存任务 id，键名是 `morrow.todo.done.v1`。
- 新建、编辑或删除后，整份清单会存进 `morrow.todo.tasks.v1`；之后刷新都读这份本地清单。想恢复初始六件任务，在浏览器控制台执行 `localStorage.removeItem("morrow.todo.tasks.v1")` 后刷新即可。
- 首次打开默认把「给窗台的绿萝浇水」标为完成，方便看到进度环的效果；点「重置进度」即可全部清空。

---

## 三、作业要求对照

| 任务书要求 | 实现方式 | 位置 |
| --- | --- | --- |
| 至少 2 个页面，能互相跳转 | 清单页 + 详情页；标题、箭头、页脚都能跳 | `index.html` / `detail.html` |
| 语义化标签 | `header` `nav` `main` `section` `article` `aside` `footer` `figure` `blockquote` | 两个页面 |
| 响应式，375px 不出横向滚动、文字不重叠 | 断点 1100 / 960 / 760 / 620 / 400px；网格降为单列、任务时间移到标题下方、卡片收紧 | `css/style.css` / `css/refresh.css` |
| 至少 1 处 JS 交互 | Tab 筛选 + 勾选完成 + 详情页标记完成 + 键盘操作 | `js/app.js` / `js/detail.js` |
| 图片压缩，单张 300KB 内 | 图标为内联 SVG；进度卡背景为 170KB JPG；favicon.ico 约 6KB；7 张截图均已压到 300KB 内 | `assets/` / `screenshots/` |
| 控制台无红色报错 | 无外部依赖；正常页面实测 Console 为 0 条错误；故意访问 404 时浏览器会记录预期的 404 | `js/store.js` |
| 只允许原生 HTML/CSS/JS | 没有 Vue、React、Tailwind，也没有构建工具 | 全站 |
| 部署到 https 公网地址 | GitHub Pages，详见第五节 | — |
| 抓包记录 3 条 + 404 截图 | 已记录本地实测值，并附真实 404 响应页；步骤见 [`docs/抓包记录.md`](docs/抓包记录.md) | `docs/` |

---

## 四、本地打开方式

### 推荐：起一个本地 HTTP 服务

在项目根目录（也就是本 README 所在目录）执行：

```bash
# Python 3
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

如果 8000 端口被占用，换一个即可：

```bash
python -m http.server 8080
```

也可以用 VS Code 的 **Live Server** 插件，右键 `index.html` → *Open with Live Server*。

> **为什么不建议直接双击 `index.html`？**  
> 双击时浏览器用 `file://` 打开，`fetch('data/tasks.json')` 会被 CORS 拦截，Network 面板里看不到那条 fetch 请求，抓包练习就少了一条。页面本身有兜底数据，仍然能看，但做作业请用 HTTP 服务或线上地址。

### 没有 Python 时

任选其一：

- 用 VS Code 的 Live Server；
- 安装 Node.js 后，在本目录执行 `npx serve .`，按提示打开地址；
- 直接把项目推到 GitHub Pages，用线上地址验收。

---

## 五、部署到 GitHub Pages

> 当前状态（2026-11-11）：公开仓库 `wangye` 已创建，但仍是空仓库，Pages 尚未启用。按方式 A 上传本目录的最终代码，再按第 4～7 步选择 `main` / root；首次发布通常 1～2 分钟。

### 方式 A：网页上传（当前最稳，不用处理 Git 登录）

1. 打开仓库上传页：`https://github.com/a-sun-moon-stars/wangye/upload/main`
2. 把本项目根目录里的这些内容一起拖进去：`index.html`、`detail.html`、`css/`、`js/`、`data/`、`assets/`、`docs/`、`screenshots/`、`README.md`、`favicon.ico`、`.nojekyll`。
   - 拖文件夹会保留目录结构；关键是 `index.html` 必须在仓库根目录，不能变成 `wangye/wangye/index.html`。
   - `.nojekyll` 是隐藏文件，如果系统隐藏了它，可以不上传；本项目没有以下划线开头的文件，GitHub Pages 仍能正常服务。
3. 页面底部填提交信息（例如 `feat: 第四阶段静态待办清单`），点 **Commit changes**。
4. 回到仓库 **Settings → Pages**。
5. **Build and deployment → Source** 选 **Deploy from a branch**。
6. Branch 选 **main**，目录选 **/(root)**，点 **Save**。
7. 等 1～2 分钟，刷新 Pages 页面，顶部会出现：

```text
https://a-sun-moon-stars.github.io/wangye/
```

8. 用电脑和手机各打开一次，确认是 https、能筛选、能进详情页。

### 方式 B：命令行推送（需要先登录 GitHub）

本地已经初始化 git（`main` 分支）、完成首次提交，`origin` 已指向：

`https://github.com/a-sun-moon-stars/wangye.git`

在项目根目录执行：

```bash
git push -u origin main
```

如果提示登录，按 Git Credential Manager 的窗口完成 GitHub 授权；推送成功后按方式 A 的第 4～7 步开启 Pages。

> 本次会话里 Git 的 HTTPS 连接被 Windows 的证书吊销检查拦住（`CRYPT_E_NO_REVOCATION_CHECK`），所以优先用方式 A 网页上传；换一台网络正常的电脑再 push 也可以。
>
> 如果你拿到的是不含 `.git` 的副本，先 `git init -b main`、`git add .`、`git commit -m "feat: 第四阶段静态待办清单"`、`git remote add origin https://github.com/a-sun-moon-stars/wangye.git`，再 push。

### 部署后检查

- [ ] 线上地址是 `https://`，不是 `http://`。
- [ ] 首页能正常显示 6 条任务。
- [ ] Tab 能切换，勾选后进度会变。
- [ ] 点任务标题能进详情页，再点「回到今日清单」能回来。
- [ ] 手机宽度 375px 下没有横向滚动条。
- [ ] F12 Console 没有红色报错（故意做的 404 练习除外）。
- [ ] 把线上 URL 填回本 README 第一节。

### 常见 404 原因

1. `index.html` 不在仓库根目录，而是被套了一层文件夹。
2. Pages 的 Source 还停在 “None”，或分支选错。
3. 刚保存不到 1 分钟，GitHub 还在构建。
4. 仓库是 Private，而当前账号的 Pages 权限不支持私有仓库发布。
5. 访问地址拼错：是 `https://用户名.github.io/仓库名/`，不是 `https://github.com/...`。

---

## 六、抓包练习（3 条请求 + 1 个 404）

完整步骤、记录表和填写示例在 **[`docs/抓包记录.md`](docs/抓包记录.md)**。这里先给结论：

| # | 请求 | 触发方式 | 实测 Method / Status | 本地耗时 |
| --- | --- | --- | --- | --- |
| 1 | `index.html` | 打开页面 | `GET` / `200` | 3ms |
| 2 | `css/style.css` | 页面加载 | `GET` / `200` | 4ms |
| 3 | `data/tasks.json` | 页面里的 `fetch()` | `GET` / `200` | 2ms |
| 附 | `data/not-found.json` | 手动访问不存在的路径 | `GET` / `404` | 3ms |

> 以上是 2026-11-11 在本地 Python 服务（`127.0.0.1:8123`）用 Edge 实测的值。换到 GitHub Pages 后网络耗时通常会变大，部署后建议重测并更新 [`docs/抓包记录.md`](docs/抓包记录.md)。

操作要点：

1. F12 → **Network**，勾选 **Preserve log**，勾选 **Disable cache**。
2. 刷新页面，按 `Type` 或 `Name` 找到上面三条。
3. 点开每条请求，在 **Headers** 看 Request Method / Status Code，在 **Timing** 看耗时。
4. 在地址栏访问 `data/not-found.json`，截一张包含 `404` 的图，存为 `screenshots/network-404.png`。仓库里已附本地服务器的真实 404 响应页；如果任务书额外要求 F12 Network 面板里请求名和状态码同框，再按 [`docs/抓包记录.md`](docs/抓包记录.md) 重拍一张替换。
5. 部署后用线上地址重测，把新的耗时更新进 `docs/抓包记录.md`，并写进周记。

> 记录的是「你自己机器上的一次真实请求」，所以耗时不需要和别人一样；方法、状态码、请求类型和耗时四项写清楚即可。

---

## 七、截图要求

截图已生成在 `screenshots/`（GitHub Dark 深色界面 + 克制的液态玻璃质感 + 进度卡场景背景），必需 3 张，另附整页和详情页截图：

| 文件名 | 内容 | 实际尺寸 | 状态 |
| --- | --- | --- | --- |
| `desktop.png` | 电脑端首页首屏（标题、进度环、Tab、任务列表开头） | 1440 × 900 | 已生成，185KB |
| `desktop-full.png` | 电脑端首页整页（可选） | 1440 × 1289 | 已生成，206KB |
| `detail.jpg` | 详情页首屏（任务拆解与标记完成） | 1440 × 900 | 已生成，91KB |
| `detail-full.jpg` | 详情页整页（可选） | 1440 × 1143 | 已生成，109KB |
| `mobile.jpg` | 手机端首页（375px 宽，2x 截图） | 750 × 1624 | 已生成，101KB |
| `mobile-full.jpg` | 手机端整页（可选） | 750 × 4760 | 已生成，267KB |
| `network-404.png` | 本地服务器真实 404 响应页（Error code: 404） | 1440 × 900 | 已生成，6KB |

压缩说明：桌面截图用 PNG 调色板量化，详情与手机截图用 JPEG 质量 84–92，全部压到 **单张 300KB 以内**；重新截图后可用 [Squoosh](https://squoosh.app/) 或 TinyPNG 按同样标准处理。

`network-404.png` 是地址栏访问不存在路径时服务器返回的 404 响应页，不是 F12 Network 面板截图；如果老师额外要求请求名和状态码同框，按 [`docs/抓包记录.md`](docs/抓包记录.md) 重拍一张替换即可。

---

## 八、目录结构

```text
wangye/
├── index.html              # 清单页（Tab、进度、任务列表）
├── detail.html             # 详情页（?id=t1）
├── css/
│   ├── style.css           # 基础样式、深色变量与液态玻璃
│   └── refresh.css         # 预览版布局与响应式覆盖
├── js/
│   ├── tasks-data.js       # fetch 失败 / file:// 时的兜底数据
│   ├── utils.js            # 日期、时长、转义等小工具
│   ├── store.js            # 读取 tasks.json、localStorage 状态
│   ├── editor.js           # 新建 / 编辑 / 删除共用弹窗
│   ├── app.js              # 清单页交互
│   └── detail.js           # 详情页交互
├── data/
│   └── tasks.json          # 6 条任务（fetch 的数据源）
├── assets/
│   └── progress-bg.jpg     # 进度卡背景（本地壁纸场景静帧）
├── docs/
│   └── 抓包记录.md          # 3 条请求 + 404 的实测记录
├── screenshots/            # 首页、详情页、手机端截图 + 404 证据
│   ├── desktop.png
│   ├── desktop-full.png
│   ├── detail.jpg
│   ├── detail-full.jpg
│   ├── mobile.jpg
│   ├── mobile-full.jpg
│   ├── network-404.png
│   └── README.md
├── .nojekyll               # 告诉 GitHub Pages 不要走 Jekyll
├── favicon.ico             # 浏览器标签小图标
└── README.md
```

---

## 九、实现说明（可选读）

### 为什么用 `fetch` + 兜底数据？

任务书要求练习一次自己写的 `fetch`，所以任务数据放在 JSON 里，由 `js/store.js` 发起请求。考虑到有人会直接双击 HTML，`file://` 下 `fetch` 必然被拦截，于是加了一份 `js/tasks-data.js` 作为兜底：

```js
if (window.location.protocol === "file:") {
  return fallbackTasks();
}

try {
  var response = await fetch("data/tasks.json", { cache: "no-store" });
  // ...
  return data.tasks;
} catch (error) {
  return fallbackTasks();
}
```

这样线上是真实的 fetch，本地双击也不会白屏；失败时不往控制台打红色错误，避免违反“控制台无红色报错”。

### Tab 的可访问性

- `role="tablist"` / `role="tab"` / `role="tabpanel"` 成套使用；
- 选中的 Tab 是 `tabindex="0"`，其余是 `-1`；
- 支持 `←` `→` `Home` `End`；
- 面板用 `hidden` 控制显示，焦点不会跑到隐藏内容里。

### 完成状态

```js
localStorage.setItem("morrow.todo.done.v1", JSON.stringify(Array.from(doneSet)));
```

只存 id 数组，例如 `["t5"]`。任务内容则单独保存在 `morrow.todo.tasks.v1`：新建、编辑或删除后写入整份数组，刷新时优先读它。

### 响应式

- ≥ 960px：首屏左右两栏，清单 + 时间线侧栏；
- 760～960px：首屏单栏，侧栏移到清单下方；
- ≤ 620px：清单单栏，任务标题和摘要允许换行，时间移到标题下方，箭头隐藏；
- ≤ 400px：进一步收紧边距和字号，适配 375px 手机。

所有文字容器都允许换行，长英文/链接使用 `overflow-wrap: anywhere`，避免撑破布局。

---

## 十、验收清单

代码与本地验证已完成：

- [x] 两个页面，互相跳转
- [x] `header` / `nav` / `main` / `section` / `article` / `aside` / `footer` 语义化结构
- [x] 375px 响应式样式
- [x] Tab 切换（鼠标 + 键盘）
- [x] 勾选完成、进度统计、`localStorage` 持久化
- [x] 新建 / 编辑 / 删除任务，删除二次确认，改动刷新不丢
- [x] 详情页读取 `?id=`，支持标记完成、编辑/删除与 404 状态
- [x] 原生 HTML / CSS / JS，无框架、无构建
- [x] `fetch('data/tasks.json')` + 失败兜底
- [x] 页面图标为内联 SVG；favicon.ico 约 6KB
- [x] Edge 实测：Tab 点击/键盘、勾选/重置、新建/编辑/删除、详情跳转与 404、375px 无横向滚动、正常页面 Console 0 条红色错误（故意访问 404 时浏览器会记录预期的 404）
- [x] 7 张截图已生成，并压到单张 300KB 内
- [x] `docs/抓包记录.md` 已填本地实测数据

部署后需要你补：

- [x] 仓库链接和线上 URL 已按账号 `a-sun-moon-stars` 填入第一节
- [x] 公开仓库 `a-sun-moon-stars/wangye` 已创建
- [ ] Settings → Pages 选择 `main` / root，https 地址生效
- [ ] 网页上传或推送最终代码到 `main`
- [ ] 上传后刷新线上地址，确认新版布局和「新建 / 编辑 / 删除」已出现
- [ ] 可选：用线上地址重拍 3 张必需截图，替换同名文件
- [ ] 可选：用线上地址重测 3 条请求耗时，更新 `docs/抓包记录.md`

---

## License

仅用于课程作业与学习，可自由修改。
