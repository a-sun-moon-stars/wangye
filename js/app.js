/*
 * 清单页逻辑：加载任务、Tab 筛选、勾选完成、进度统计。
 * 原生 JavaScript，无框架、无构建步骤。
 */
(function () {
  "use strict";

  var Utils = window.TodoUtils;
  var Store = window.TodoStore;
  var Editor = window.TodoEditor;

  var state = {
    tasks: [],
    done: new Set(),
    filter: "all"
  };

  var FILTERS = {
    all: function () { return true; },
    active: function (task) { return !state.done.has(task.id); },
    done: function (task) { return state.done.has(task.id); }
  };

  var toastTimer = null;

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setText(selector, text) {
    $all(selector).forEach(function (element) {
      element.textContent = text;
    });
  }

  function getTotalMinutes(tasks) {
    return tasks.reduce(function (sum, task) {
      return sum + (Number(task.estimateMinutes) || 0);
    }, 0);
  }

  function taskMarkup(task) {
    var isDone = state.done.has(task.id);
    var priority = Utils.priorityMeta(task.priority);
    var soon = !isDone && Utils.dueDiff(task) <= 1;
    var detailUrl = "detail.html?id=" + encodeURIComponent(task.id);
    var checkLabel = (isDone ? "取消完成：" : "标记完成：") + task.title;
    var dueText = Utils.formatDue(task).replace(/^\d{1,2}月\d{1,2}日 · /, "");

    return [
      '<li class="task-item' + (isDone ? " is-done" : "") + '" data-task-id="' + Utils.escapeHtml(task.id) + '">',
      '  <label class="task-check">',
      '    <input type="checkbox" data-check-id="' + Utils.escapeHtml(task.id) + '"' + (isDone ? " checked" : "") +
             ' aria-label="' + Utils.escapeHtml(checkLabel) + '">',
      '    <span class="checkmark" aria-hidden="true">',
      '      <svg viewBox="0 0 16 16"><path d="M3.4 8.4 6.5 11.5 12.8 4.8"></path></svg>',
      '    </span>',
      '  </label>',
      '  <div class="task-content">',
      '    <div class="task-heading">',
      '      <h3><a href="' + detailUrl + '">' + Utils.escapeHtml(task.title) + '</a></h3>',
      '      <span class="priority priority-' + priority.key + '"><i class="priority-dot" aria-hidden="true"></i>' +
             priority.label + '</span>',
      '    </div>',
      '    <div class="task-sub">',
      '      <span class="tag tag-' + Utils.tagClass(task.tag) + '">' + Utils.escapeHtml(task.tag) + '</span>',
      '      <span class="task-summary">' + Utils.escapeHtml(task.summary) + '</span>',
      '    </div>',
      '    <div class="task-actions">',
      '      <button class="task-action" type="button" data-edit-id="' + Utils.escapeHtml(task.id) +
             '" aria-label="编辑任务：' + Utils.escapeHtml(task.title) + '">编辑</button>',
      '      <button class="task-action task-action-danger" type="button" data-delete-id="' + Utils.escapeHtml(task.id) +
             '" aria-label="删除任务：' + Utils.escapeHtml(task.title) + '">删除</button>',
      '    </div>',
      '  </div>',
      '  <div class="task-time' + (soon ? " is-soon" : "") + '">',
      '    <b>' + Utils.escapeHtml(dueText) + '</b>',
      '    <span>约 ' + Utils.formatDuration(task.estimateMinutes) + '</span>',
      '  </div>',
      '  <a class="task-open" href="' + detailUrl + '" aria-label="查看任务详情：' +
           Utils.escapeHtml(task.title) + '"><span aria-hidden="true">→</span></a>',
      '</li>'
    ].join("");
  }

  function summaryText(filter, visibleTasks, total) {
    var minutes = getTotalMinutes(visibleTasks);

    if (filter === "active") {
      if (!visibleTasks.length) {
        return "待办清零，今天可以收工。";
      }
      return visibleTasks.length + " 件待完成 · 预计 " + Utils.formatDuration(minutes);
    }

    if (filter === "done") {
      if (!visibleTasks.length) {
        return "还没有完成的任务。";
      }
      return visibleTasks.length + " 件已完成 · 共 " + total + " 件";
    }

    return "共 " + visibleTasks.length + " 件 · 预计 " + Utils.formatDuration(minutes);
  }

  function renderNext() {
    var container = $("[data-next-list]");
    if (!container) {
      return;
    }

    function dueValue(task) {
      var date = Utils.getDueDate(task);
      var parts = String(task.dueTime || "").split(":");
      var minutes = (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
      return date.getTime() + minutes * 60000;
    }

    var nextTasks = state.tasks
      .filter(FILTERS.active)
      .slice()
      .sort(function (a, b) {
        return dueValue(a) - dueValue(b);
      })
      .slice(0, 3);

    if (!nextTasks.length) {
      container.innerHTML = '<p class="next-empty">今天没有待办了，慢慢收个尾。</p>';
      return;
    }

    container.innerHTML = nextTasks.map(function (task, index) {
      var due = Utils.formatDue(task);
      var timeMatch = due.match(/(\d{1,2}:\d{2})\s*$/);
      var timeText = timeMatch ? timeMatch[1] : due;
      var dayText = due.replace(/\s*\d{1,2}:\d{2}\s*$/, "");
      var detail = (dayText ? dayText + " · " : "") + task.tag + " · " +
        Utils.formatDuration(task.estimateMinutes);

      return [
        '<div class="next">',
        '  <span class="next-pin" aria-hidden="true"></span>',
        '  <time' + (index === 0 ? ' class="is-hot"' : "") + '>' + Utils.escapeHtml(timeText) + '</time>',
        '  <div>',
        '    <b>' + Utils.escapeHtml(task.title) + '</b>',
        '    <small>' + Utils.escapeHtml(detail) + '</small>',
        '  </div>',
        '</div>'
      ].join("");
    }).join("");
  }

  function render() {
    var total = state.tasks.length;
    var doneTasks = state.tasks.filter(function (task) { return state.done.has(task.id); });
    var doneCount = doneTasks.length;
    var remaining = total - doneCount;
    var percent = total ? Math.round((doneCount / total) * 100) : 0;
    var totalMinutes = getTotalMinutes(state.tasks);
    var remainingMinutes = getTotalMinutes(state.tasks.filter(FILTERS.active));

    // 顶部进度
    var ring = $("[data-ring]");
    if (ring) {
      ring.style.setProperty("--p", String(percent));
      ring.classList.toggle("is-complete", total > 0 && doneCount === total);
    }
    setText("[data-percent]", percent + "%");
    setText("[data-done-count]", String(doneCount));
    setText("[data-total-count]", String(total));
    setText("[data-remaining-count]", String(remaining));
    setText("[data-total-time]", Utils.formatDuration(totalMinutes));
    setText("[data-side-done]", doneCount + " / " + total);
    renderNext();

    var caption;
    if (!total) {
      caption = "清单还是空的，先加一件小事吧。";
    } else if (percent === 100) {
      caption = "全部完成，今天可以收工了。";
    } else if (doneCount === 0) {
      caption = "从最小的一件开始。";
    } else {
      caption = "还有 " + remaining + " 件小事，慢慢来。";
    }
    setText("[data-progress-text]", caption);

    var bar = $("[data-rhythm-bar]");
    if (bar) {
      bar.style.width = percent + "%";
    }

    document.body.classList.toggle("is-all-done", total > 0 && doneCount === total);

    // 三个 Tab 的计数与列表
    Object.keys(FILTERS).forEach(function (filter) {
      var visibleTasks = state.tasks.filter(FILTERS[filter]);
      var list = $('[data-list="' + filter + '"]');
      var empty = $('[data-empty="' + filter + '"]');
      var summary = $('[data-summary="' + filter + '"]');
      var count = $('[data-count="' + filter + '"]');

      if (count) {
        count.textContent = String(visibleTasks.length);
      }
      if (summary) {
        summary.textContent = summaryText(filter, visibleTasks, total);
      }
      if (list) {
        list.innerHTML = visibleTasks.map(taskMarkup).join("");
        list.hidden = visibleTasks.length === 0;
      }
      if (empty) {
        empty.hidden = visibleTasks.length !== 0;
      }
    });
  }

  function toast(message) {
    var element = $("#toast");
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

  function taskById(taskId) {
    return state.tasks.find(function (task) {
      return task.id === taskId;
    });
  }

  function focusTaskAction(taskId) {
    window.setTimeout(function () {
      var card = document.querySelector('[data-task-id="' + taskId + '"]');
      var target = card ? card.querySelector("[data-edit-id]") : null;
      if (!target) {
        target = $("[data-new-task]");
      }
      if (target) {
        target.focus({ preventScroll: true });
      }
    }, 0);
  }

  async function saveTask(task, wasEditing) {
    try {
      var saved = wasEditing ? await Store.updateTask(task) : await Store.createTask(task);
      await reload({ showLoading: false });
      if (!wasEditing) {
        activateTab("all", false);
      }
      toast(wasEditing ? "任务已更新。" : "新任务已加入。");
      focusTaskAction(saved.id);
    } catch (error) {
      toast("保存失败：" + (error && error.message ? error.message : "未知错误"));
    }
  }

  async function removeTask(task) {
    try {
      await Store.deleteTask(task.id);
      await reload({ showLoading: false });
      toast("任务已删除，已从进度里移除。");

      window.setTimeout(function () {
        var target = $("[data-new-task]") || $('[role="tab"]');
        if (target) {
          target.focus({ preventScroll: true });
        }
      }, 0);
    } catch (error) {
      toast("删除失败：" + (error && error.message ? error.message : "未知错误"));
    }
  }

  function activateTab(filter, shouldFocus) {
    if (!FILTERS[filter]) {
      return;
    }
    state.filter = filter;

    $all('[role="tab"]').forEach(function (tab) {
      var active = tab.getAttribute("data-filter") === filter;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
      if (active && shouldFocus) {
        tab.focus();
      }
    });

    $all("[data-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-panel") !== filter;
    });
  }

  function focusAfterToggle(taskId) {
    var selector = '.tab-panel:not([hidden]) [data-check-id="' + taskId + '"]';
    var target = document.querySelector(selector);
    if (target) {
      target.focus({ preventScroll: true });
      return;
    }
    var tab = document.getElementById("tab-" + state.filter);
    if (tab) {
      tab.focus({ preventScroll: true });
    }
  }

  function bindTabs() {
    var tabs = $all('[role="tab"]');

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activateTab(tab.getAttribute("data-filter"), false);
      });

      tab.addEventListener("keydown", function (event) {
        var nextIndex = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        }

        if (nextIndex === null) {
          return;
        }
        event.preventDefault();
        activateTab(tabs[nextIndex].getAttribute("data-filter"), true);
      });
    });
  }

  function bindActions() {
    document.addEventListener("change", async function (event) {
      var input = event.target.closest ? event.target.closest("[data-check-id]") : null;
      if (!input) {
        return;
      }

      var taskId = input.getAttribute("data-check-id");
      var wasDone = state.done.has(taskId);
      var nextDone = !wasDone;

      if (nextDone) {
        state.done.add(taskId);
      } else {
        state.done.delete(taskId);
      }
      render();
      focusAfterToggle(taskId);

      try {
        await Store.setDone(taskId, nextDone);
        toast(nextDone ? "完成一件，做得不错。" : "已经放回待办。");
      } catch (error) {
        if (nextDone) {
          state.done.delete(taskId);
        } else {
          state.done.add(taskId);
        }
        render();
        toast("状态没保存成功：" + (error && error.message ? error.message : "未知错误"));
      }
    });

    document.addEventListener("click", function (event) {
      if (!Editor || !event.target.closest) {
        return;
      }

      var editButton = event.target.closest("[data-edit-id]");
      if (editButton) {
        var editTask = taskById(editButton.getAttribute("data-edit-id"));
        if (editTask) {
          Editor.open(editTask, saveTask);
        }
        return;
      }

      var deleteButton = event.target.closest("[data-delete-id]");
      if (deleteButton) {
        var deleteTask = taskById(deleteButton.getAttribute("data-delete-id"));
        if (deleteTask) {
          Editor.confirmDelete(deleteTask, function () {
            removeTask(deleteTask);
          });
        }
      }
    });

    var newTaskButton = $("[data-new-task]");
    if (newTaskButton) {
      newTaskButton.addEventListener("click", function () {
        if (Editor) {
          Editor.open(null, saveTask);
        }
      });
    }

    $all("[data-reset]").forEach(function (button) {
      button.addEventListener("click", async function () {
        try {
          await Store.resetDone();
          await reload({ showLoading: false });
          toast("进度已清零，重新开始。");
        } catch (error) {
          toast("重置失败：" + (error && error.message ? error.message : "未知错误"));
        }
      });
    });

    var retryButton = $("[data-retry]");
    if (retryButton) {
      retryButton.addEventListener("click", function () {
        reload();
      });
    }
  }

  function writeToday() {
    var now = new Date();
    var weekdays = Utils.WEEKDAYS;
    var month = now.getMonth() + 1;
    var day = now.getDate();
    setText(
      "[data-today]",
      now.getFullYear() + " 年 " + month + " 月 " + day + " 日 · 星期" +
      weekdays[now.getDay()]
    );
    setText("[data-card-date]", month + " / " + day);
    setText("[data-today-short]", month + "." + day);
    setText("[data-year]", String(now.getFullYear()));
  }

  function setApiState(kind, message) {
    var box = $("[data-api-state]");
    if (!box) {
      return;
    }
    box.hidden = kind !== "loading" && kind !== "error";
    box.classList.toggle("is-error", kind === "error");
    box.setAttribute("data-api-kind", kind || "idle");
    var text = $("[data-api-text]", box);
    if (text) {
      text.textContent = message || "";
    }
  }

  function clearTaskViews() {
    $all("[data-list]").forEach(function (list) {
      list.innerHTML = "";
      list.hidden = true;
    });
    $all("[data-empty]").forEach(function (empty) {
      empty.hidden = true;
    });
    $all("[data-summary]").forEach(function (summary) {
      summary.textContent = "";
    });
    $all("[data-count]").forEach(function (count) {
      count.textContent = "0";
    });
  }

  async function reload(options) {
    var showLoading = !options || options.showLoading !== false;
    if (showLoading) {
      setApiState("loading", "正在从接口加载清单…");
    }
    try {
      state.tasks = await Store.loadTasks();
      state.done = Store.getDone();
      setApiState("idle", "");
      render();
      return true;
    } catch (error) {
      state.tasks = [];
      state.done = new Set();
      clearTaskViews();
      setApiState("error", error && error.message ? error.message : "清单加载失败，请稍后重试。");
      return false;
    }
  }

  async function init() {
    writeToday();
    bindTabs();
    bindActions();
    await reload();
    activateTab("all", false);
  }

  init();
})();
