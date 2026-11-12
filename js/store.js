/*
 * 数据层：任务不再存在本地，全部以接口为准。
 * 页面初始化时 GET /api/items，新增走 POST，修改走 PUT，删除走 DELETE。
 * 这里保留少量旧接口名（saveTasks / getDone 等），详情页仍然可以复用。
 */
(function () {
  "use strict";

  var Api = window.TodoApi;
  var cache = []; // 最近一次从接口读到的任务

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function todayValue() {
    var now = new Date();
    return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  }

  function mapItem(item) {
    return {
      id: String(item.id),
      title: item.title,
      done: Boolean(item.done),
      summary: item.summary || "",
      tag: item.tag || "生活",
      priority: item.priority || "medium",
      dueDate: item.dueDate || todayValue(),
      dueTime: item.dueTime || "",
      estimateMinutes: Number(item.estimateMinutes) || 0,
      steps: Array.isArray(item.steps) ? item.steps.slice() : [],
      note: item.note || "",
      createdAt: item.created_at || ""
    };
  }

  function copy(task) {
    return Object.assign({}, task, { steps: task.steps.slice() });
  }

  function toPayload(task) {
    var payload = { title: task.title };

    if (typeof task.summary === "string") {
      payload.summary = task.summary;
    }
    if (task.tag) {
      payload.tag = task.tag;
    }
    if (task.priority) {
      payload.priority = task.priority;
    }
    if (task.dueDate) {
      payload.dueDate = task.dueDate;
    }
    if (task.dueTime) {
      payload.dueTime = task.dueTime;
    }
    if (Number.isFinite(Number(task.estimateMinutes))) {
      payload.estimateMinutes = Math.max(0, Math.min(600, Math.round(Number(task.estimateMinutes))));
    }
    if (Array.isArray(task.steps)) {
      payload.steps = task.steps.slice();
    }
    if (typeof task.note === "string") {
      payload.note = task.note;
    }
    return payload;
  }

  function findIndexById(id) {
    return cache.findIndex(function (task) {
      return task.id === String(id);
    });
  }

  async function loadTasks() {
    var data = await Api.list();
    cache = (Array.isArray(data) ? data : []).map(mapItem);
    return cache.map(copy);
  }

  async function createTask(task) {
    var data = await Api.create(toPayload(task));
    var mapped = mapItem(data);
    cache.unshift(mapped);
    return copy(mapped);
  }

  async function updateTask(task) {
    var data = await Api.update(task.id, toPayload(task));
    var mapped = mapItem(data);
    var index = findIndexById(mapped.id);
    if (index !== -1) {
      cache[index] = mapped;
    }
    return copy(mapped);
  }

  async function deleteTask(id) {
    await Api.remove(id);
    cache = cache.filter(function (task) {
      return task.id !== String(id);
    });
  }

  async function setDone(id, done) {
    await Api.update(id, { done: Boolean(done) });
    var index = findIndexById(id);
    if (index !== -1) {
      cache[index].done = Boolean(done);
    }
  }

  /*
   * 兼容详情页：拿新旧两份清单做差集，新增 POST、修改 PUT、删除 DELETE。
   * 详情页的保存不需要 await，失败时只在控制台留一条记录。
   */
  function syncTasks(tasks) {
    var next = Array.isArray(tasks) ? tasks : [];
    var jobs = [];
    var nextIds = {};

    next.forEach(function (task) {
      nextIds[task.id] = true;
      var index = findIndexById(task.id);
      if (index === -1) {
        jobs.push(createTask(task).catch(report));
        return;
      }
      var before = JSON.stringify(toPayload(cache[index]));
      var after = JSON.stringify(toPayload(task));
      if (before !== after) {
        jobs.push(updateTask(task).catch(report));
      }
    });

    cache.forEach(function (task) {
      if (!nextIds[task.id]) {
        jobs.push(deleteTask(task.id).catch(report));
      }
    });

    return Promise.all(jobs);
  }

  function report(error) {
    window.console.warn("任务同步失败：", error && error.message ? error.message : error);
  }

  function getDone() {
    var done = new Set();
    cache.forEach(function (task) {
      if (task.done) {
        done.add(task.id);
      }
    });
    return done;
  }

  function saveDone(doneSet) {
    cache.forEach(function (task) {
      var want = doneSet.has(task.id);
      if (task.done !== want) {
        task.done = want;
        Api.update(task.id, { done: want }).catch(report);
      }
    });
  }

  function resetDone() {
    var jobs = [];
    cache.forEach(function (task) {
      if (task.done) {
        task.done = false;
        jobs.push(Api.update(task.id, { done: false }).catch(report));
      }
    });
    return Promise.all(jobs).then(function () {
      return new Set();
    });
  }

  function clearSavedTasks() {
    cache = [];
  }

  window.TodoStore = {
    loadTasks: loadTasks,
    createTask: createTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    setDone: setDone,
    saveTasks: syncTasks,
    getDone: getDone,
    saveDone: saveDone,
    resetDone: resetDone,
    clearSavedTasks: clearSavedTasks,
    STORAGE_KEY: "morrow.todo.done.v1",
    TASKS_KEY: "morrow.todo.tasks.v1"
  };
})();
