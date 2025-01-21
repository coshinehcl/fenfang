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
    const weekRanges2 = [];
    while (start <= end) {
      weekRanges2.push(formatDate(start).full);
      start.setDate(start.getDate() + 7);
    }
    return weekRanges2;
  }
  function getMonthRanges(startDateStr, endDateStr) {
    let start = parseDate(startDateStr);
    const end = parseDate(endDateStr);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const monthRanges2 = [];
    while (start <= end) {
      monthRanges2.push(formatDate(start).full);
      start.setMonth(start.getMonth() + 1);
    }
    return monthRanges2;
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
  var defaultKeyDate = [
    {
      belongWeek: "20241010",
      title: "\u793E\u533A\u533B\u9662",
      content: "\u5B55\u916E",
      date: "20241012"
    },
    {
      belongWeek: "20241212",
      title: "\u7B2C1\u6B21\u4EA7\u68C0",
      content: "\u5C3F\u8840",
      date: "20241214"
    },
    {
      belongWeek: "20241212",
      title: "\u7B2C2\u6B21\u4EA7\u68C0",
      content: "NT\u68C0\u67E5",
      date: "20241216"
    },
    {
      belongWeek: "20250102",
      title: "\u7B2C3\u6B21\u4EA7\u68C0",
      content: "\u65E0\u521B",
      date: "20250102"
    },
    {
      belongWeek: "20250116",
      title: "\u7B2C4\u6B21\u4EA7\u68C0",
      content: "\u5C3F\u5E38\u89C4",
      date: "20250120"
    },
    {
      belongWeek: "20250206",
      title: "\u7B2C5\u6B21\u4EA7\u68C0",
      content: "\u56DB\u7EF4\u5F69\u8D85",
      date: "20250208"
    },
    {
      belongWeek: "20250213",
      title: "\u7B2C6\u6B21\u4EA7\u68C0",
      content: "\u5C3F\u5E38\u89C4",
      date: "20250217"
    }
  ];
  var getKeyDateList = () => {
    const keyDateList = localStorage.getItem(babyKeyDateKey);
    if (keyDateList) {
      try {
        const _list = JSON.parse(keyDateList);
        return Array.isArray(_list) ? _list : [];
      } catch (err) {
        return defaultKeyDate;
      }
    } else {
      return defaultKeyDate;
    }
  };
  var setKeyDateList = (list) => {
    localStorage.setItem(babyKeyDateKey, JSON.stringify(list));
  };

  // index.ts
  var startDate = "20240905";
  var endDate = "20250720";
  var weekRanges = getWeekRanges(startDate, endDate);
  var monthRanges = getMonthRanges(startDate, endDate);
  var imageLazy = function imageObserver() {
    const observer = new IntersectionObserver((entries, observer2) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer2.unobserve(img);
        }
      });
    }, {
      rootMargin: "50px"
      // 可以提前一点加载图片
    });
    return observer.observe.bind(observer);
  }();
  function updateItems() {
    const RootNode = document.querySelector(".show-contain");
    if (!RootNode) return;
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
              tagName: "img",
              className: "item-img",
              style: {
                display: item.index >= 1 && item.index <= 40 ? "block" : "none"
              },
              attributes: {
                "data-src": `./images/${item.index}.png`
              },
              returnNode(ele) {
                imageLazy(ele);
              }
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
                  addDialogNode.querySelector(".dialog-date").value = item.date;
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
  function initCurrentDateNodeEvent() {
    const currentDateNode = document.querySelector(".current-date");
    if (!currentDateNode) return;
    const currentDate = getCurrentDate().full;
    const findIndex = weekRanges.findIndex((item) => parseDate(item).getTime() >= parseDate(currentDate).getTime());
    currentDateNode.addEventListener("click", function() {
      if (findIndex === -1) {
        return;
      }
      const targetWeekItem = document.querySelectorAll(".item-wrapper")[findIndex];
      if (targetWeekItem) {
        targetWeekItem.scrollIntoView({
          behavior: "smooth"
        });
      }
    });
  }
  updateItems();
  initCurrentDateNodeEvent();
})();
