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
  var getCurrentDate = () => {
    const _date = /* @__PURE__ */ new Date();
    const year = String(_date.getFullYear());
    const month = String(_date.getMonth() + 1).padStart(2, "0");
    const day = String(_date.getDate()).padStart(2, "0");
    return {
      year,
      month,
      day,
      full: `${year}-${month}-${day}`
    };
  };
  var getDayDistance = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const leftDate = new Date(date1).getTime();
    const rightDate = new Date(date2).getTime();
    const millisecondsDiff = leftDate - rightDate;
    const daysDiff = Math.round(millisecondsDiff / (1e3 * 60 * 60 * 24));
    return daysDiff;
  };
  function getFormatNum(num, accuracy = 1) {
    if (accuracy === 0) {
      return Math.round(num);
    } else {
      const acc = Math.pow(10, accuracy);
      return Math.round(num * acc) / acc;
    }
  }
  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }
  function dateFullToNum(date) {
    return Number(date.split("-").join(""));
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

  // utils/customElement.ts
  function initCustomElement(config) {
    class myEle extends HTMLElement {
      constructor() {
        super();
        this.$shadowRoot = this.attachShadow({ mode: "closed" });
      }
      connectedCallback() {
        if (this.$initHandler) {
          this.$initHandler();
        }
      }
      initHandler(data, params) {
        this.$initHandler = () => {
          config.createNode(this.$shadowRoot, data, params);
        };
      }
      active() {
        const wrapperNode = this.$shadowRoot.querySelector(".wrapper");
        if (wrapperNode) {
          wrapperNode.classList.add("active");
          setTimeout(() => {
            wrapperNode.classList.remove("active");
          }, 3e3);
        }
      }
    }
    console.log(config.tagName);
    customElements.define(config.tagName, myEle);
  }
  function createCustomElement(tagName, options, parentNode) {
    const node = document.createElement(tagName);
    node.initHandler(options.data, options.params);
    if (parentNode) {
      parentNode.appendChild(node);
    }
    return node;
  }

  // config/recordList.ts
  var recordItemBelongs = [
    {
      field: "system",
      label: "\u7CFB\u7EDF\u6570\u91CF"
    },
    {
      field: "purchase",
      label: "\u8D2D\u4E70\u6570\u91CF"
    },
    {
      field: "repo",
      label: "\u4ED3\u5E93\u6570\u91CF"
    }
  ];

  // config/materialsList.ts
  var SettlementNum = 120;
  var materialsList = [
    {
      label: "\u6C90\u6D74\u9732",
      list: [
        {
          label: "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
          specs: [
            {
              unit: "\u7BB1",
              spec: 24
            },
            {
              unit: "\u74F6",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum
      },
      unit: "\u74F6"
    },
    {
      label: "\u6D17\u53D1\u6C34",
      list: [
        {
          label: "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
          specs: [
            {
              unit: "\u7BB1",
              spec: 24
            },
            {
              unit: "\u74F6",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum
      },
      unit: "\u74F6"
    },
    {
      label: "\u6D17\u624B\u6DB2",
      list: [
        {
          label: "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
          specs: [
            {
              unit: "\u7BB1",
              spec: 24
            },
            {
              unit: "\u74F6",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum
      },
      unit: "\u74F6"
    },
    {
      label: "\u77FF\u6CC9\u6C34",
      list: [
        {
          label: "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
          specs: [
            {
              unit: "\u7BB1",
              spec: 24
            },
            {
              unit: "\u74F6",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum * 5
      },
      unit: "\u74F6"
    },
    {
      label: "\u7259\u818F",
      list: [
        {
          label: "\u7F8E\u52A0\u51C0\u7259\u818F",
          specs: [
            {
              unit: "\u7BB1",
              spec: 500
            },
            {
              unit: "\u652F",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum * 2
      },
      unit: "\u652F"
    },
    {
      label: "\u62BD\u7EB8",
      list: [
        {
          label: "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
          specs: [
            {
              unit: "\u7BB1",
              spec: 60
            },
            {
              unit: "\u5305",
              spec: 1
            }
          ],
          priority: 1
        },
        {
          label: "\u51E4\u751F\u9762\u5DFE\u7EB8",
          specs: [
            {
              unit: "\u7BB1",
              spec: 60
            },
            {
              unit: "\u5305",
              spec: 1
            }
          ],
          priority: 2
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum
      },
      unit: "\u5305"
    },
    {
      label: "\u5C0F\u5783\u573E\u888B",
      list: [
        {
          label: "\u767D\u8272\u5783\u573E\u888B",
          specs: [
            {
              unit: "\u624E",
              spec: 1e3
            },
            {
              unit: "\u4E2A",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum * 3
      },
      unit: "\u4E2A"
    },
    {
      label: "\u5377\u7EB8",
      list: [
        {
          label: "\u7EA4\u7EAF\u5377\u7EB8",
          specs: [
            {
              unit: "\u5305",
              spec: 10
            },
            {
              unit: "\u63D0",
              spec: 12
            },
            {
              unit: "\u5377",
              spec: 1
            }
          ],
          priority: 1
        },
        {
          label: "\u51E4\u751F\u5377\u7EB8",
          specs: [
            {
              unit: "\u5305",
              spec: 10
            },
            {
              unit: "\u63D0",
              spec: 12
            },
            {
              unit: "\u5377",
              spec: 1
            }
          ],
          priority: 2
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum * 2
      },
      unit: "\u5377"
    },
    {
      label: "\u6210\u4EBA\u62D6\u978B",
      list: [
        {
          label: "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
          specs: [
            {
              unit: "\u5305",
              spec: 700
            },
            {
              unit: "\u53CC",
              spec: 1
            }
          ],
          priority: 3
        },
        {
          label: "\u771F\u7F8E\u5E03\u62D6\u978B",
          specs: [
            {
              unit: "\u5305",
              spec: 500
            },
            {
              unit: "\u53CC",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum * 2
      },
      unit: "\u53CC"
    },
    {
      label: "\u5927\u5783\u573E\u888B",
      list: [
        {
          label: "\u9ED1\u8272\u5783\u573E\u888B",
          specs: [
            {
              unit: "\u5305",
              spec: 20
            },
            {
              unit: "\u624E",
              spec: 50
            },
            {
              unit: "\u4E2A",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum * 2
      },
      unit: "\u4E2A"
    },
    {
      label: "\u8336\u53F6",
      list: [
        {
          label: "\u795E\u53F6\u7EA2\u8336",
          specs: [
            {
              unit: "\u7BB1",
              spec: 50
            },
            {
              unit: "\u76D2",
              spec: 50
            },
            {
              unit: "\u888B",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum
      },
      unit: "\u888B"
    },
    {
      label: "\u513F\u7AE5\u62D6\u978B",
      list: [
        {
          label: "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
          specs: [
            {
              unit: "\u5305",
              spec: 300
            },
            {
              unit: "\u53CC",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum * 2
      },
      unit: "\u53CC"
    },
    {
      label: "\u513F\u7AE5\u7259\u5177\u5957\u9910",
      list: [
        {
          label: "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
          specs: [
            {
              unit: "\u7BB1",
              spec: 250
            },
            {
              unit: "\u5957",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum * 2
      },
      unit: "\u5957"
    },
    {
      label: "\u68B3\u5B50",
      list: [
        {
          label: "\u79F8\u79C6\u9999\u8549\u68B3",
          specs: [
            {
              unit: "\u7BB1",
              spec: 500
            },
            {
              unit: "\u652F",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum * 2
      },
      unit: "\u652F"
    },
    {
      label: "\u6210\u4EBA\u7259\u5237",
      list: [
        {
          label: "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
          specs: [
            {
              unit: "\u7BB1",
              spec: 500
            },
            {
              unit: "\u652F",
              spec: 1
            }
          ],
          priority: 1
        },
        {
          label: "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
          specs: [
            {
              unit: "\u7BB1",
              spec: 500
            },
            {
              unit: "\u652F",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum * 2
      },
      unit: "\u652F"
    },
    {
      label: "\u5496\u5561",
      list: [
        {
          label: "\u9685\u7530\u5DDD\u5496\u5561",
          specs: [
            {
              unit: "\u7BB1",
              spec: 250
            },
            {
              unit: "\u5305",
              spec: 1
            }
          ],
          priority: 1
        }
      ],
      uasge: {
        min: 0,
        max: SettlementNum
      },
      unit: "\u888B"
    }
  ];
  var MaterialsListStorageKey = "materials_list";
  var getNewMaterialsList = () => {
    let list = localStorage.getItem(MaterialsListStorageKey);
    if (list) {
      try {
        return JSON.parse(list);
      } catch (err) {
        return materialsList;
      }
    } else {
      return materialsList;
    }
  };
  var setNewMaterialsList = (list) => {
    localStorage.setItem(MaterialsListStorageKey, JSON.stringify(list));
  };

  // utils/recordData.ts
  var RecordListStorageKey = "materials_recordList";
  var materialsList2 = getNewMaterialsList();
  var getRecordList = () => {
    const recordList = localStorage.getItem(RecordListStorageKey);
    if (recordList) {
      try {
        const _list = JSON.parse(recordList);
        if (Array.isArray(_list)) {
          _list.sort((l, r) => {
            const l_recordDateNumber = Number(l.recordDate.split("-").join(""));
            const r_recordDateNumber = Number(r.recordDate.split("-").join(""));
            if (l_recordDateNumber < r_recordDateNumber) {
              return -1;
            } else if (l_recordDateNumber === r_recordDateNumber) {
              return 0;
            } else {
              return 1;
            }
          });
          return _list;
        } else {
          return [];
        }
      } catch (err) {
        return [];
      }
    } else {
      return [];
    }
  };
  var setRecordList = (recordList) => {
    localStorage.setItem(RecordListStorageKey, JSON.stringify(recordList));
  };
  var removeRecordList = () => {
    localStorage.removeItem(RecordListStorageKey);
  };
  function updateBelongRecordMaterialItemList(oldBelongRecordMaterialItemList) {
    return cloneData(materialsList2).map((i) => {
      const oldMaterialItem = oldBelongRecordMaterialItemList ? oldBelongRecordMaterialItemList.find((x) => x.label === i.label) : void 0;
      const newList = i.list.map((_i) => {
        const oldMaterialItemBrandItem = oldMaterialItem ? oldMaterialItem.list.find((x) => x.label === _i.label) : void 0;
        const newNumList = _i.specs.map((__i, __index) => {
          return {
            unit: __i.unit,
            spec: __i.spec,
            num: oldMaterialItemBrandItem ? oldMaterialItemBrandItem.numList[__index].num : 0
          };
        });
        return {
          label: _i.label,
          priority: _i.priority,
          isDeprecated: _i.isDeprecated || false,
          numList: newNumList
        };
      });
      return {
        label: i.label,
        unit: i.unit,
        list: newList
      };
    });
  }
  var updateRecordList = () => {
    const recordList = getRecordList();
    recordList.forEach((recordItem) => {
      recordItemBelongs.forEach((belong) => {
        recordItem[belong.field] = updateBelongRecordMaterialItemList(recordItem[belong.field]);
      });
    });
    setRecordList(recordList);
  };
  var getRecordItem = (type, date) => {
    const recordList = getRecordList();
    let oldRecordItem;
    if (type === "modifyData") {
      oldRecordItem = recordList.find((i) => i.recordDate === date);
    }
    const recordItem = {
      recordDate: date
    };
    recordItemBelongs.forEach((belong) => {
      recordItem[belong.field] = updateBelongRecordMaterialItemList(oldRecordItem?.[belong.field]);
    });
    return recordItem;
  };
  var getRecordBrandItemTotalInfo = (brandItem) => {
    let total = 0, totalTexts = [];
    brandItem.numList.forEach((numListItem, numListIndex) => {
      let currentTotal = 0;
      if (numListItem.num) {
        const currentTotalTexts = [`${numListItem.num}${numListItem.unit}`];
        currentTotal = numListItem.num * numListItem.spec;
        for (let j = numListIndex + 1; j < brandItem.numList.length; j++) {
          currentTotalTexts.push(`${brandItem.numList[j - 1].spec}${brandItem.numList[j].unit}`);
          currentTotal = currentTotal * brandItem.numList[j].spec;
        }
        totalTexts.push(currentTotalTexts.join("*"));
      }
      total += currentTotal;
    });
    return { total, totalText: totalTexts.join("+") };
  };
  var getRecordMaterialItemTotalInfo = (materialItem) => {
    return materialItem.list.map((brandItem) => getRecordBrandItemTotalInfo(brandItem));
  };
  function formatSpecNum(specs, num) {
    const _specs = JSON.parse(JSON.stringify(specs)) || [];
    let value = num;
    let str;
    if (num > 0) {
      const valueFormatList = [];
      _specs.reverse().forEach((_i, _index) => {
        if (_index === 0) {
          valueFormatList.push({
            value: num,
            unit: _i.unit
          });
        } else {
          num = num / _i.spec;
          valueFormatList.push({
            value: getFormatNum(num),
            unit: _i.unit
          });
        }
      });
      return valueFormatList;
    } else {
      return [{
        value: num,
        unit: _specs.slice(-1)[0].unit
      }];
    }
  }

  // utils/tsHelp.ts
  function objectKeys(obj) {
    return Object.keys(obj);
  }

  // src/createForm.ts
  function getLastRecordItem(date) {
    const recordList = getRecordList();
    const currentDateNum = dateFullToNum(date);
    const beforeRecordList = recordList.filter((i) => {
      const recordDataNum = dateFullToNum(i.recordDate);
      return recordDataNum < currentDateNum;
    });
    if (beforeRecordList.length) {
      return beforeRecordList.slice(-1)[0];
    } else {
      return void 0;
    }
  }
  var createForm = (options) => {
    const { parentNode, createDateNode, createSubmitNodes, getFormData, params } = options;
    const formWrapperNode = createElement({
      tagName: "div",
      className: "form-content-wrapper",
      childs: [
        {
          tagName: "div",
          className: "form-date-wrapper",
          returnNode(ele) {
            params.pageNavManager.addPageNav(ele, "\u9009\u62E9\u65E5\u671F");
          },
          childs: [
            {
              tagName: "div",
              innerText: "\u9009\u62E9\u65E5\u671F"
            },
            createDateNode(renderForm)
          ]
        },
        {
          tagName: "div",
          className: "form-content"
        }
      ]
    }, parentNode);
    const formContentNode = formWrapperNode.querySelector(".form-content");
    function renderForm(date) {
      if (!formContentNode) return;
      removeChilds(formContentNode);
      params.pageNavManager.updatePageNav();
      if (!date) return;
      const currentRecordItem = getFormData(date);
      const lastRecordItem = getLastRecordItem(date);
      recordItemBelongs.forEach((belong, belongIndex) => {
        if (belong.field === "repo" && options.type === "newData") {
          createElement({
            tagName: "div",
            innerText: `\u8BF7\u786E\u4FDD\u5176\u4ED6\u6570\u636E\u586B\u5199\u5B8C\u6210\u518D\u586B\u5199${belong.label}`,
            style: {
              margin: "10px 0",
              textAlign: "center"
            },
            events: {
              click() {
                submitWrapperNode.scrollIntoView({
                  behavior: "smooth"
                });
              }
            }
          }, formContentNode);
        }
        createElement({
          tagName: "div",
          className: "form-belong",
          returnNode(ele) {
            params.pageNavManager.addPageNav(ele, belong.label);
          },
          attributes: {
            "data-belong": belong.label
          },
          childs: [
            {
              tagName: "div",
              className: "form-belong-title",
              innerText: belong.label
            },
            {
              tagName: "div",
              className: "form-belong-wrapper",
              childs: currentRecordItem[belong.field].map((i, index) => {
                const lastMaterialItem = lastRecordItem ? lastRecordItem[belong.field].find((x) => x.label === i.label) : void 0;
                const myInputsNode = createCustomElement("my-inputs", {
                  data: i,
                  params: {
                    belong: belong.field,
                    belongText: belong.label,
                    onlyDisplayLastSpecInput: belong.field === "system",
                    pageScrollToNextBelongSelf: () => {
                      let nextBelongIndex = belongIndex + 1;
                      if (belongIndex === recordItemBelongs.length - 1) {
                        nextBelongIndex = 0;
                      }
                      formContentNode.querySelectorAll(".form-belong")[nextBelongIndex].querySelectorAll("my-inputs")[index].scrollIntoView({
                        behavior: "smooth"
                      });
                    },
                    lastMaterialItem,
                    currentRecordItem
                  }
                });
                return myInputsNode;
              })
            }
          ]
        }, formContentNode);
      });
      const submitWrapperNode = createElement({
        tagName: "div",
        className: "form-submit-wrapper",
        returnNode(ele) {
          params.pageNavManager.addPageNav(ele, "\u63D0\u4EA4");
        },
        childs: createSubmitNodes(currentRecordItem)
      }, formContentNode);
    }
  };

  // src/newData.ts
  var newData = (parentNode, params) => {
    createForm({
      type: "newData",
      params,
      parentNode,
      getFormData(date) {
        return getRecordItem("newData", date);
      },
      createDateNode(renderForm) {
        return {
          tagName: "input",
          className: "form-date",
          attributes: {
            type: "date",
            value: "",
            max: getCurrentDate().full
          },
          events: {
            change(event) {
              let recordDate = event.target?.value;
              function update() {
                renderForm(recordDate);
              }
              if (!recordDate) {
                update();
                return;
              }
              const recordList = getRecordList();
              if (getDayDistance(recordDate, getCurrentDate().full) > 0) {
                alert("\u4E0D\u80FD\u9009\u62E9\u672A\u6765\u65E5\u671F");
                recordDate = void 0;
                update();
                return;
              } else if (recordList.length > 1 && getDayDistance(recordDate, recordList.slice(-1)[0].recordDate) < 0) {
                alert(`\u8981\u5927\u4E8E\u6700\u8FD1\u8BB0\u5F55\u65E5\u671F:${recordList.slice(-1)[0].recordDate}`);
                recordDate = void 0;
                update();
                return;
              }
              const findItem = recordList.find((i) => i.recordDate === recordDate);
              if (findItem) {
                alert("\u6570\u636E\u5217\u8868\u4E2D\u5DF2\u6709\u8BE5\u65E5\u671F\u7684\u6570\u636E\u8BB0\u5F55");
                event.target.value = "";
                recordDate = void 0;
                update();
                return;
              }
              update();
            }
          }
        };
      },
      createSubmitNodes(data) {
        return [
          {
            tagName: "div",
            className: "form-submit-item",
            innerText: "\u63D0\u4EA4",
            events: {
              click(e) {
                const recordList = getRecordList();
                recordList.push(data);
                setRecordList(recordList);
                alert("\u63D0\u4EA4\u6210\u529F");
                location.reload();
              }
            }
          }
        ];
      }
    });
  };

  // src/modifyData.ts
  var modifyData = (parentNode, params) => {
    createForm({
      type: "modifyData",
      params,
      parentNode,
      getFormData(date) {
        return getRecordItem("modifyData", date);
      },
      createDateNode(renderForm) {
        const recordList = getRecordList();
        return {
          tagName: "select",
          className: "form-date",
          attributes: {
            placeholder: "\u8BF7\u9009\u62E9",
            value: ""
          },
          childs: [
            {
              tagName: "option",
              attributes: {
                value: ""
              },
              innerText: "\u8BF7\u9009\u62E9"
            },
            ...recordList.reverse().map((recordItem) => {
              return {
                tagName: "option",
                attributes: {
                  value: recordItem.recordDate
                },
                innerText: recordItem.recordDate
              };
            })
          ],
          events: {
            input(e) {
              if (!e.target) return;
              const recordDate = e.target.value;
              renderForm(recordDate);
            }
          }
        };
      },
      createSubmitNodes(data) {
        return [
          {
            tagName: "div",
            className: "form-submit-item",
            style: {
              color: "red"
            },
            innerText: "\u79FB\u9664",
            events: {
              click() {
                const confirm = window.confirm("\u786E\u5B9A\u79FB\u9664\u5417\uFF1F");
                if (!confirm) return;
                const list = getRecordList();
                const findIndex = list.findIndex((i) => i.recordDate === data.recordDate);
                if (findIndex !== -1) {
                  list.splice(findIndex, 1);
                  setRecordList(list);
                  alert("\u79FB\u9664\u6210\u529F");
                  location.reload();
                } else {
                  alert(`\u79FB\u9664\u5931\u8D25:${findIndex}`);
                }
              }
            }
          },
          {
            tagName: "div",
            className: "form-submit-item",
            innerText: "\u4FEE\u6539",
            events: {
              click() {
                const list = getRecordList();
                const findIndex = list.findIndex((i) => i.recordDate === data.recordDate);
                if (findIndex !== -1) {
                  list.splice(findIndex, 1, data);
                  setRecordList(list);
                  alert("\u4FEE\u6539\u6210\u529F");
                  location.reload();
                } else {
                  alert(`\u4FEE\u6539\u5931\u8D25:${findIndex}`);
                }
              }
            }
          }
        ];
      }
    });
  };

  // src/viewData.ts
  var materialsList3 = getNewMaterialsList();
  function getChartItemBasicInfoList() {
    const recordList = getRecordList();
    const viewDataItemList = [];
    materialsList3.forEach((materialItem) => {
      viewDataItemList.push({
        label: materialItem.label,
        basicInof: {
          uasge: materialItem.uasge,
          unit: materialItem.unit,
          brandList: materialItem.list
        },
        recordList: []
      });
    });
    recordList.forEach((recordItem) => {
      recordItemBelongs.forEach((belongItem) => {
        viewDataItemList.forEach((viewDataItem) => {
          const _item = recordItem[belongItem.field].find((x) => x.label === viewDataItem.label);
          if (_item) {
            const viewDataItemRecordListItem = viewDataItem.recordList.find((x) => x.recordDate === recordItem.recordDate);
            if (!viewDataItemRecordListItem) {
              viewDataItem.recordList.push({
                recordDate: recordItem.recordDate,
                [belongItem.field]: _item
              });
            } else {
              viewDataItemRecordListItem[belongItem.field] = _item;
            }
          }
        });
      });
    });
    return cloneData(viewDataItemList);
  }
  function getChartItemRenderDataBasicList(list) {
    return list.map((materialItem) => {
      const brandList = [];
      materialItem.recordList.forEach((recordItem) => {
        recordItemBelongs.forEach((belong) => {
          recordItem[belong.field].list.forEach((recordBrandItem, recordBrandIndex) => {
            if (!brandList[recordBrandIndex]) {
              brandList[recordBrandIndex] = [];
            }
            const findItem = brandList[recordBrandIndex].find((x) => x.recordDate === recordItem.recordDate);
            if (findItem) {
              findItem[belong.field] = getRecordBrandItemTotalInfo(recordBrandItem).total;
            } else {
              const defaultValueObj = recordItemBelongs.reduce((total, cur) => {
                total[cur.field] = 0;
                return total;
              }, {});
              brandList[recordBrandIndex].push({
                recordDate: recordItem.recordDate,
                label: recordBrandItem.label,
                priority: recordBrandItem.priority,
                isDeprecated: recordBrandItem.isDeprecated,
                // 默认值，避免ts报错
                ...defaultValueObj,
                [belong.field]: getRecordBrandItemTotalInfo(recordBrandItem).total
              });
            }
          });
        });
      });
      const materialItemRenderList = [];
      materialItem.recordList.forEach((recordItem, recordIndex) => {
        const defaultValueObj = recordItemBelongs.reduce((total, cur) => {
          total[cur.field] = 0;
          return total;
        }, {});
        const materialItemRenderListItem = {
          label: materialItem.label,
          recordDate: recordItem.recordDate,
          ...defaultValueObj
        };
        recordItemBelongs.forEach((belong) => {
          materialItemRenderListItem[belong.field] = brandList.reduce((total, cur) => {
            total += cur[recordIndex][belong.field] || 0;
            return total;
          }, 0);
        });
        materialItemRenderList.push(materialItemRenderListItem);
      });
      return {
        ...materialItem,
        renderData: {
          materialItem: materialItemRenderList,
          brandList
        }
      };
    });
  }
  function generateIncrementalArray(n) {
    if (n <= 0) return [];
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const sum = arr.reduce((acc, val) => acc + val, 0);
    const normalizedArr = arr.map((val) => val / sum);
    const lastThreeArr = normalizedArr.slice(-3);
    const lastThreeSum = lastThreeArr.reduce((acc, val) => acc + val, 0);
    return [...normalizedArr.slice(0, -3), ...lastThreeArr.map((i) => lastThreeSum / lastThreeArr.length)];
  }
  function getAverageNum(list) {
    const useIndex = list.findIndex((i) => i.dayUse !== "-" && i.dayUse !== 0);
    if (useIndex === -1) {
      return "-";
    } else {
      const _list = list.slice(useIndex).filter((i) => i.dayUse !== "-");
      if (_list.length > 0) {
        const incrementalArray = generateIncrementalArray(_list.length);
        return _list.reduce((total, cur, index) => {
          total += cur.dayUse * incrementalArray[index];
          return getFormatNum(total);
        }, 0);
      } else {
        return "-";
      }
    }
  }
  function getMaterialOutSuggestInfo(item, basicInfo) {
    const { repo, system, dayUse, averageDayUse } = item;
    const { min, max } = basicInfo.uasge;
    let outSuggest = "-";
    let outSuggestText = "";
    if (!averageDayUse || averageDayUse === "-") {
      return {
        outSuggest,
        outSuggestText: `\u7CFB\u7EDF(${system})\u4ED3\u5E93(${repo})`
      };
    }
    const systemCompareRepoMoreNum = system - repo;
    const planOutNum = getFormatNum(averageDayUse + systemCompareRepoMoreNum / 30);
    const outSuggestTextBase = `\u7CFB\u7EDF(${system})\u4ED3\u5E93(${repo})\u5747\u65E5\u8017(${averageDayUse})\u8BA1\u5212(${planOutNum})`;
    if (systemCompareRepoMoreNum > 0) {
      if (planOutNum >= max) {
        outSuggest = max;
        outSuggestText = `${outSuggestTextBase};\u7CFB\u7EDF\u8FDC\u591A\u4E8E\u4ED3\u5E93,\u51FA\u5E93:max(<strong>${outSuggest}</strong>)`;
      } else {
        outSuggest = planOutNum;
        outSuggestText = `${outSuggestTextBase};\u7CFB\u7EDF\u591A\u4E8E\u4ED3\u5E93,\u51FA\u5E93:(<strong>${outSuggest}</strong>)`;
      }
    } else {
      if (planOutNum <= min) {
        outSuggest = min;
        outSuggestText = `${outSuggestTextBase};\u7CFB\u7EDF\u8FDC\u5C11\u4E8E\u4ED3\u5E93,\u51FA\u5E93:min(<strong>${outSuggest}</strong>)`;
      } else {
        outSuggest = planOutNum;
        outSuggestText = `${outSuggestTextBase};\u7CFB\u7EDF\u8FDC\u5C11\u4E8E\u4ED3\u5E93,\u51FA\u5E93:(<strong>${outSuggest}</strong>)`;
      }
    }
    return {
      outSuggest: getFormatNum(outSuggest),
      outSuggestText
    };
  }
  function getChartItemRenderDataComputedList(list) {
    return list.map((chartBasicItem) => {
      const newRenderDataMaterialItemList = [];
      chartBasicItem.renderData.materialItem.forEach((materialItemRenderListItem, index) => {
        if (index === 0) {
          newRenderDataMaterialItemList.push({
            ...materialItemRenderListItem,
            dayUse: "-",
            weekUse: "-",
            averageDayUse: "-",
            availableDay: "-",
            outSuggest: "-",
            outSuggestText: "",
            purchaseSuggest: 0,
            purchaseSuggestText: ""
          });
        } else {
          const lastItem = chartBasicItem.renderData.materialItem[index - 1];
          const dayDistance = getDayDistance(materialItemRenderListItem.recordDate, lastItem.recordDate);
          const useNum = lastItem.repo + materialItemRenderListItem.purchase - materialItemRenderListItem.repo;
          const dayUse = getFormatNum(useNum / dayDistance);
          newRenderDataMaterialItemList.push({
            ...materialItemRenderListItem,
            dayUse,
            weekUse: getFormatNum(dayUse * 7),
            averageDayUse: "-",
            availableDay: "-",
            outSuggest: "-",
            outSuggestText: "",
            purchaseSuggest: 0,
            purchaseSuggestText: ""
          });
          const lastPushItem = newRenderDataMaterialItemList.slice(-1)[0];
          lastPushItem.averageDayUse = getAverageNum(newRenderDataMaterialItemList);
          if (lastPushItem.averageDayUse !== "-") {
            let getBrandPerchaseFormatNum2 = function(num) {
              const lastFormatItem = formatSpecNum(chartBasicItem.basicInof.brandList[0].specs, num).slice(-1)[0];
              return `(<strong>${lastFormatItem.value}${lastFormatItem.unit}<strong>)`;
            };
            var getBrandPerchaseFormatNum = getBrandPerchaseFormatNum2;
            lastPushItem.availableDay = getFormatNum(lastPushItem.repo / lastPushItem.averageDayUse);
            let availableDay = lastPushItem.availableDay;
            const needSufficeDay = 40;
            if (index === chartBasicItem.renderData.materialItem.length - 1) {
              const dayDistance2 = getDayDistance(getCurrentDate().full, lastItem.recordDate);
              const currentRepoNum = getFormatNum(lastPushItem.repo - lastPushItem.averageDayUse * dayDistance2);
              if (availableDay - dayDistance2 >= needSufficeDay) {
                lastPushItem.purchaseSuggestText = `\u5230\u76EE\u524D\u4E3A\u6B62,\u4ED3\u5E93${currentRepoNum}\u5747\u65E5\u8017${lastPushItem.averageDayUse},\u53EF\u7528${getFormatNum(availableDay - dayDistance2)}\u5929,\u65E0\u9700\u8D2D\u4E70`;
              } else if (availableDay <= dayDistance2) {
                lastPushItem.purchaseSuggest = getFormatNum(needSufficeDay * lastPushItem.averageDayUse);
                lastPushItem.purchaseSuggestText = `\u5230\u76EE\u524D\u4E3A\u6B62,\u4ED3\u5E93${currentRepoNum}\u5747\u65E5\u8017${lastPushItem.averageDayUse},\u9700\u8981\u8D2D\u4E70${lastPushItem.purchaseSuggest}${getBrandPerchaseFormatNum2(lastPushItem.purchaseSuggest)}`;
              } else {
                lastPushItem.purchaseSuggest = getFormatNum((needSufficeDay - availableDay + dayDistance2) * lastPushItem.averageDayUse);
                lastPushItem.purchaseSuggestText = `\u5230\u76EE\u524D\u4E3A\u6B62,\u4ED3\u5E93${currentRepoNum}\u5747\u65E5\u8017${lastPushItem.averageDayUse},\u53EF\u7528${getFormatNum(availableDay - dayDistance2)}\u5929,\u9700\u8981\u8D2D\u4E70${lastPushItem.purchaseSuggest}${getBrandPerchaseFormatNum2(lastPushItem.purchaseSuggest)}`;
              }
            } else {
              if (availableDay >= needSufficeDay) {
                lastPushItem.purchaseSuggestText = `\u65E0\u9700\u8D2D\u4E70,\u4ED3\u5E93${lastPushItem.repo}\u5747\u65E5\u8017${lastPushItem.averageDayUse},\u53EF\u7528${availableDay}\u5929`;
              } else {
                lastPushItem.purchaseSuggest = getFormatNum((needSufficeDay - availableDay) * lastPushItem.averageDayUse);
                lastPushItem.purchaseSuggestText = `\u4ED3\u5E93${lastPushItem.repo}\u5747\u65E5\u8017${lastPushItem.averageDayUse},\u53EF\u7528${availableDay}\u5929\uFF0C\u9700\u8981\u8D2D\u4E70${lastPushItem.purchaseSuggest}${getBrandPerchaseFormatNum2(lastPushItem.purchaseSuggest)}`;
              }
            }
          }
          const outSuggestInfo = getMaterialOutSuggestInfo(lastPushItem, chartBasicItem.basicInof);
          lastPushItem.outSuggest = outSuggestInfo.outSuggest;
          lastPushItem.outSuggestText = outSuggestInfo.outSuggestText;
        }
      });
      const newRenderDataRenderList = [];
      chartBasicItem.renderData.brandList.forEach((brandRenderListItem, index1) => {
        brandRenderListItem.forEach((brandRenderItem, index2) => {
          if (index2 === 0) {
            newRenderDataRenderList.push([{
              ...brandRenderItem,
              dayUse: "-",
              weekUse: "-",
              averageDayUse: "-",
              availableDay: "-",
              outSuggest: "-",
              outSuggestText: "",
              purchaseSuggest: 0,
              purchaseSuggestText: ""
            }]);
          } else {
            const lastItem = chartBasicItem.renderData.brandList[index1][index2 - 1];
            const dayDistance = getDayDistance(brandRenderItem.recordDate, lastItem.recordDate);
            const useNum = lastItem.repo + brandRenderItem.purchase - brandRenderItem.repo;
            const dayUse = getFormatNum(useNum / dayDistance);
            newRenderDataRenderList[index1].push({
              ...brandRenderItem,
              dayUse,
              weekUse: getFormatNum(dayUse * 7),
              averageDayUse: "-",
              availableDay: "-",
              outSuggest: "-",
              outSuggestText: "",
              purchaseSuggest: 0,
              purchaseSuggestText: ""
            });
            const lastPushItem = newRenderDataRenderList[index1].slice(-1)[0];
            lastPushItem.averageDayUse = getAverageNum(newRenderDataRenderList[index1]);
            if (lastPushItem.averageDayUse !== "-") {
              lastPushItem.availableDay = getFormatNum(lastPushItem.repo / lastPushItem.averageDayUse);
            }
            if (chartBasicItem.renderData.brandList.length === 1) {
              lastPushItem.outSuggest = newRenderDataMaterialItemList[index2].outSuggest;
              lastPushItem.outSuggestText = newRenderDataMaterialItemList[index2].outSuggestText;
              lastPushItem.purchaseSuggest = newRenderDataMaterialItemList[index2].purchaseSuggest;
              lastPushItem.purchaseSuggestText = newRenderDataMaterialItemList[index2].purchaseSuggestText;
            } else {
              const outSuggestInfo = getMaterialOutSuggestInfo(lastPushItem, chartBasicItem.basicInof);
              lastPushItem.outSuggest = outSuggestInfo.outSuggest;
              lastPushItem.outSuggestText = outSuggestInfo.outSuggestText;
            }
          }
        });
      });
      return {
        ...chartBasicItem,
        renderData: {
          materialItem: newRenderDataMaterialItemList,
          brandList: newRenderDataRenderList
        }
      };
    });
  }
  var viewData = async (parentNode, params) => {
    const chartItemBasicInfoList = getChartItemBasicInfoList();
    const chartItemBasicRenderDataList = getChartItemRenderDataBasicList(chartItemBasicInfoList);
    const chartItemList = getChartItemRenderDataComputedList(chartItemBasicRenderDataList);
    await waitCondition(() => {
      return Chart !== void 0;
    });
    if (!Chart.registry.plugins.datalabels) {
      Chart.register(ChartDataLabels);
    }
    params.pageNavManager.updatePageNav();
    const chartSelectOptionsFieldMap = {
      system: "\u7CFB\u7EDF",
      repo: "\u4ED3\u5E93",
      purchase: "\u8D2D\u4E70",
      dayUse: "\u65E5\u8017",
      weekUse: "\u5468\u8017",
      outSuggest: "\u51FA\u5E93\u5EFA\u8BAE",
      purchaseSuggest: "\u8D2D\u4E70\u5EFA\u8BAE",
      averageDayUse: "\u5747\u65E5\u8017",
      availableDay: "\u53EF\u7528\u5929\u6570"
    };
    const chartSelectOptions = [
      {
        label: "\u6570\u91CF\u5BF9\u6BD4",
        list: ["system", "repo"],
        footer: [(item) => {
          return `\u7CFB\u7EDF${item.system},\u4ED3\u5E93${item.repo},\u76F8\u5DEE<strong>${getFormatNum(item.system - item.repo)}</strong>`;
        }]
      },
      {
        label: "\u6D88\u8017\u5BF9\u6BD4",
        list: ["dayUse", "averageDayUse"],
        footer: [(item) => {
          return `\u65E5\u8017${item.dayUse},\u5747\u65E5\u8017<strong>${item.availableDay}</strong>`;
        }]
      },
      {
        label: "\u51FA\u5E93\u5EFA\u8BAE",
        list: ["averageDayUse", "outSuggest"],
        footer: ["outSuggestText"]
      },
      {
        label: "\u8D2D\u4E70\u5EFA\u8BAE",
        list: ["availableDay", "purchaseSuggest"],
        footer: ["purchaseSuggestText"]
      }
    ];
    const chartWrapperNode = createElement({
      tagName: "div",
      className: "chart-wrapper",
      childs: [
        {
          tagName: "div",
          className: "chart-select-wrapper",
          returnNode(ele) {
            params.pageNavManager.addPageNav(ele, "\u9009\u62E9\u56FE\u8868");
          },
          childs: [
            {
              tagName: "label",
              innerText: "\u9009\u62E9\u56FE\u8868"
            },
            {
              tagName: "select",
              className: "chart-select",
              events: {
                change(e) {
                  if (!e.target) return;
                  render(e.target.value);
                }
              },
              childs: [
                {
                  tagName: "option",
                  attributes: {
                    value: ""
                  },
                  innerText: "\u8BF7\u9009\u62E9"
                },
                ...chartSelectOptions.map((i) => {
                  return {
                    tagName: "option",
                    attributes: {
                      value: i.label
                    },
                    innerText: i.label
                  };
                })
              ]
            }
          ]
        },
        {
          tagName: "div",
          className: "chart-content"
        }
      ]
    }, parentNode);
    function render(chartLabelStr = "") {
      const chartContentNode = chartWrapperNode.querySelector(".chart-content");
      if (!chartContentNode) return;
      removeChilds(chartContentNode);
      params.pageNavManager.updatePageNav();
      if (!chartLabelStr) return;
      const findChartLabelItem = chartSelectOptions.find((i) => i.label === chartLabelStr);
      if (!findChartLabelItem) return;
      chartItemList.forEach((chartItem) => {
        const myCharts2 = createCustomElement("my-charts", {
          data: chartItem,
          params: {
            label: chartItem.label,
            datasetsLabels: findChartLabelItem.list,
            footer: findChartLabelItem.footer,
            datasetsLabelsMap: chartSelectOptionsFieldMap
          }
        });
        createElement({
          tagName: "div",
          className: "chart-item",
          returnNode(ele) {
            params.pageNavManager.addPageNav(ele, chartItem.label);
          },
          childs: [
            {
              tagName: "div",
              className: "chart-item-title",
              innerText: chartItem.label
            },
            myCharts2
          ]
        }, chartContentNode);
      });
    }
    render();
  };

  // src/inOutData.ts
  var inOutData = (parentNode, params) => {
    const jsonId = "\u4ED3\u5E93\u7269\u6599";
    function downloadJSON() {
      const jsonString = JSON.stringify({
        jsonId,
        // 作为鉴别是不是本json
        list: getRecordList()
      }, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `\u4ED3\u5E93\u7269\u6599\u6570\u636E(${getCurrentDate().full})`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
    createElement({
      tagName: "div",
      className: "in-out-block",
      childs: [{
        tagName: "input",
        attributes: {
          type: "file",
          id: "inOutInput",
          accept: ".json"
        },
        style: {
          display: "none"
        },
        events: {
          input(event) {
            const target = event.target;
            if (!target || !target.files) return;
            const file = target.files[0];
            if (file.type !== "application/json") {
              alert("\u8BF7\u9009\u62E9 JSON \u6587\u4EF6\uFF01");
              target.value = "";
              return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
              let jsonData;
              if (!e.target) {
                return;
              }
              try {
                jsonData = JSON.parse(e.target.result);
              } catch (error) {
                alert("\u6587\u4EF6\u5185\u5BB9\u4E0D\u662F\u6709\u6548\u7684 JSON \u683C\u5F0F\uFF01");
                return;
              }
              if (jsonData && jsonData.jsonId === jsonId) {
                setRecordList(jsonData.list);
                alert("\u5BFC\u5165\u6210\u529F");
              } else {
                alert("JSON \u683C\u5F0F\u4E0D\u5BF9\uFF0C\u8BF7\u68C0\u67E5\uFF01");
              }
              target.value = "";
            };
            reader.readAsText(file);
          }
        }
      }, {
        tagName: "label",
        className: "in-out-btn",
        innerText: "\u5BFC\u5165",
        attributes: {
          for: "inOutInput"
        }
      }, {
        tagName: "div",
        className: "in-out-btn",
        innerText: "\u5BFC\u51FA",
        events: {
          click() {
            downloadJSON();
          }
        }
      }, {
        tagName: "div",
        className: "in-out-btn",
        innerText: "\u6E05\u7A7A\u672C\u5730\u7F13\u5B58",
        events: {
          click() {
            const confirm = window.confirm("\u786E\u8BA4\u6E05\u7A7A\u5417\uFF1F");
            if (confirm) {
              removeRecordList();
              alert("\u5DF2\u6E05\u7A7A\uFF0C\u6062\u590D\u9ED8\u8BA4\u6570\u636E");
              location.reload();
            }
          }
        }
      }]
    }, parentNode);
  };

  // components/chart/index.ts
  var myCharts = {
    tagName: "my-charts",
    createNode(shadowRoot, data, params) {
      createElement({
        tagName: "link",
        attributes: {
          rel: "stylesheet",
          href: "./dist/chart.css"
        }
      }, shadowRoot);
      const childsCanvasList = [];
      const renderData = data.renderData;
      function generateCanvasElementConfig(canvasData, specs) {
        if (!canvasData.length) return;
        function initChartCanvas(ele) {
          if (!ele) return;
          new Chart(ele.getContext("2d"), {
            type: "line",
            data: {
              // 横坐标
              labels: canvasData.map((i) => i.recordDate),
              datasets: params.datasetsLabels.map((field) => {
                return {
                  /** 块 */
                  label: params.datasetsLabelsMap[field],
                  /** 这个块对应的数据 */
                  data: canvasData.map((i) => i[field])
                };
              })
            },
            options: {
              responsive: true,
              // 确保图表响应式
              maintainAspectRatio: false,
              // 
              plugins: {
                legend: {
                  position: "top",
                  // 将 legend 放置在顶部
                  align: "center",
                  // 水平居中对齐
                  labels: {
                    font: {
                      size: 12
                    },
                    color: (context) => {
                      return "#315efb";
                    }
                  }
                },
                datalabels: {
                  color: "#333",
                  // 文字颜色，白色
                  backgroundColor: function(context) {
                    return context.dataset.backgroundColor;
                  },
                  clamp: true,
                  offset: function(context) {
                    return 50;
                  },
                  rotation: function(context) {
                    const datasetIndex = context.datasetIndex;
                    if (datasetIndex === 0) {
                      return -45;
                    } else if (datasetIndex === 1) {
                      return 0;
                    } else {
                      return 45;
                    }
                  },
                  font: {
                    size: 12
                  }
                }
              }
            }
          });
        }
        function getSpecsText() {
          if (specs) {
            let text = "";
            specs.forEach((i, index) => {
              if (index === 0) {
                text = `1${i.unit}`;
              } else {
                text += `*${specs[index - 1].spec}${i.unit}`;
              }
            });
            return text;
          }
          return "";
        }
        function generateFooterNodes() {
          if (!params.footer.length) return [];
          const showArr = canvasData.slice(-3).reverse();
          return params.footer.map((field) => ({
            tagName: "div",
            className: "item-type-wrapper",
            childs: showArr.map((i) => {
              let v;
              if (typeof field === "function") {
                v = field(i);
              } else {
                v = i[field];
              }
              return {
                tagName: "div",
                className: "item",
                style: {
                  display: v ? "block" : "none"
                },
                childs: [
                  {
                    tagName: "div",
                    className: "item-record-date",
                    innerText: i.recordDate
                  },
                  {
                    tagName: "div",
                    className: "item-content",
                    innerHTML: v
                  }
                ]
              };
            })
          }));
        }
        const canvasItemWrapper = {
          tagName: "div",
          className: "canvas-item-wrapper",
          childs: [
            {
              tagName: "div",
              className: "canvas-item-title",
              childs: [
                {
                  tagName: "div",
                  innerText: canvasData[0].label
                },
                {
                  tagName: "div",
                  style: {
                    color: "var(--infoColor)",
                    fontSize: "12px"
                  },
                  innerText: getSpecsText()
                }
              ]
            },
            {
              tagName: "div",
              className: "canvas-body-wrapper",
              childs: [
                {
                  tagName: "canvas",
                  className: "canvas",
                  returnAttachedNode: initChartCanvas
                }
              ]
            },
            {
              tagName: "div",
              className: "canvas-footer-wrapper",
              childs: generateFooterNodes()
            }
          ]
        };
        childsCanvasList.push(canvasItemWrapper);
      }
      if (data.basicInof.brandList.length > 1) {
        generateCanvasElementConfig(renderData.materialItem);
      }
      const renderBrandList = renderData.brandList.filter((i) => i[0].isDeprecated ? false : true);
      renderBrandList.forEach((brandItemList, index) => {
        const findBrand = data.basicInof.brandList.find((i) => i.label === brandItemList[0].label);
        generateCanvasElementConfig(brandItemList, findBrand?.specs);
      });
      createElement({
        tagName: "div",
        className: "wrapper",
        childs: childsCanvasList
      }, shadowRoot);
    }
  };

  // components/inputs/index.ts
  var myInputs = {
    tagName: "my-inputs",
    createNode(shadowRoot, data, params) {
      createElement({
        tagName: "link",
        attributes: {
          rel: "stylesheet",
          href: "./dist/inputs.css"
        }
      }, shadowRoot);
      const wrapperNode = createElement({
        tagName: "div",
        className: "wrapper",
        attributes: {
          "data-belong": params.belongText
        },
        returnNode(ele) {
          updateTotal(ele);
        },
        childs: [
          {
            tagName: "div",
            className: "title",
            innerText: data.label,
            events: {
              click(e) {
                if (e.target !== e.currentTarget) return;
                params.pageScrollToNextBelongSelf();
              }
            }
          },
          {
            tagName: "div",
            className: "list-wrapper",
            childs: data.list.filter((brandItem) => !brandItem.isDeprecated).map((brandItem) => {
              const lastBrandItem = params.lastMaterialItem?.list.find((x) => x.label === brandItem.label);
              let lastBrandTextList = [];
              let lastBrandItemNum = 0;
              if (lastBrandItem) {
                lastBrandItemNum = getRecordBrandItemTotalInfo(lastBrandItem).total;
                lastBrandTextList.push(`${lastBrandItemNum} ${params.lastMaterialItem?.unit || ""}`);
              }
              let curPurchaseBrandItemNum = 0;
              let curValueReference = "";
              if (params.currentRecordItem && params.belong === "repo") {
                const curPurchaseItem = params.currentRecordItem.purchase.find((x) => x.label === data.label);
                if (curPurchaseItem) {
                  const curPurchaseBrandItem = curPurchaseItem.list.find((x) => x.label === brandItem.label);
                  if (curPurchaseBrandItem) {
                    curPurchaseBrandItemNum = getRecordBrandItemTotalInfo(curPurchaseBrandItem).total;
                    lastBrandTextList.push(`\u672C\u6B21\u8D2D\u4E70${curPurchaseBrandItemNum} ${curPurchaseItem.unit}`);
                    curValueReference = lastBrandItemNum + curPurchaseBrandItemNum;
                    lastBrandTextList.push(`\u672C\u6B21\u4ED3\u5E93\u5E94\u5C11\u4E8E\u7B49\u4E8E${lastBrandItemNum + curPurchaseBrandItemNum} ${curPurchaseItem.unit}`);
                  }
                }
              }
              const inputList = params.onlyDisplayLastSpecInput ? brandItem.numList.slice(-1) : brandItem.numList;
              let currentValidarNode;
              function validarValue() {
                if (!currentValidarNode) return;
                let flag = true;
                if (params.belong === "repo" && typeof curValueReference === "number") {
                  flag = getRecordBrandItemTotalInfo(brandItem).total <= curValueReference;
                } else {
                  flag = true;
                }
                currentValidarNode.style.display = flag ? "none" : "inline";
              }
              return {
                tagName: "div",
                className: "item-wrapper",
                childs: [
                  {
                    tagName: "div",
                    className: "item-title",
                    innerText: brandItem.label
                  },
                  {
                    tagName: "div",
                    className: "item-inputs",
                    childs: inputList.map((numItem) => {
                      return {
                        tagName: "div",
                        className: "input-wrapper",
                        childs: [
                          {
                            tagName: "input",
                            attributes: {
                              value: numItem.num || "",
                              // 0的时候，不要显示0！避免界面不好看
                              type: "number"
                            },
                            events: {
                              input(e) {
                                if (!e.target) return;
                                numItem.num = Number(e.target.value);
                                updateTotal();
                                validarValue();
                              }
                            }
                          },
                          {
                            tagName: "span",
                            innerText: numItem.unit
                          }
                        ]
                      };
                    })
                  },
                  {
                    tagName: "div",
                    className: "item-total",
                    childs: [
                      {
                        tagName: "div",
                        style: {
                          display: lastBrandItem ? "block" : "none"
                        },
                        innerHTML: `\u4E0A\u6B21:&nbsp${lastBrandTextList.join(";")}`
                      },
                      {
                        tagName: "span",
                        innerHTML: `\u672C\u6B21:&nbsp`
                      },
                      {
                        tagName: "span",
                        className: "item-total-placeholder",
                        innerHTML: ""
                      },
                      {
                        tagName: "span",
                        className: "item-total-validator",
                        style: {
                          display: "none"
                        },
                        innerHTML: "&nbsp\u274C(\u8BF7\u68C0\u67E5\u672C\u6B21\u6216\u4E0A\u6B21\u8BB0\u5F55\u6570\u636E)",
                        returnNode(ele) {
                          currentValidarNode = ele;
                          validarValue();
                        }
                      }
                    ]
                  }
                ]
              };
            })
          },
          {
            tagName: "div",
            className: "list-total",
            style: {
              display: data.list.length > 1 ? "block" : "none"
            },
            childs: [
              {
                tagName: "span",
                style: {
                  display: params.lastMaterialItem ? "block" : "none"
                },
                innerHTML: `\u4E0A\u6B21:&nbsp${params.lastMaterialItem ? getRecordMaterialItemTotalInfo(params.lastMaterialItem).reduce((total, cur) => {
                  total += cur.total;
                  return total;
                }, 0) : ""}`
              },
              {
                tagName: "span",
                innerHTML: "\u672C\u6B21:&nbsp"
              },
              {
                tagName: "span",
                className: "list-total-placeholder",
                innerHTML: ""
              }
            ]
          }
        ]
      }, shadowRoot);
      function updateTotal(_wrapperNode = wrapperNode) {
        if (!_wrapperNode) return;
        const itemTotalNodes = _wrapperNode.querySelectorAll(".item-total-placeholder");
        const listTotalNode = _wrapperNode.querySelector(".list-total-placeholder");
        const totalText = getRecordMaterialItemTotalInfo(data);
        if (itemTotalNodes) {
          Array.from(itemTotalNodes).forEach((itemTotalNode, index) => {
            itemTotalNode.innerHTML = `${totalText[index].totalText} = <strong>${totalText[index].total}</strong>&nbsp${data.unit}`;
          });
        }
        if (listTotalNode) {
          const totalNum = totalText.reduce((total, cur) => {
            total += cur.total;
            return total;
          }, 0);
          listTotalNode.innerHTML = `<strong>${totalNum}</strong>&nbsp${data.unit}`;
        }
      }
    }
  };

  // components/materialItem/index.ts
  var myMaterialItem = {
    tagName: "my-material-item",
    createNode(shadowRoot, data, params) {
      while (shadowRoot.firstChild) {
        shadowRoot.removeChild(shadowRoot.firstChild);
      }
      createElement({
        tagName: "link",
        attributes: {
          rel: "stylesheet",
          href: "./dist/materialItem.css"
        }
      }, shadowRoot);
      let wrapperNode;
      function render() {
        if (wrapperNode) {
          shadowRoot.removeChild(wrapperNode);
        }
        wrapperNode = createElement({
          tagName: "div",
          className: "wrapper",
          childs: [
            {
              tagName: "div",
              className: "material-label",
              innerText: data.label
            },
            {
              tagName: "div",
              className: "usage-wrapper",
              childs: [
                {
                  tagName: "div",
                  style: {
                    paddingRight: "10px"
                  },
                  innerText: "\u51FA\u5E93\u8303\u56F4"
                },
                {
                  tagName: "input",
                  attributes: {
                    value: data.uasge.min,
                    type: "number"
                  }
                },
                {
                  tagName: "input",
                  attributes: {
                    value: data.uasge.max,
                    type: "number"
                  }
                }
              ]
            },
            {
              tagName: "div",
              className: "material-brands-wrapper",
              childs: data.list.map((brandItem, brandIndex) => {
                return {
                  tagName: "div",
                  className: "brand-item",
                  childs: [
                    {
                      tagName: "div",
                      className: "brand-label-wrapper",
                      childs: [
                        {
                          tagName: "div",
                          className: `brand-label ${brandItem.isDeprecated ? "deprecated" : ""}`,
                          innerText: brandItem.label
                        },
                        {
                          tagName: "div",
                          className: "brand-remove",
                          innerText: brandItem.isDeprecated ? "\u5E9F\u5F03" : "\u6FC0\u6D3B",
                          events: {
                            click(e) {
                              brandItem.isDeprecated = !brandItem.isDeprecated;
                              render();
                            }
                          }
                        }
                      ]
                    },
                    {
                      tagName: "div",
                      className: "brand-specs-wrapper",
                      style: {
                        display: brandItem.isDeprecated ? "none" : "block"
                      },
                      childs: brandItem.specs.map((specItem, specIndex) => {
                        return {
                          tagName: "div",
                          className: "spec-wrapper",
                          childs: [
                            {
                              tagName: "input",
                              attributes: {
                                value: specItem.unit
                              }
                            },
                            {
                              tagName: "input",
                              style: {
                                marginRight: "auto"
                              },
                              attributes: {
                                value: specItem.spec,
                                type: "number"
                              }
                            },
                            {
                              tagName: "div",
                              className: "btn",
                              innerText: "\u79FB\u9664",
                              events: {
                                click(e) {
                                  if (brandItem.specs.length === 1) {
                                    alert("\u6700\u540E\u4E00\u9879\u4E0D\u5141\u8BB8\u79FB\u9664");
                                    return;
                                  }
                                  const confirm = window.confirm("\u786E\u5B9A\u79FB\u9664\u5417");
                                  if (!confirm) return;
                                  brandItem.specs.splice(specIndex, 1);
                                  render();
                                }
                              }
                            },
                            {
                              tagName: "div",
                              className: "btn",
                              innerText: "\u65B0\u589E",
                              events: {
                                click(e) {
                                  brandItem.specs.splice(specIndex + 1, 0, {
                                    unit: "",
                                    spec: 1
                                  });
                                  render();
                                }
                              }
                            }
                          ]
                        };
                      })
                    }
                  ]
                };
              })
            },
            {
              tagName: "div",
              className: "material-brand-add-wrapper",
              childs: [
                {
                  tagName: "div",
                  className: "btn",
                  style: {
                    width: "140px"
                  },
                  innerText: "\u65B0\u589E\u54C1\u724C",
                  events: {
                    click(e) {
                      const label = window.prompt("\u65B0\u7684\u54C1\u724C\u540D\u79F0") || "";
                      if (!label.trim()) return;
                      data.list.push({
                        label,
                        specs: [{
                          unit: "\u4E2A",
                          spec: 1
                        }],
                        priority: 1
                      });
                      render();
                    }
                  }
                }
              ]
            }
          ]
        }, shadowRoot);
      }
      render();
    }
  };

  // components/index.ts
  var components_default = [
    myCharts,
    myInputs,
    myMaterialItem
  ];

  // src/init.ts
  var pageNavManager = {
    nodesList: [],
    addPageNav(node, title) {
      this.nodesList.push({ node, title });
      this.renderPageNav();
    },
    updatePageNav() {
      this.nodesList = this.nodesList.filter((i) => {
        return document.body.contains(i.node);
      });
      this.renderPageNav();
    },
    renderPageNav() {
      const pageNavWrapperNode = document.querySelector(".page-nav");
      if (pageNavWrapperNode) {
        removeChilds(pageNavWrapperNode);
        this.nodesList.forEach((i) => {
          createElement({
            tagName: "div",
            className: "nav-item",
            innerText: i.title,
            events: {
              click(e) {
                i.node.scrollIntoView({
                  behavior: "smooth"
                });
              }
            }
          }, pageNavWrapperNode);
        });
      }
    }
  };
  function initRecordData() {
    return fetch("./dist/defaultRecordJSON.json").then((res) => {
      if (res.ok) {
        return res.json();
      }
    }).then((res) => {
      const list = getRecordList();
      if (!list.length) {
        setRecordList(res.list);
      }
    });
  }
  function initHtmlEvent(config) {
    const actionWrapper = document.querySelector("body > .action");
    if (!actionWrapper) return;
    const actionItemNodes = actionWrapper.querySelectorAll(".action-item");
    const actionContentNode = document.querySelector("body > .action-content");
    if (!actionItemNodes || !actionContentNode) return;
    Array.from(actionItemNodes).forEach((actionItem) => {
      actionItem.addEventListener("click", (event) => {
        if (!event || !event.target) return;
        Array.from(actionItemNodes).forEach((i) => i.classList.remove("active"));
        actionItem.classList.add("active");
        const actionItemType = event.target.dataset.type;
        location.hash = actionItemType || "";
        removeChilds(actionContentNode);
        pageNavManager.updatePageNav();
        switch (actionItemType) {
          case "materialsManager":
            config.materialsManager(actionContentNode, { pageNavManager });
            break;
          case "newData":
            config.newData(actionContentNode, { pageNavManager });
            break;
          case "modifyData":
            config.modifyData(actionContentNode, { pageNavManager });
            break;
          case "viewData":
            config.viewData(actionContentNode, { pageNavManager });
            break;
          case "inOutData":
            config.inOutData(actionContentNode, { pageNavManager });
            break;
        }
      });
    });
    pageNavManager.addPageNav(actionWrapper, "\u{1F51D}");
    if (location.hash) {
      const hashValue = location.hash.slice(1);
      const actionActiveItem = actionWrapper.querySelector(`.action-item[data-type='${hashValue}']`);
      if (actionActiveItem) {
        actionActiveItem.click();
      }
    } else {
      actionItemNodes[0].click();
    }
  }
  function initComponents() {
    components_default.forEach((customEleConfig) => {
      initCustomElement(customEleConfig);
    });
  }
  async function init(config) {
    await initRecordData();
    initComponents();
    initHtmlEvent(config);
    updateRecordList();
  }

  // src/materialsManager.ts
  var materialsManager = async (parentNode, params) => {
    const sys_materialsList = cloneData(materialsList);
    const new_materialsList = cloneData(getNewMaterialsList());
    function render() {
      removeChilds(parentNode);
      createElement({
        tagName: "div",
        className: "matetials-manager-wrapper",
        childs: [
          {
            tagName: "div",
            className: "matetials-list-wrapper",
            childs: new_materialsList.map((materialItem) => {
              return {
                tagName: "div",
                className: "matetial-item",
                returnNode(ele) {
                  params.pageNavManager.addPageNav(ele, materialItem.label);
                },
                childs: [
                  createCustomElement("my-material-item", {
                    data: materialItem,
                    params: {}
                  })
                ]
              };
            })
          },
          {
            tagName: "div",
            className: "form-submit-wrapper",
            returnNode(ele) {
              params.pageNavManager.addPageNav(ele, "\u63D0\u4EA4\u533A");
            },
            childs: [
              {
                tagName: "div",
                className: "form-submit-item",
                innerText: "\u65B0\u589E\u7269\u6599",
                events: {
                  click(e) {
                    const label = window.prompt("\u7269\u6599\u540D\u79F0") || "";
                    if (!label.trim()) return;
                    new_materialsList.push({
                      label,
                      list: [],
                      unit: "\u4E2A",
                      uasge: { min: 0, max: 1e3 }
                    });
                    render();
                  }
                }
              },
              {
                tagName: "div",
                className: "form-submit-item",
                innerText: "\u66F4\u65B0",
                events: {
                  click(e) {
                    setNewMaterialsList(new_materialsList);
                    location.reload();
                  }
                }
              },
              {
                tagName: "div",
                className: "form-submit-item",
                innerText: "\u6062\u590D\u7CFB\u7EDF",
                events: {
                  click() {
                    setNewMaterialsList(sys_materialsList);
                    location.reload();
                  }
                }
              }
            ]
          }
        ]
      }, parentNode);
    }
    render();
  };

  // src/index.ts
  init({ newData, modifyData, viewData, inOutData, materialsManager });
})();
