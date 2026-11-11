/*
 * 任务编辑器：新建、修改、删除确认。
 * 弹窗只负责收集表单，真正的数据保存由清单页 / 详情页决定。
 */
(function () {
  "use strict";

  var Utils = window.TodoUtils;
  var dialog = document.getElementById("task-dialog");
  var form = document.getElementById("task-form");
  var confirmDialog = document.getElementById("confirm-dialog");

  if (!dialog || !form) {
    return;
  }

  var fields = {
    title: document.getElementById("task-title"),
    summary: document.getElementById("task-summary"),
    tag: document.getElementById("task-tag"),
    priority: document.getElementById("task-priority"),
    date: document.getElementById("task-date"),
    time: document.getElementById("task-time"),
    estimate: document.getElementById("task-estimate"),
    steps: document.getElementById("task-steps"),
    note: document.getElementById("task-note")
  };

  var dialogTitle = document.getElementById("task-dialog-title");
  var submitButton = document.getElementById("task-submit");
  var errorBox = document.getElementById("task-form-error");
  var confirmText = document.getElementById("confirm-text");
  var currentTask = null;
  var saveHandler = null;
  var lastFocused = null;

  function trim(value) {
    return String(value == null ? "" : value).trim();
  }

  function todayValue() {
    return Utils.dateInputValue({ dueInDays: 0 });
  }

  function setError(message) {
    if (!errorBox) {
      return;
    }
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    if (!errorBox) {
      return;
    }
    errorBox.textContent = "";
    errorBox.hidden = true;
  }

  function fillForm(task) {
    var editing = Boolean(task);
    form.reset();
    clearError();

    fields.title.value = editing ? task.title : "";
    fields.summary.value = editing ? task.summary : "";
    fields.tag.value = editing && ["学习", "项目", "生活", "复盘"].indexOf(task.tag) !== -1 ? task.tag : "生活";
    fields.priority.value = editing && ["high", "medium", "low"].indexOf(task.priority) !== -1 ? task.priority : "medium";
    fields.date.min = todayValue();
    fields.date.value = editing ? Utils.dateInputValue(task) : todayValue();
    fields.time.value = editing && task.dueTime ? task.dueTime : "22:00";
    fields.estimate.value = editing ? String(Number(task.estimateMinutes) || 30) : "30";
    fields.steps.value = editing && Array.isArray(task.steps) ? task.steps.join("\n") : "";
    fields.note.value = editing && task.note ? task.note : "";

    if (dialogTitle) {
      dialogTitle.textContent = editing ? "编辑任务" : "新建任务";
    }
    if (submitButton) {
      submitButton.textContent = editing ? "保存修改" : "加入清单";
    }
  }

  function readForm() {
    var title = trim(fields.title.value);
    var summary = trim(fields.summary.value);
    var steps = fields.steps.value.split(/\r?\n/).map(function (line) {
      return trim(line).replace(/^[-*•]\s*/, "");
    }).filter(Boolean);
    var estimate = Number(fields.estimate.value);

    if (!title || !summary || !steps.length) {
      setError("标题、一句话描述和至少一个步骤不能为空。");
      return null;
    }
    if (title.length > 60) {
      setError("标题最多 60 个字，短一点更好记。");
      return null;
    }
    if (!fields.date.value) {
      setError("请选一个截止日期。");
      return null;
    }
    if (!fields.time.value) {
      setError("请选一个截止时间。");
      return null;
    }
    if (!Number.isFinite(estimate) || estimate < 5 || estimate > 600) {
      setError("预计用时请填 5 到 600 分钟。");
      return null;
    }

    var task = Object.assign({}, currentTask || {}, {
      id: currentTask ? currentTask.id : "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: title,
      summary: summary,
      tag: fields.tag.value,
      priority: fields.priority.value,
      dueDate: fields.date.value,
      dueTime: fields.time.value,
      estimateMinutes: Math.round(estimate),
      steps: steps,
      note: trim(fields.note.value) || "先做完，再做好看。"
    });

    delete task.dueInDays;
    return task;
  }

  function open(task, onSave) {
    if (dialog.open) {
      return;
    }
    currentTask = task || null;
    saveHandler = onSave;
    lastFocused = document.activeElement;
    fillForm(currentTask);
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    window.setTimeout(function () {
      fields.title.focus();
    }, 30);
  }

  function confirmDelete(task, onConfirm) {
    if (!confirmDialog) {
      if (window.confirm("删除「" + task.title + "」？此操作不可撤销。")) {
        onConfirm();
      }
      return;
    }
    if (confirmDialog.open) {
      return;
    }

    if (confirmText) {
      confirmText.textContent = "「" + task.title + "」会从清单里移除，完成记录也会一起清掉。";
    }
    confirmDialog.returnValue = "";
    confirmDialog.showModal();

    function handleClose() {
      confirmDialog.removeEventListener("close", handleClose);
      if (confirmDialog.returnValue === "confirm") {
        onConfirm();
      }
    }

    confirmDialog.addEventListener("close", handleClose);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearError();

    if (!form.reportValidity()) {
      return;
    }

    var task = readForm();
    if (!task) {
      return;
    }

    var handler = saveHandler;
    var wasEditing = Boolean(currentTask);
    dialog.close();
    if (typeof handler === "function") {
      handler(task, wasEditing);
    }
  });

  Array.prototype.forEach.call(dialog.querySelectorAll("[data-close-dialog]"), function (button) {
    button.addEventListener("click", function () {
      dialog.close();
    });
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", function () {
    clearError();
    currentTask = null;
    saveHandler = null;
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    }
  });

  window.TodoEditor = {
    open: open,
    confirmDelete: confirmDelete
  };
})();
