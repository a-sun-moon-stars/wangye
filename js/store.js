/*
 * 极简数据层：负责取任务、存取完成状态。
 * 不依赖任何框架，所有页面共用。
 */
(function () {
  "use strict";

  var STORAGE_KEY = "morrow.todo.done.v1";
  var TASKS_KEY = "morrow.todo.tasks.v1";
  var DEFAULT_DONE = ["t5"];

  function getDone() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        return new Set(DEFAULT_DONE);
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return new Set(DEFAULT_DONE);
      }
      return new Set(parsed.filter(function (id) {
        return typeof id === "string";
      }));
    } catch (error) {
      return new Set(DEFAULT_DONE);
    }
  }

  function saveDone(doneSet) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(doneSet)));
    } catch (error) {
      /* 隐私模式或存储被禁用时，状态只保留在当前页面内。 */
    }
  }

  function resetDone() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "[]");
    } catch (error) {
      /* 忽略存储异常。 */
    }
    return new Set();
  }

  function fallbackTasks() {
    if (window.TASKS_DATA && Array.isArray(window.TASKS_DATA.tasks)) {
      return window.TASKS_DATA.tasks.map(function (task) {
        return Object.assign({}, task);
      });
    }
    return [];
  }

  function getSavedTasks() {
    try {
      var raw = window.localStorage.getItem(TASKS_KEY);
      if (raw === null) {
        return null;
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return null;
      }
      if (!parsed.length) {
        return [];
      }
      var valid = parsed.filter(function (task) {
        return task && typeof task.id === "string" && typeof task.title === "string";
      });
      return valid.length ? valid : null;
    } catch (error) {
      return null;
    }
  }

  function saveTasks(tasks) {
    try {
      window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      /* 存储不可用时，改动只保留在当前页面。 */
    }
  }

  function clearSavedTasks() {
    try {
      window.localStorage.removeItem(TASKS_KEY);
    } catch (error) {
      /* 忽略存储异常。 */
    }
  }

  async function loadTasks() {
    // 用户改过或删过任务后，以本地清单为准；否则读 JSON，失败再用兜底数据。
    var saved = getSavedTasks();
    if (saved !== null) {
      return saved;
    }

    // 双击 HTML 用 file:// 打开时，fetch 会被 CORS 拦截，直接使用兜底数据。
    if (window.location.protocol === "file:") {
      return fallbackTasks();
    }

    try {
      var response = await fetch("data/tasks.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("tasks.json 返回了 " + response.status);
      }
      var data = await response.json();
      if (!data || !Array.isArray(data.tasks)) {
        throw new Error("tasks.json 结构不正确");
      }
      return data.tasks;
    } catch (error) {
      // 不往控制台打红色报错：本地断网或路径不对时，页面仍然可用。
      return fallbackTasks();
    }
  }

  window.TodoStore = {
    loadTasks: loadTasks,
    saveTasks: saveTasks,
    clearSavedTasks: clearSavedTasks,
    getDone: getDone,
    saveDone: saveDone,
    resetDone: resetDone,
    STORAGE_KEY: STORAGE_KEY,
    TASKS_KEY: TASKS_KEY
  };
})();
