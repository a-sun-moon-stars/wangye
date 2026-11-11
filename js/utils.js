/*
 * 页面共用的小工具：日期、时长、转义、标签映射。
 */
(function () {
  "use strict";

  var WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
  var TAG_CLASS = {
    "学习": "study",
    "项目": "project",
    "生活": "life",
    "复盘": "review"
  };
  var PRIORITY = {
    high: { key: "high", label: "重要" },
    medium: { key: "medium", label: "常规" },
    low: { key: "low", label: "轻松" }
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function parseDueDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) {
      return null;
    }
    var date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function getDueDate(task) {
    var explicit = task && parseDueDate(task.dueDate);
    if (explicit) {
      return explicit;
    }

    var offset = Number(task && task.dueInDays);
    if (!Number.isFinite(offset)) {
      offset = 0;
    }
    var date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date;
  }

  function dateInputValue(task) {
    var date = getDueDate(task || { dueInDays: 0 });
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function dueDiff(task) {
    var today = new Date();
    today.setHours(12, 0, 0, 0);
    return Math.round((getDueDate(task) - today) / 86400000);
  }

  function formatDue(task) {
    var date = getDueDate(task);
    var diff = dueDiff(task);
    var label;

    if (diff === 0) {
      label = "今天";
    } else if (diff === 1) {
      label = "明天";
    } else if (diff === 2) {
      label = "后天";
    } else if (diff > 2) {
      label = (date.getMonth() + 1) + "月" + date.getDate() + "日 · 周" + WEEKDAYS[date.getDay()];
    } else {
      label = (date.getMonth() + 1) + "月" + date.getDate() + "日";
    }

    if (task && task.dueTime) {
      label += " " + task.dueTime;
    }
    return label;
  }

  function formatDuration(minutes) {
    var value = Number(minutes);
    if (!Number.isFinite(value) || value <= 0) {
      return "0 分钟";
    }
    var hours = Math.floor(value / 60);
    var rest = Math.round(value % 60);
    if (hours && rest) {
      return hours + " 小时 " + rest + " 分";
    }
    if (hours) {
      return hours + " 小时";
    }
    return rest + " 分钟";
  }

  function tagClass(tag) {
    return TAG_CLASS[tag] || "other";
  }

  function priorityMeta(priority) {
    return PRIORITY[priority] || PRIORITY.medium;
  }

  window.TodoUtils = {
    escapeHtml: escapeHtml,
    getDueDate: getDueDate,
    dateInputValue: dateInputValue,
    dueDiff: dueDiff,
    formatDue: formatDue,
    formatDuration: formatDuration,
    tagClass: tagClass,
    priorityMeta: priorityMeta,
    WEEKDAYS: WEEKDAYS
  };
})();
