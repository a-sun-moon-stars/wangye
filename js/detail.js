/*
 * 详情页逻辑：按 ?id= 读取任务，展示步骤，并支持直接标记完成。
 */
(function () {
  "use strict";

  var Utils = window.TodoUtils;
  var Store = window.TodoStore;
  var Editor = window.TodoEditor;
  var root = document.querySelector("[data-detail]");
  var pager = document.querySelector("[data-pager]");
  var toastTimer = null;
  var current = {
    tasks: [],
    task: null,
    index: -1,
    done: new Set()
  };

  function toast(message) {
    var element = document.getElementById("toast");
    if (!element) {
      return;
    }
    window.clearTimeout(toastTimer);
    element.textContent = message;
    element.classList.add("is-visible");
    toastTimer = window.setTimeout(function () {
      element.classList.remove("is-visible");
    }, 2400);
  }

  function detailMarkup(task, isDone) {
    var priority = Utils.priorityMeta(task.priority);
    var soon = !isDone && Utils.dueDiff(task) <= 1;
    var steps = Array.isArray(task.steps) ? task.steps : [];
    var stepsMarkup = steps.map(function (step, index) {
      return [
        "<li>",
        '  <span class="step-num" aria-hidden="true">' + String(index + 1).padStart(2, "0") + "</span>",
        "  <p>" + Utils.escapeHtml(step) + "</p>",
        "</li>"
      ].join("");
    }).join("");

    return [
      '<header class="detail-hero">',
      '  <div class="detail-kicker">',
      '    <span class="tag tag-' + Utils.tagClass(task.tag) + '">' + Utils.escapeHtml(task.tag) + "</span>",
      '    <span class="priority priority-' + priority.key + '"><i class="priority-dot" aria-hidden="true"></i>' +
           priority.label + "</span>",
      "  </div>",
      "  <h1>" + Utils.escapeHtml(task.title) + "</h1>",
      '  <p class="detail-lede">' + Utils.escapeHtml(task.summary) + "</p>",
      '  <dl class="detail-meta">',
      "    <div>",
      "      <dt>截止时间</dt>",
      '      <dd class="' + (soon ? "is-soon" : "") + '">' + Utils.escapeHtml(Utils.formatDue(task)) + "</dd>",
      "    </div>",
      "    <div>",
      "      <dt>预计用时</dt>",
      "      <dd>约 " + Utils.formatDuration(task.estimateMinutes) + "</dd>",
      "    </div>",
      "    <div>",
      "      <dt>当前状态</dt>",
      '      <dd><span class="status' + (isDone ? " is-done" : "") + '">' + (isDone ? "已完成" : "进行中") + "</span></dd>",
      "    </div>",
      "  </dl>",
      "</header>",
      '<div class="detail-body">',
      '  <section class="steps-section" aria-labelledby="steps-title">',
      '    <div class="section-heading">',
      "      <div>",
      '        <p class="eyebrow">STEP BY STEP</p>',
      '        <h2 id="steps-title">完成步骤</h2>',
      "      </div>",
      "    </div>",
      '    <ol class="step-list">' + stepsMarkup + "</ol>",
      "  </section>",
      '  <aside class="detail-side" aria-label="任务提示与操作">',
      '    <div class="note-card">',
      '      <span class="tape" aria-hidden="true"></span>',
      '      <p class="eyebrow">WHY IT MATTERS</p>',
      "      <p>" + Utils.escapeHtml(task.note) + "</p>",
      "    </div>",
      '    <button class="btn ' + (isDone ? "btn-ghost" : "btn-primary") + ' btn-block" type="button" ' +
             'data-detail-toggle aria-pressed="' + (isDone ? "true" : "false") + '">' +
             (isDone ? "已完成，取消勾选" : "标记为完成") + "</button>",
      '    <div class="detail-actions">',
      '      <button class="task-action" type="button" data-edit-id="' + Utils.escapeHtml(task.id) +
             '" aria-label="编辑任务：' + Utils.escapeHtml(task.title) + '">编辑任务</button>',
      '      <button class="task-action task-action-danger" type="button" data-delete-id="' + Utils.escapeHtml(task.id) +
             '" aria-label="删除任务：' + Utils.escapeHtml(task.title) + '">删除任务</button>',
      '    </div>',
      '    <a class="text-link" href="index.html">← 回到今日清单</a>',
      "  </aside>",
      "</div>"
    ].join("");
  }

  function renderPager() {
    if (!pager) {
      return;
    }
    if (current.tasks.length < 2 || !current.task) {
      pager.hidden = true;
      pager.innerHTML = "";
      return;
    }

    var previous = current.tasks[(current.index - 1 + current.tasks.length) % current.tasks.length];
    var next = current.tasks[(current.index + 1) % current.tasks.length];

    pager.innerHTML = [
      '<a class="pager-link pager-prev" href="detail.html?id=' + encodeURIComponent(previous.id) + '">',
      "  <span>← 上一个</span>",
      "  <strong>" + Utils.escapeHtml(previous.title) + "</strong>",
      "</a>",
      '<a class="pager-link pager-next" href="detail.html?id=' + encodeURIComponent(next.id) + '">',
      "  <span>下一个 →</span>",
      "  <strong>" + Utils.escapeHtml(next.title) + "</strong>",
      "</a>"
    ].join("");
    pager.hidden = false;
  }

  function renderTask() {
    if (!current.task) {
      return;
    }
    var isDone = current.done.has(current.task.id);
    root.innerHTML = detailMarkup(current.task, isDone);
    document.title = current.task.title + " · 今日待办";
    renderPager();
  }

  function renderNotFound() {
    document.title = "任务没找到 · 今日待办";
    root.innerHTML = [
      '<div class="not-found">',
      '  <p class="eyebrow">404 · NOT FOUND</p>',
      "  <h1>这枚任务走丢了。</h1>",
      "  <p>链接里的编号不存在，可能是手滑改了一位。回到清单，重新挑一件吧。</p>",
      '  <a class="btn btn-primary" href="index.html">回到今日清单</a>',
      "</div>"
    ].join("");
    if (pager) {
      pager.hidden = true;
      pager.innerHTML = "";
    }
  }

  function render() {
    if (!current.task) {
      renderNotFound();
      return;
    }
    renderTask();
  }

  function saveEditedTask(task) {
    var index = current.tasks.findIndex(function (item) {
      return item.id === task.id;
    });
    if (index === -1) {
      return;
    }

    current.tasks[index] = task;
    current.task = task;
    Store.saveTasks(current.tasks);
    renderTask();
    toast("任务已更新。");

    var editButton = document.querySelector("[data-edit-id]");
    if (editButton) {
      editButton.focus({ preventScroll: true });
    }
  }

  function deleteCurrentTask(task) {
    current.tasks = current.tasks.filter(function (item) {
      return item.id !== task.id;
    });
    current.done.delete(task.id);
    Store.saveDone(current.done);
    Store.saveTasks(current.tasks);
    window.location.assign("index.html");
  }

  document.addEventListener("click", function (event) {
    if (Editor && event.target.closest) {
      var editButton = event.target.closest("[data-edit-id]");
      if (editButton && current.task) {
        Editor.open(current.task, saveEditedTask);
        return;
      }

      var deleteButton = event.target.closest("[data-delete-id]");
      if (deleteButton && current.task) {
        Editor.confirmDelete(current.task, function () {
          deleteCurrentTask(current.task);
        });
        return;
      }
    }

    var button = event.target.closest ? event.target.closest("[data-detail-toggle]") : null;
    if (!button || !current.task) {
      return;
    }

    var task = current.task;
    var wasDone = current.done.has(task.id);

    if (wasDone) {
      current.done.delete(task.id);
    } else {
      current.done.add(task.id);
    }
    Store.saveDone(current.done);
    renderTask();
    toast(wasDone ? "已经放回待办。" : "完成一件，做得不错。");

    var nextButton = document.querySelector("[data-detail-toggle]");
    if (nextButton) {
      nextButton.focus({ preventScroll: true });
    }
  });

  window.addEventListener("storage", function (event) {
    if (event.key === Store.STORAGE_KEY) {
      current.done = Store.getDone();
      render();
      return;
    }

    if (event.key === Store.TASKS_KEY && current.task) {
      var wantedId = current.task.id;
      Store.loadTasks().then(function (tasks) {
        current.tasks = tasks;
        current.index = tasks.findIndex(function (task) {
          return task.id === wantedId;
        });
        if (current.index === -1) {
          current.task = null;
          renderNotFound();
          return;
        }
        current.task = tasks[current.index];
        renderTask();
      }).catch(function () {
        /* 读取失败时保留当前页面。 */
      });
    }
  });

  async function init() {
    document.querySelectorAll("[data-year]").forEach(function (element) {
      element.textContent = String(new Date().getFullYear());
    });

    current.done = Store.getDone();
    try {
      current.tasks = await Store.loadTasks();
    } catch (error) {
      current.tasks = [];
    }

    var params = new URLSearchParams(window.location.search);
    var requestedId = params.get("id") || "t1";
    current.index = current.tasks.findIndex(function (task) {
      return task.id === requestedId;
    });

    if (current.index === -1) {
      current.task = null;
      renderNotFound();
      return;
    }

    current.task = current.tasks[current.index];
    renderTask();
  }

  init();
})();
