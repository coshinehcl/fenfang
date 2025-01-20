"use strict";
(() => {
  // utils/common.ts
  function waitCondition(conditionFun, timeout = 2e3) {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const timer = setInterval(() => {
        if (Date.now() - now > timeout) {
          clearInterval(timer);
          reject(new Error("\u7B49\u5F85\u8D85\u65F6"));
        } else if (conditionFun()) {
          clearInterval(timer);
          resolve(true);
        }
      }, 10);
    });
  }
  function objectKeys(obj) {
    return Object.keys(obj);
  }
  var getCurrentDate = (date) => {
    const _date = date ? new Date(date) : /* @__PURE__ */ new Date();
    const year = String(_date.getFullYear());
    const month = String(_date.getMonth() + 1).padStart(2, "0");
    const day = String(_date.getDate()).padStart(2, "0");
    return {
      year,
      month,
      day,
      full: `${year}${month}${day}`
    };
  };
  function formatDate(date) {
    return getCurrentDate(date);
  }
  function parseDate(dateString) {
    const year = parseInt(dateString.slice(0, 4), 10);
    const month = parseInt(dateString.slice(4, 6), 10) - 1;
    const day = parseInt(dateString.slice(6, 8), 10);
    return new Date(year, month, day);
  }
  function getWeekRanges(startDateStr, endDateStr) {
    let start = parseDate(startDateStr);
    const end = parseDate(endDateStr);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const weekRanges = [];
    while (start <= end) {
      weekRanges.push(formatDate(start).full);
      start.setDate(start.getDate() + 7);
    }
    return weekRanges;
  }
  function getMonthRanges(startDateStr, endDateStr) {
    let start = parseDate(startDateStr);
    const end = parseDate(endDateStr);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const monthRanges = [];
    while (start <= end) {
      monthRanges.push(formatDate(start).full);
      start.setMonth(start.getMonth() + 1);
    }
    return monthRanges;
  }

  // utils/element.ts
  function createElement(config, parentNode) {
    const { tagName, childs, returnNode, returnAttachedNode, ...attrs } = config;
    const node = document.createElement(tagName);
    objectKeys(attrs).forEach((key) => {
      const value = attrs[key];
      if (value === void 0) return;
      if (key === "innerText" || key === "innerHTML" || key === "className") {
        node[key] = value;
      }
      if (key === "cssText") {
        node.style.cssText = value;
      } else if (key === "style") {
        Object.keys(value).forEach((i) => {
          node.style.setProperty(i.replace(/([A-Z])/g, "-$1").toLowerCase(), value[i]);
        });
      } else if (key === "attributes") {
        Object.keys(value).forEach((attrName) => {
          node.setAttribute(attrName, value[attrName]);
        });
      } else if (key === "events") {
        Object.keys(value).forEach((eventName) => {
          node.addEventListener(eventName, value[eventName]);
        });
      }
    });
    if (childs && childs.length) {
      const childsConfig = Array.isArray(childs) ? childs : [childs];
      childsConfig.forEach((childConfigItem) => {
        if (childConfigItem instanceof Element) {
          node.appendChild(childConfigItem);
        } else {
          createElement(childConfigItem, node);
        }
      });
    }
    if (parentNode) {
      parentNode.appendChild(node);
    }
    if (returnNode) {
      returnNode(node);
    }
    if (returnAttachedNode) {
      waitCondition(() => {
        return document.body.contains(node);
      }).then(() => {
        returnAttachedNode(node);
      }).catch(() => {
        returnAttachedNode(node);
      });
    }
    return node;
  }
  var removeChilds = (ele) => {
    if (!ele || !(ele instanceof Element)) return;
    while (ele.firstChild) {
      ele.removeChild(ele.firstChild);
    }
  };

  // utils/storage.ts
  var babyKeyDateKey = "babyKeyDateKey";
  var getKeyDateList = () => {
    const keyDateList = localStorage.getItem(babyKeyDateKey);
    if (keyDateList) {
      try {
        const _list = JSON.parse(keyDateList);
        return Array.isArray(_list) ? _list : [];
      } catch (err) {
        return [];
      }
    } else {
      return [];
    }
  };
  var setKeyDateList = (list) => {
    localStorage.setItem(babyKeyDateKey, JSON.stringify(list));
  };

  // index.ts
  function updateItems() {
    const RootNode = document.querySelector(".show-contain");
    if (!RootNode) return;
    const startDate = "20240905";
    const endDate = "20250720";
    const weekRanges = getWeekRanges(startDate, endDate);
    const monthRanges = getMonthRanges(startDate, endDate);
    const dateRanges = [
      ...weekRanges.map((i, index) => ({ type: "week", date: i, index })),
      ...monthRanges.map((i, index) => ({ type: "month", date: i, index }))
    ];
    dateRanges.sort((a, b) => {
      const aDate = parseDate(a.date).getTime();
      const bDate = parseDate(b.date).getTime();
      return aDate - bDate;
    });
    const keyDateList = getKeyDateList();
    removeChilds(RootNode);
    const addDialogNode = document.querySelector("#addDialog");
    dateRanges.forEach((item) => {
      if (item.type === "week") {
        const currentWeekKeyDates = keyDateList.filter((_item) => _item.belongWeek === item.date);
        createElement({
          tagName: "div",
          className: "item-wrapper",
          childs: [
            {
              tagName: "div",
              className: "item-title-wrapper",
              childs: [
                {
                  tagName: "div",
                  innerHTML: `<span style="color:#FF3366;">\u7B2C${item.index}\u5468</span>`
                },
                {
                  tagName: "div",
                  style: {
                    color: "#999"
                  },
                  innerText: item.date
                }
              ]
            },
            {
              tagName: "div",
              className: "item-content",
              childs: currentWeekKeyDates.map((_item) => {
                let touchstartTime;
                return {
                  tagName: "div",
                  className: "key-date-item",
                  childs: [
                    {
                      tagName: "div",
                      className: "key-date-item-title",
                      innerText: _item.title
                    },
                    {
                      tagName: "div",
                      className: "key-date-item-content",
                      innerText: _item.content || ""
                    },
                    {
                      tagName: "div",
                      className: "key-date-item-date",
                      innerText: _item.date
                    }
                  ],
                  events: {
                    touchstart: () => {
                      touchstartTime = Date.now();
                    },
                    touchend: () => {
                      if (!touchstartTime) return;
                      const touchendTime = Date.now();
                      if (touchendTime - touchstartTime > 300) {
                        const isDelete = confirm("\u662F\u5426\u5220\u9664\u8BE5\u9879\uFF1F");
                        if (isDelete) {
                          setKeyDateList(keyDateList.filter((__item) => __item !== _item));
                          updateItems();
                        }
                      }
                    }
                  }
                };
              })
            },
            {
              tagName: "div",
              className: "item-week-add-btn",
              innerText: "\u672C\u5468\u4EA7\u68C0\u8BB0\u5F55",
              events: {
                click: () => {
                  if (!addDialogNode) return;
                  addDialogNode.style.display = "flex";
                  addDialogNode.dataset.date = item.date;
                }
              }
            }
          ]
        }, RootNode);
      } else {
        createElement({
          tagName: "div",
          className: "item-month-split",
          innerHTML: `<span style="color:#FF3366;">\u7B2C${item.index}\u6708</span>(${item.date})`
        }, RootNode);
      }
    });
    if (!addDialogNode) return;
    addDialogNode.addEventListener("add-finish", function(event) {
      debugger;
      const { title, belongDate, date, content } = event.detail;
      setKeyDateList([...keyDateList, {
        belongWeek: belongDate,
        title,
        date,
        content
      }]);
      updateItems();
    }, { once: true });
  }
  updateItems();
})();
