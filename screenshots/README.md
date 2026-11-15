# 截图目录

这个目录放提交作业用的截图。已用 Edge 在本地真实页面生成（GitHub Dark 深色界面 + 克制的液态玻璃质感）并压缩；部署到线上后，建议用线上地址重拍替换同名文件。

| 文件名 | 内容 | 实际尺寸 | 状态 |
| --- | --- | --- | --- |
| `desktop.png` | 电脑端首页首屏（1440×900） | 1440 × 900 | 已生成，185KB |
| `desktop-full.png` | 电脑端首页整页（可选） | 1440 × 1289 | 已生成，206KB |
| `detail.jpg` | 详情页首屏 | 1440 × 900 | 已生成，91KB |
| `detail-full.jpg` | 详情页整页（可选） | 1440 × 1143 | 已生成，109KB |
| `mobile.jpg` | 手机端首页（375px 宽，2x） | 750 × 1624 | 已生成，101KB |
| `mobile-full.jpg` | 手机端整页（可选） | 750 × 4760 | 已生成，267KB |
| `network-404.png` | 本地服务器真实 404 响应页 | 1440 × 900 | 已生成，6KB |

## 怎么拍

### 电脑端

1. 打开线上地址（或 `http://localhost:8000`）。
2. 浏览器窗口拉到 1440px 左右。
3. 确认画面里能看到：标题、进度卡、三个 Tab、至少几条任务。
4. 截首屏存为 `screenshots/desktop.png`；需要整页时再截一张存为 `screenshots/desktop-full.png`。
5. 打开 `detail.html?id=t1`，用同样方式截 `detail.jpg` / `detail-full.jpg`。

### 手机端

1. Chrome / Edge 按 `F12`，点左上角的设备图标（Toggle device toolbar）。
2. 选 iPhone SE 或自定义 **375 × 812**。
3. 刷新页面，确认没有横向滚动条，文字没有重叠。
4. 截图存为 `screenshots/mobile.jpg`；设备模式里也能截整页，存为 `screenshots/mobile-full.jpg`。

### 404 抓包

1. 打开 F12 → Network，勾选 Preserve log。
2. 地址栏访问 `http://localhost:8000/data/not-found.json`（线上则换成你的域名）。
3. 在 Network 里找到 `not-found.json`，确认 Status 是 **404**。
4. 当前仓库里的 `network-404.png` 是地址栏直接访问时服务器返回的 404 响应页，能看到 `Error code: 404`。
5. 如果老师额外要求 F12 面板里请求名和状态码同框，在 Network 里选中 `not-found.json` 再截一张，替换同名文件。

详细步骤见 [`../docs/抓包记录.md`](../docs/抓包记录.md)。

## 压缩

作业要求单张图片 **不超过 300KB**。本目录现有截图都已压到限值内；重新截图后可按下面处理：

- 桌面截图用 PNG 调色板量化；
- 详情与手机截图用 JPEG 质量 84～92；
- 压缩后把文件放回本目录，文件名保持不变。

如果改了扩展名（例如 `.webp`），记得同步修改根目录 `README.md` 里的文件名。

## 注意

- 不要用设计稿或示意图冒充浏览器截图；老师会对照线上页面。
- 截图里不要露出隐私信息（书签栏、账号头像、桌面文件等）。
- 手机端截图要能看出是 375px 宽度下的真实排版，而不是把电脑截图缩小。
