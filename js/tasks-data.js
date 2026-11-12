/*
 * 离线兜底数据。
 * 线上优先 fetch('data/tasks.json')；用 file:// 直接双击打开时，fetch 会被浏览器拦截，
 * 这时自动退回这份数据，保证页面仍然能看。修改任务时请同时更新两个文件。
 */
window.TASKS_DATA = {
  meta: { title: "今日待办", updated: "2026-11-12" },
  tasks: []
};
