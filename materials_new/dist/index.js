"use strict";
(() => {
  // utils/common.ts
  function deleteProperty(obj, prop) {
    const newObj = JSON.parse(JSON.stringify(obj));
    delete obj[prop];
    return obj;
  }
  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }
  function objectKeys(obj) {
    return Object.keys(obj);
  }
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
  var getDayDistance = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const leftDate = new Date(date1).getTime();
    const rightDate = new Date(date2).getTime();
    const millisecondsDiff = leftDate - rightDate;
    const daysDiff = Math.round(millisecondsDiff / (1e3 * 60 * 60 * 24));
    return daysDiff;
  };
  var getCurrentDate = () => {
    const _date = /* @__PURE__ */ new Date();
    const year = String(_date.getFullYear());
    const month = String(_date.getMonth() + 1).padStart(2, "0");
    const day = String(_date.getDate()).padStart(2, "0");
    return {
      year,
      month,
      day,
      full: `${year}-${month}-${day}`,
      fullStr: `${year}${month}${day}`
    };
  };
  function getFormatNum(num, accuracy = 1) {
    if (accuracy === 0) {
      return Math.round(num);
    } else {
      const acc = Math.pow(10, accuracy);
      return Math.round(num * acc) / acc;
    }
  }
  function removeEle(ele, newClassName) {
    if (!ele || ele === null) {
      return Promise.resolve("\u79FB\u9664");
    }
    const style = window.getComputedStyle(ele);
    let durationTimeStr = "";
    if (["0s", "0ms"].includes(style.animationDuration)) {
      durationTimeStr = style.transitionDuration;
    } else {
      durationTimeStr = style.animationDuration;
    }
    let durationTime = 0;
    if (durationTimeStr.includes("ms")) {
      durationTime = parseFloat(durationTimeStr);
    } else {
      durationTime = parseFloat(durationTimeStr) * 1e3;
    }
    return new Promise((resolve) => {
      ele.classList.add(newClassName);
      setTimeout(() => {
        ele.remove();
        resolve("\u79FB\u9664");
      }, durationTime);
    });
  }
  async function oneByone(list, processFun) {
    for (let i = 0; i < list.length; i++) {
      await processFun(list[i]);
    }
  }
  var dependenciesCache = {};
  function addScriptToGlobal(url) {
    return new Promise((resolve, reject) => {
      if (dependenciesCache[url]) {
        resolve("ok");
      } else {
        const script = document.createElement("script");
        script.src = url;
        script.type = "text/javascript";
        document.head.appendChild(script);
        script.onload = function() {
          dependenciesCache[url] = true;
          resolve("ok");
        };
        script.onerror = function() {
          reject(new Error("\u52A0\u8F7D\u5931\u8D25"));
        };
      }
    });
  }

  // utils/element.ts
  function createChildsElement(childs, parentNode) {
    if (typeof childs === "function") {
      childs = childs();
    }
    const childNodes = [];
    if (Array.isArray(childs) && childs.length) {
      childs.forEach((childItem) => {
        if (childItem instanceof Element) {
          childNodes.push(childItem);
        } else if (childItem) {
          childNodes.push(createElement(childItem));
        } else {
          childNodes.push(void 0);
        }
      });
    }
    if (parentNode) {
      childNodes.forEach((childNode) => {
        if (childNode) {
          parentNode.appendChild(childNode);
        }
      });
    }
    return childNodes.filter(Boolean);
  }
  function createElement(config, rootNode) {
    const { tagName, show = true, childs, returnNode, attachedQueryNode, returnAttachedNode, returnUpdateFun, ...attrs } = config;
    let isShow;
    if (typeof show === "function") {
      isShow = show();
    } else {
      isShow = show;
    }
    if (!isShow) {
      return;
    }
    const currentNode = document.createElement(tagName);
    objectKeys(attrs).forEach((attrKey) => {
      if (attrKey === "innerHTML" || attrKey === "innerText" || attrKey === "className") {
        currentNode[attrKey] = attrs[attrKey] || "";
      } else if (attrKey === "attributes") {
        const arrrValue = attrs[attrKey] || {};
        objectKeys(arrrValue).forEach((i) => {
          if (arrrValue[i] !== void 0) {
            currentNode.setAttribute(i, arrrValue[i]);
          }
        });
      } else if (attrKey === "style") {
        const arrrValue = attrs[attrKey] || {};
        objectKeys(arrrValue).forEach((i) => {
          currentNode.style.setProperty(i.replace(/([A-Z])/g, "-$1").toLowerCase(), arrrValue[i] || "");
        });
      } else if (attrKey === "events") {
        const arrrValue = attrs[attrKey] || {};
        objectKeys(arrrValue).forEach((i) => {
          if (arrrValue[i]) {
            currentNode.addEventListener(i, arrrValue[i]);
          }
        });
      }
    });
    if (childs) {
      createChildsElement(childs, currentNode);
    }
    if (rootNode) {
      rootNode.appendChild(currentNode);
    }
    if (returnNode) {
      returnNode(currentNode);
    }
    if (returnAttachedNode) {
      waitCondition(() => (attachedQueryNode || document.body).contains(currentNode)).then((res) => {
        returnAttachedNode(currentNode);
      });
    }
    return currentNode;
  }
  function createUpdateElement(getConfig, rootNode) {
    const config = getConfig();
    const currentNode = createElement(config, rootNode);
    if (currentNode && config.returnUpdateFun) {
      let updateFun2 = function() {
        if (currentNode && currentNode.parentNode) {
          const newCurrentNode = createUpdateElement(getConfig);
          if (newCurrentNode) {
            currentNode.parentNode.insertBefore(newCurrentNode, currentNode);
          }
          currentNode.remove();
        }
      };
      var updateFun = updateFun2;
      config.returnUpdateFun(updateFun2, currentNode);
    }
    return currentNode;
  }
  var removeChilds = (ele) => {
    if (!ele) return;
    if (ele instanceof Element || ele instanceof ShadowRoot) {
      while (ele.firstChild) {
        ele.removeChild(ele.firstChild);
      }
    }
  };

  // utils/customElement.ts
  function preloadStyle(cssName) {
    const url = `../dist/${cssName}.css`;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else if (xhr.status === 404) {
          resolve("");
        } else {
          reject(new Error(`Failed to load stylesheet: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error("Failed to load stylesheet"));
      xhr.send();
    });
  }
  function initCustomElement(config) {
    const stylePromise = preloadStyle(config.tagName);
    class myEle extends HTMLElement {
      constructor() {
        super();
        this.$shadowRoot = this.attachShadow({ mode: "closed" });
      }
      connectedCallback() {
        const newStylePromise = stylePromise.then((res) => {
          if (res) {
            const styles = new CSSStyleSheet();
            styles.replaceSync(res);
            this.$shadowRoot.adoptedStyleSheets = [styles];
          }
          return res;
        });
        if (this.$initHandler) {
          this.$initHandler(newStylePromise);
        }
      }
      initHandler(options) {
        this.$initHandler = (_newStylePromise) => {
          const exportFuns = config.createNode(this.$shadowRoot, options, _newStylePromise);
          this.$exportFuns = exportFuns || {};
        };
      }
    }
    customElements.define(config.tagName, myEle);
  }
  function createCustomElement(tagName, options, parentNode) {
    const node = document.createElement(tagName);
    node.initHandler(options);
    if (parentNode) {
      parentNode.appendChild(node);
    }
    return node;
  }
  function showMessage(textList, options) {
    let myMessageEle = document.querySelector("my-message");
    if (!myMessageEle) {
      myMessageEle = createCustomElement("my-message", {}, document.body);
    }
    return myMessageEle.$exportFuns.show(textList, options);
  }
  function updateHtmlAction(label, status) {
    const myActionEle = document.querySelector("my-actions");
    if (!myActionEle) {
      return;
    }
    return myActionEle.$exportFuns.updateAction(label, status);
  }
  function saveHtmlActionStatus(status) {
    const myActionEle = document.querySelector("my-actions");
    if (!myActionEle) {
      return;
    }
    return myActionEle.$exportFuns.saveStatus(status);
  }
  function actionFireBack(replaceFun) {
    const myActionEle = document.querySelector("my-actions");
    if (!myActionEle) {
      return;
    }
    return myActionEle.$exportFuns.actionFireBack(replaceFun || (() => {
    }));
  }

  // config/materialList.ts
  var SettlementNum = 120;
  var materialList = [
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
      unit: "\u74F6",
      baseAverageDayUse: 3
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
      unit: "\u74F6",
      baseAverageDayUse: 3
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
      unit: "\u74F6",
      baseAverageDayUse: 1
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
      unit: "\u74F6",
      baseAverageDayUse: 320
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
      unit: "\u652F",
      baseAverageDayUse: 145
    },
    {
      label: "\u9762\u5DFE\u7EB8",
      list: [
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
      unit: "\u5305",
      baseAverageDayUse: 25
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
      unit: "\u4E2A",
      baseAverageDayUse: 150
    },
    {
      label: "\u5377\u7EB8",
      list: [
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
      unit: "\u5377",
      baseAverageDayUse: 40
    },
    {
      label: "\u62D6\u978B",
      list: [
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
      unit: "\u53CC",
      baseAverageDayUse: 140
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
      unit: "\u4E2A",
      baseAverageDayUse: 32
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
      unit: "\u888B",
      baseAverageDayUse: 42
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
      unit: "\u53CC",
      baseAverageDayUse: 1
    },
    {
      label: "\u7259\u5177\u5957\u9910",
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
      unit: "\u5957",
      baseAverageDayUse: 0
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
      unit: "\u652F",
      baseAverageDayUse: 56
    },
    {
      label: "\u7259\u5237",
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
      unit: "\u652F",
      baseAverageDayUse: 150
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
      unit: "\u888B",
      baseAverageDayUse: 35
    }
  ];
  var brandPriorityMap = {
    "1": "\u4F18\u5148\u4F7F\u7528",
    "2": "\u6B21\u4F18\u5148\u4F7F\u7528",
    "3": "\u4E0D\u518D\u4F7F\u7528"
  };

  // config/recordList.ts
  var recordRecordBelong = [
    {
      field: "system",
      shortLabel: "\u7CFB",
      label: "\u7CFB\u7EDF\u6570\u91CF"
    },
    {
      field: "purchase",
      shortLabel: "\u8D2D",
      label: "\u8D2D\u4E70\u6570\u91CF"
    },
    {
      field: "repo",
      shortLabel: "\u4ED3",
      label: "\u4ED3\u5E93\u6570\u91CF(\u5728\u4ED3\u5E93\u4E2D\u7684)"
    },
    {
      field: "repoExtra",
      shortLabel: "\u4ED3\u989D",
      label: "\u4ED3\u5E93\u6570\u91CF(\u4E0D\u5728\u4ED3\u5E93\u4E2D\u7684)"
    }
  ];

  // config/_default.ts
  var _defaultRecordList = [
    {
      "recordDate": "2024-10-27",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 113
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 183
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 164
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 15730
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 7748
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 1653
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 16669
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 3691
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 1619
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 7031
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 10823
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 2260
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 355
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1625
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 5410
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 5357
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2e3
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 804
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 1
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 15
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 2
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 7
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 4600
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 11
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 24
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 14
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 19
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 13
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 2
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 9
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 400
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 10
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 9
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 49
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 240
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 6
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 400
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 6
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 400
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3.5
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 3
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 200
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2024-11-03",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 236
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 297
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 160
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 15120
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 7198
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 1423
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 15829
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 3251
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 1619
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 6481
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 10709
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 2197
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 540
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1619
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 5060
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 4857
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2e3
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 751
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 6
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 6
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 4
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 2
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 8
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 5
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 3
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 3600
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 9
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 21
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 3
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 13
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 192
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 2
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 7
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 400
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 8
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 43
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 43
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 240
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 6
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 2
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3.5
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 3.5
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2024-11-10",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 119
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 276
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 85
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 13690
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 5308
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 1138
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 13859
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 2441
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 1409
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 4551
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 10349
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 1881
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 341
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1612
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 4100
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2867
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2e3
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 692
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 3
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 8
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 5
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 110
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 7
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 17
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 11
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 166
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 2
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 6
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 8
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 37
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 37
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 240
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 5
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 2
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 2
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 2.8
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2024-11-17",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 69
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 250
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 82
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 11290
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 4108
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 898
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 11759
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 2081
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 1408
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 3451
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 9989
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 1641
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 340
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1611
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2900
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2097
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1990
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 537
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 2
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 3
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 7
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 120
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 65
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 6
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 13
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 10
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 800
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 14
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 10
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 2
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 150
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 8
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 32
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 35
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 530
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 5
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 1
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 2
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 1.8
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2024-11-23",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 54
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 225
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 82
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 19280
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 3468
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 704
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 11143
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 1885
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 1407
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 2607
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 9745
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 1581
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 340
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1611
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2440
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1457
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1457
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 343
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 400
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 10
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 4
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 19
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 5
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 358
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 12
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 22
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 9
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 400
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 11
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 12
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 2
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 8
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 30
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 27
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 210
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 300
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 50
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2024-12-01",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 149
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 316
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 72
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 15980
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 5368
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 519
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 600
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 9053
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 1445
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 1200
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 1405
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 4017
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 9530
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 8641
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 338
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1609
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 3130
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1577
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1840
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 1113
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 6
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 6
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 8
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 10
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 10
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 5
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 3
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 2
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 2
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 2
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 5
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 6
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 9
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 20
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 4
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 295
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 10
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 9
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 50
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 10
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 8
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 600
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 9
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 15
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 10
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 2
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 6
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 8
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 25
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 3
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 20
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 200
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 5
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 1
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 1
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 3
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 100
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2024-12-08",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 131
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 295
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 62
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 13030
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 4518
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 404
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 598
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 8143
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 1195
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 1198
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 1395
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 3017
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 9290
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 8341
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 335
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1607
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2390
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2477
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2700
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 713
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 4
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 4
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 236
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 4
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 211
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 7
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 250
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 7
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 10
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 7
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 300
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 7
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 9
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 9
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 6
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 2
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 400
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 8
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 21
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 3
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 13
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 200
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 3
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 50
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2024-12-15",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 98
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 286
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 60
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 10030
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 3268
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 254
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 596
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 6923
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 865
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 1197
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 1393
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 1817
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 9054
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 7973
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 334
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1606
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1790
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2127
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2050
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 653
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 3
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 17
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 9
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 10
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 4
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 99
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 6
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 250
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 4
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 39
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 10
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 7
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 6
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 7
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 8
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 4
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 2
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 8
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 19
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 3
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 8
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 180
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 400
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 2
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 2
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2024-12-21",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 89
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 273
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 59
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 7530
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2768
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 154
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 594
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 6653
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 759
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 1069
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 1393
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 577
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 8944
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 7773
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 334
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1605
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1570
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1619
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1550
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 403
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 2
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 16
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 8
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 3
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 67
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 100
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 35
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 9
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 54
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 6
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 100
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 6
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 5
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 5
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 11
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 400
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 80
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 8
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 17
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 3
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 4
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 180
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 1
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 1
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2024-12-29",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 225
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 234
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 143
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 13630
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 6268
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 1107
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 15508
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 514
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 1805
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 433
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 5246
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 8776
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 7475
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 324
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1603
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2110
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2919
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2850
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 1331
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 7
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 4
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 400
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 10
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 10
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 10
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 8
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 10
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 2
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 5
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 9
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 7
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 16
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 6
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 18
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 374
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 12
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 150
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 16
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 36
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 14
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 600
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 5
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 1
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 12
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 5
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 9
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 200
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 8
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 10
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 2
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 46
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 180
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 6
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 5
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 150
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2025-01-12",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 228
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 233
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 131
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 17330
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 7588
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 1587
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 13338
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 2515
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 9006
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 8342
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 6875
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 321
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1604
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 3390
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 3650
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 3219
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 919
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 2
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 2
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 400
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 7
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 14
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 7
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 11
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 100
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 10
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 7
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 6
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 729
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 14
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 24
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 20
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 12
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 4
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 15
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 1
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 12
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 150
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 8
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 5
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 2
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 35
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 160
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 8
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 8
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 5
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 4
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2025-01-18",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 66
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 207
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 125
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 16010
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 6538
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 1405
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 12138
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 2095
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 7586
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 8162
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 6587
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 319
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1599
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 3195
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2619
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 3050
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 737
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 7
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 20
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 6
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 11
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 6
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 6
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 15600
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 11
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 300
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 21
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 22
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 10
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 100
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 15
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 9
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 15
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 14
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 450
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 6
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 37
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 2
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 30
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 160
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 6
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 5
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 300
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 2
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 200
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2025-02-03",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 196
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 183
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 112
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 12730
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 4312
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 971
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 9627
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 1457
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 5382
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 7649
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 6021
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 314
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1596
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2327
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1382
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1770
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 1246
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 4
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 7
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 8
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 6
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 40
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 4
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 14
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 387
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 9
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 16
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 78
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 10
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 400
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 11
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 6
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 9
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 400
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 6
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 33
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 2
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 26
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 100
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 5
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 5
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 3
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 5
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 350
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "recordDate": "2025-02-15",
      "system": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 168
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 163
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 101
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 9520
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 2752
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 697
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 8189
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 1007
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 3462
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 7316
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 5680
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 314
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 1596
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1723
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 1004
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 832
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 906
                }
              ]
            }
          ]
        }
      ],
      "purchase": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 0
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 0
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 0
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 0
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        }
      ],
      "repo": [
        {
          "label": "\u6C90\u6D74\u9732",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6C90\u6D74\u9732",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 5
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 30
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u53D1\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u53D1\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 5
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 9
                }
              ]
            }
          ]
        },
        {
          "label": "\u6D17\u624B\u6DB2",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u67E0\u6AAC\u8FC7\u6C5F\u6D17\u624B\u6DB2",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 4
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 25
                }
              ]
            }
          ]
        },
        {
          "label": "\u77FF\u6CC9\u6C34",
          "unit": "\u74F6",
          "list": [
            {
              "label": "\u4E50\u767E\u6C0F\u77FF\u6CC9\u6C34",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 24,
                  "num": 220
                },
                {
                  "unit": "\u74F6",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u7259\u818F",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u7F8E\u52A0\u51C0\u7259\u818F",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 5
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u9762\u5DFE\u7EB8",
          "unit": "\u5305",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u9762\u5DFE\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 0
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u9762\u5DFE\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 60,
                  "num": 12
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 23
                }
              ]
            }
          ]
        },
        {
          "label": "\u5C0F\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u767D\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u624E",
                  "spec": 1e3,
                  "num": 7
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5377\u7EB8",
          "unit": "\u5377",
          "list": [
            {
              "label": "\u7EA4\u7EAF\u5377\u7EB8",
              "priority": 1,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 0
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 0
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u51E4\u751F\u5377\u7EB8",
              "priority": 2,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 10,
                  "num": 6
                },
                {
                  "unit": "\u63D0",
                  "spec": 12,
                  "num": 13
                },
                {
                  "unit": "\u5377",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "QZD\u65E0\u7EBA\u5E03\u62D6\u978B",
              "priority": 3,
              "isDeprecated": true,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 700,
                  "num": 0
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 0
                }
              ]
            },
            {
              "label": "\u771F\u7F8E\u5E03\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 500,
                  "num": 5
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 450
                }
              ]
            }
          ]
        },
        {
          "label": "\u5927\u5783\u573E\u888B",
          "unit": "\u4E2A",
          "list": [
            {
              "label": "\u9ED1\u8272\u5783\u573E\u888B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 20,
                  "num": 6
                },
                {
                  "unit": "\u624E",
                  "spec": 50,
                  "num": 21
                },
                {
                  "unit": "\u4E2A",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u8336\u53F6",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u795E\u53F6\u7EA2\u8336",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 50,
                  "num": 2
                },
                {
                  "unit": "\u76D2",
                  "spec": 50,
                  "num": 13
                },
                {
                  "unit": "\u888B",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u62D6\u978B",
          "unit": "\u53CC",
          "list": [
            {
              "label": "\u771F\u7F8E\u5E03\u513F\u7AE5\u62D6\u978B",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u5305",
                  "spec": 300,
                  "num": 1
                },
                {
                  "unit": "\u53CC",
                  "spec": 1,
                  "num": 70
                }
              ]
            }
          ]
        },
        {
          "label": "\u513F\u7AE5\u7259\u5177\u5957\u9910",
          "unit": "\u5957",
          "list": [
            {
              "label": "\u4E24\u9762\u9488\u7259\u5177\u5957\u9910",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 7
                },
                {
                  "unit": "\u5957",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u68B3\u5B50",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u9999\u8549\u68B3",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u6210\u4EBA\u7259\u5237",
          "unit": "\u652F",
          "list": [
            {
              "label": "\u79F8\u79C6\u7C73\u767D\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 4
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 300
                }
              ]
            },
            {
              "label": "\u79F8\u79C6\u6D45\u7070\u7259\u5237",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 500,
                  "num": 1
                },
                {
                  "unit": "\u652F",
                  "spec": 1,
                  "num": 0
                }
              ]
            }
          ]
        },
        {
          "label": "\u5496\u5561",
          "unit": "\u888B",
          "list": [
            {
              "label": "\u9685\u7530\u5DDD\u5496\u5561",
              "priority": 1,
              "isDeprecated": false,
              "numList": [
                {
                  "unit": "\u7BB1",
                  "spec": 250,
                  "num": 3
                },
                {
                  "unit": "\u5305",
                  "spec": 1,
                  "num": 280
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  // config/defaultRecordList.ts
  var newList = _defaultRecordList.map((recordItem) => {
    const _materialList = recordItem.system.map((i) => {
      const _brandList = i.list.map((_i) => {
        return {
          label: _i.label,
          system: [],
          repo: [],
          purchase: [],
          repoExtra: _i.numList.map((__i) => {
            return {
              ...__i,
              num: 0
            };
          })
        };
      });
      return {
        label: i.label,
        list: _brandList
      };
    });
    const fields = ["system", "repo", "purchase"];
    fields.forEach((field) => {
      recordItem[field].map((i) => {
        const findMaterial = _materialList.find((_i) => _i.label === i.label);
        i.list.forEach((_i) => {
          const findBrand = findMaterial?.list.find((__i) => __i.label === _i.label);
          let h = findBrand[field];
          findBrand[field] = _i.numList;
        });
      });
    });
    _materialList.forEach((i) => {
      const _materialLabelMap = {
        "\u62BD\u7EB8": "\u9762\u5DFE\u7EB8",
        "\u6210\u4EBA\u62D6\u978B": "\u62D6\u978B",
        "\u513F\u7AE5\u7259\u5177\u5957\u9910": "\u7259\u5177\u5957\u9910",
        "\u6210\u4EBA\u7259\u5237": "\u7259\u5237"
      };
      if (_materialLabelMap[i.label]) {
        i.label = _materialLabelMap[i.label];
      }
    });
    return {
      recordDate: recordItem.recordDate,
      list: _materialList
    };
  });
  var defaultRecordList = newList;
  console.log(defaultRecordList);

  // config/htmlActions.ts
  var htmlActions = [
    {
      label: "\u7269\u6599",
      component: "my-materials",
      options: {
        status: {}
      }
    },
    {
      label: "\u65B0\u589E",
      component: "my-form",
      options: {
        params: {
          type: "add"
        },
        status: {}
      }
    },
    {
      label: "\u4FEE\u6539",
      component: "my-form",
      options: {
        params: {
          type: "modify"
        },
        status: {}
      }
    },
    {
      label: "\u56FE\u8868",
      component: "my-charts",
      options: {
        status: {
          // 默认是出库
          defaultType: "\u51FA\u5E93\u5EFA\u8BAE(\u7F13\u548C)"
        }
      }
    },
    {
      label: "\u5176\u5B83",
      component: "my-others",
      options: {
        status: {}
      }
    }
  ];

  // config/chartShowTypes.ts
  var chartFieldsMap = {
    "dayUse": "\u65E5\u8017",
    "averageDayUse": "\u5747\u65E5\u8017",
    "outSuggestByRepo": "\u51FA\u5E93(\u66B4)",
    "outSuggestByRepoFull": "\u51FA\u5E93(\u7F13)",
    "purchaseSuggest": "\u8D2D\u4E70\u5EFA\u8BAE",
    "availableDay": "\u53EF\u7528\u5929\u6570",
    // 归属数量
    "purchaseNum": "\u8D2D\u4E70\u6570\u91CF",
    "systemNum": "\u7CFB\u7EDF\u6570\u91CF",
    "repoNum": "\u4ED3\u5E93\u6570\u91CF(\u4EC5)",
    "repoExtraNum": "\u4ED3\u5E93\u6570\u91CF(\u989D)",
    "repoFullNum": "\u603B\u4ED3\u6570\u91CF"
  };
  var FooterNodeNum = 3;
  var allBelongFields = recordRecordBelong.map((belongItem) => {
    const newField = `${belongItem.field}Num`;
    return newField;
  });
  var chartShowTypes = [
    {
      label: "\u5F52\u5C5E\u6570\u91CF",
      fields: allBelongFields,
      navigateBelongField: "repo",
      getCanvasFooterNodes(chartMaterialItems) {
        const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
        if (!lastThreeItems.length) return [];
        return lastThreeItems.reverse().map((item) => {
          let contentText = "";
          recordRecordBelong.forEach((belongItem) => {
            const newField = `${belongItem.field}Num`;
            ;
            contentText += `[${belongItem.shortLabel}(${item.computed[newField]})]`;
          });
          const systemNum = item.computed.repoNum;
          const repoNum = item.computed.repoNum;
          const repoFullNum = item.computed.repoFullNum;
          const repoExtra = item.computed.repoExtraNum;
          let repoExtraText = repoExtra + "";
          if (repoExtra > 0) {
            repoExtraText = `<strong>${repoExtra}</strong>`;
          }
          return {
            tagName: "div",
            className: "item",
            childs: [
              {
                tagName: "div",
                className: "label",
                innerText: item.recordDate
              },
              {
                tagName: "div",
                innerText: contentText
              }
            ]
          };
        });
      }
    },
    {
      label: "\u4ED3\u5E93\u6570\u91CF",
      fields: ["repoNum", "repoExtraNum", "repoFullNum"],
      navigateBelongField: "repo",
      getCanvasFooterNodes(chartMaterialItems) {
        const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
        if (!lastThreeItems.length) return [];
        return lastThreeItems.reverse().map((item) => {
          const repoNum = item.computed.repoNum;
          const repoFullNum = item.computed.repoFullNum;
          const repoExtra = item.computed.repoExtraNum;
          let repoExtraText = repoExtra + "";
          if (repoExtra > 0) {
            repoExtraText = `<strong>${repoExtra}</strong>`;
          }
          return {
            tagName: "div",
            className: "item",
            childs: [
              {
                tagName: "div",
                className: "label",
                innerText: item.recordDate
              },
              {
                tagName: "div",
                innerHTML: `\u4ED3\u4EC5(${repoNum}),\u603B\u4ED3${repoFullNum}),\u4ED3\u989D(${repoExtraText})`
              }
            ]
          };
        });
      }
    },
    {
      label: "\u6570\u91CF\u5BF9\u6BD4",
      fields: ["systemNum", "repoFullNum"],
      navigateBelongField: "repo",
      getCanvasFooterNodes(chartMaterialItems) {
        const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
        if (!lastThreeItems.length) return [];
        return lastThreeItems.reverse().map((item) => {
          const systemNum = item.computed.systemNum;
          const repoFullNum = item.computed.repoFullNum;
          return {
            tagName: "div",
            className: "item",
            childs: [
              {
                tagName: "div",
                className: "label",
                innerText: item.recordDate
              },
              {
                tagName: "div",
                innerHTML: `\u7CFB\u7EDF(${systemNum},\u4ED3\u5E93(${repoFullNum}),\u5DEE\u503C:<strong>${systemNum - repoFullNum}</strong>`
              }
            ]
          };
        });
      }
    },
    {
      label: "\u6D88\u8017\u5BF9\u6BD4",
      fields: ["dayUse", "averageDayUse"],
      navigateBelongField: "repo",
      getCanvasFooterNodes(chartMaterialItems) {
        const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
        if (!lastThreeItems.length) return [];
        return lastThreeItems.reverse().map((item) => {
          const dayUse = item.computed.chartData.dayUse;
          const weekUseText = item.computed.chartData.weekUseText;
          const averageDayUse = item.computed.chartData.averageDayUse;
          return {
            tagName: "div",
            className: "item",
            childs: [
              {
                tagName: "div",
                className: "label",
                innerText: item.recordDate
              },
              {
                tagName: "div",
                innerHTML: `\u5468\u8017(${weekUseText}),\u65E5\u8017(${dayUse}),\u5747\u65E5\u8017(${averageDayUse})`
              }
            ]
          };
        });
      }
    },
    {
      label: "\u51FA\u5E93\u5EFA\u8BAE(\u7F13\u548C)",
      fields: ["averageDayUse", "outSuggestByRepoFull"],
      navigateBelongField: "repo",
      getCanvasFooterNodes(chartMaterialItems) {
        const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
        if (!lastThreeItems.length) return [];
        const returnNodes = lastThreeItems.reverse().map((item) => {
          const outSuggestTextByRepoFull = item.computed.chartData.outSuggestTextByRepoFull;
          return {
            tagName: "div",
            className: "item",
            childs: [
              {
                tagName: "div",
                className: "label",
                innerText: item.recordDate
              },
              {
                tagName: "div",
                innerHTML: outSuggestTextByRepoFull + `[\u66B4\u51FA\u5E93:${item.computed.chartData.outSuggestByRepo}]`
                // innerHTML:`系统(${systemNum}),仓库全(${repoFullNum}),均日耗(${averageDayUse}),出库(暴)(${outSuggestByRepo}),出库(缓)(<strong>${outSuggestByRepoFull}</strong>)`
              }
            ]
          };
        });
        if (lastThreeItems[0].list.length > 1) {
          returnNodes.push({
            tagName: "div",
            className: "item border",
            childs: lastThreeItems[0].list.map((brandItem) => {
              const systemNum = brandItem.computed.systemNum;
              const repoFullNum = brandItem.computed.repoFullNum;
              const repoNum = brandItem.computed.repoNum;
              return {
                tagName: "div",
                childs: [
                  {
                    tagName: "div",
                    className: "label",
                    innerHTML: `${brandItem.label}&nbsp;<span class="info">${brandItem.specsText}</span>`
                  },
                  {
                    tagName: "div",
                    innerText: `${brandPriorityMap[brandItem.priority]},\u7CFB(${systemNum}),\u4ED3\u4EC5(${repoNum}),\u603B\u4ED3(${repoFullNum})`
                  }
                ]
              };
            })
          });
        }
        return returnNodes;
      }
    },
    {
      label: "\u51FA\u5E93\u5EFA\u8BAE(\u66B4\u529B)",
      fields: ["averageDayUse", "outSuggestByRepo"],
      navigateBelongField: "repo",
      getCanvasFooterNodes(chartMaterialItems) {
        const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
        if (!lastThreeItems.length) return [];
        console.log(lastThreeItems);
        const returnNodes = lastThreeItems.reverse().map((item) => {
          const outSuggestTextByRepo = item.computed.chartData.outSuggestTextByRepo;
          return {
            tagName: "div",
            className: "item",
            childs: [
              {
                tagName: "div",
                className: "label",
                innerText: item.recordDate
              },
              {
                tagName: "div",
                innerHTML: outSuggestTextByRepo + `[\u7F13\u51FA\u5E93:${item.computed.chartData.outSuggestByRepoFull}]`
              }
            ]
          };
        });
        if (lastThreeItems[0].list.length > 1) {
          returnNodes.push({
            tagName: "div",
            className: "item border",
            childs: lastThreeItems[0].list.map((brandItem) => {
              const systemNum = brandItem.computed.systemNum;
              const repoFullNum = brandItem.computed.repoFullNum;
              const repoNum = brandItem.computed.repoNum;
              return {
                tagName: "div",
                childs: [
                  {
                    tagName: "div",
                    className: "label",
                    innerHTML: `${brandItem.label}&nbsp;<span class="info">${brandItem.specsText}</span>`
                  },
                  {
                    tagName: "div",
                    innerText: `${brandPriorityMap[brandItem.priority]},\u7CFB(${systemNum}),\u4ED3\u4EC5(${repoNum}),\u603B\u4ED3(${repoFullNum})`
                  }
                ]
              };
            })
          });
        }
        return returnNodes;
      }
    },
    {
      label: "\u8D2D\u4E70\u5EFA\u8BAE",
      fields: ["repoFullNum", "purchaseNum", "purchaseSuggest"],
      navigateBelongField: "purchase",
      getCanvasFooterNodes(chartMaterialItems) {
        const lastThreeItems = cloneData(chartMaterialItems.slice(-FooterNodeNum));
        if (!lastThreeItems.length) return [];
        const returnNodes = lastThreeItems.reverse().map((item) => {
          const purchaseSuggestText = item.computed.chartData.purchaseSuggestText;
          return {
            tagName: "div",
            className: "item",
            childs: [
              {
                tagName: "div",
                className: "label",
                innerText: item.recordDate
              },
              {
                tagName: "div",
                innerHTML: purchaseSuggestText
              }
            ]
          };
        });
        if (lastThreeItems[0].list.length > 1) {
          returnNodes.push({
            tagName: "div",
            className: "item border",
            childs: lastThreeItems[0].list.map((brandItem) => {
              const systemNum = brandItem.computed.systemNum;
              const repoFullNum = brandItem.computed.repoFullNum;
              const repoNum = brandItem.computed.repoNum;
              return {
                tagName: "div",
                childs: [
                  {
                    tagName: "div",
                    className: "label",
                    innerHTML: `${brandItem.label}&nbsp;<span class="info">${brandItem.specsText}</span>`
                  },
                  {
                    tagName: "div",
                    innerText: `${brandPriorityMap[brandItem.priority]},\u4ED3\u603B(${brandItem.computed.repoFullNum}-${getFormatNumBySpecs(brandItem, brandItem.computed.repoFullNum)})`
                  }
                ]
              };
            })
          });
        }
        return returnNodes;
      }
    }
  ];

  // utils/materialList.ts
  var matetialsListStorageKey = "materials_new";
  var emptyMaterialLabel = "\u7269\u6599\u540D\u79F0";
  var emptyBrandLabel = "\u54C1\u724C\u540D\u79F0";
  function getMaterialsListByStorage() {
    const listStr = localStorage.getItem(matetialsListStorageKey);
    if (listStr) {
      try {
        return JSON.parse(listStr);
      } catch (err) {
        return [];
      }
    } else {
      return [];
    }
  }
  function setMaterialList(list) {
    if (!list || !list.length) {
      localStorage.removeItem(matetialsListStorageKey);
      return "";
    }
    let errMsg = "";
    list.some((materialItem) => {
      const { uasge: { min, max }, baseAverageDayUse } = materialItem;
      if (typeof baseAverageDayUse !== "number") {
        errMsg = materialItem.label + ":baseAverageDayUse\u9700\u8981\u4E3A\u6570\u5B57";
        return true;
      } else if (baseAverageDayUse < 0) {
        errMsg = materialItem.label + ":baseAverageDayUse\u4E0D\u80FD\u4E3A\u8D1F";
        return true;
      }
      if (typeof min !== "number") {
        errMsg = materialItem.label + ":min\u9700\u8981\u4E3A\u6570\u5B57";
        return true;
      } else if (min < 0) {
        errMsg = materialItem.label + ":min\u4E0D\u80FD\u4E3A\u8D1F";
        return true;
      }
      if (typeof max !== "number") {
        errMsg = materialItem.label + ":max\u9700\u8981\u4E3A\u6570\u5B57";
        return true;
      } else if (max < 0) {
        errMsg = materialItem.label + ":max\u4E0D\u80FD\u4E3A\u8D1F";
        return true;
      }
      if (min > max) {
        errMsg = materialItem.label + ":max\u9700\u8981\u5927\u4E8Emin";
        return true;
      }
      if (!materialItem.list.length) {
        errMsg = materialItem.label + ":\u54C1\u724C\u5217\u8868\u4E0D\u80FD\u4E3A\u7A7A";
        return true;
      }
      const brandListUnit = materialItem.list.map((i) => i.specs[i.specs.length - 1].unit);
      const brandListUnits = Array.from(new Set(brandListUnit));
      if (brandListUnits.length > 1) {
        errMsg = materialItem.label + ":\u54C1\u724C\u5217\u8868\u7684\u89C4\u683C\u6700\u540E\u5355\u4F4D\u4E0D\u4E00\u81F4";
        return true;
      } else if (!brandListUnits[0].trim()) {
        errMsg = materialItem.label + ":\u54C1\u724C\u5217\u8868\u6700\u540E\u89C4\u683C\u7684\u5355\u4F4D\u4E0D\u80FD\u4E3A\u7A7A";
        return;
      }
    });
    if (errMsg) {
      return errMsg;
    }
    const newList2 = [];
    list.forEach((_materialItem) => {
      const newMaterialItem = JSON.parse(JSON.stringify(_materialItem));
      newMaterialItem.unit = newMaterialItem.list[0].specs.slice(-1)[0].unit;
      newList2.push(newMaterialItem);
    });
    try {
      localStorage.setItem(matetialsListStorageKey, JSON.stringify(newList2));
      return "";
    } catch (err) {
      return "\u5B58\u50A8\u5F02\u5E38";
    }
  }
  function getMaterialList() {
    const storageMaterialsList = getMaterialsListByStorage();
    if (storageMaterialsList.length) {
      return JSON.parse(JSON.stringify(storageMaterialsList));
    } else {
      return JSON.parse(JSON.stringify(materialList));
    }
  }
  function getEmptyBrandItem() {
    return {
      label: emptyBrandLabel,
      isDeprecated: false,
      specs: [],
      priority: 1,
      newAdd: true
    };
  }
  function getSpecsText(specs) {
    let specsText = "1";
    specs.forEach((specsItem, index) => {
      if (index === 0) {
        specsText = `1${specsItem.unit}`;
      } else {
        const lastSpecItem = specs[index - 1];
        specsText += `*${lastSpecItem.spec}${specsItem.unit}`;
      }
    });
    return specs.length ? specsText : "-";
  }
  function getEmptyMaterialItem() {
    return {
      label: emptyMaterialLabel,
      isDeprecated: false,
      list: [],
      uasge: {
        min: 0,
        max: 0
      },
      unit: "",
      baseAverageDayUse: 50,
      newAdd: true
    };
  }

  // utils/recordList.ts
  var RecordListStorageKey = "materials_recordList_new";
  function createRecordBrandItem(brandItem) {
    const belongNumObj = {};
    recordRecordBelong.forEach((belongItem) => {
      belongNumObj[belongItem.field] = brandItem.specs.map((i) => {
        return {
          ...i,
          num: 0
        };
      });
    });
    return {
      label: brandItem.label,
      ...belongNumObj
    };
  }
  function createRecordMaterialItem(materialItem) {
    return {
      label: materialItem.label,
      list: materialItem.list.map((brandItem) => createRecordBrandItem(brandItem))
    };
  }
  function updateRecordListByMaterialList(recordList) {
    const newRecordList = [];
    recordList.forEach((recordItem) => {
      const newRecordMaterialsList = [];
      getMaterialList().forEach((materialItem) => {
        const findRecordMaterialItem = recordItem.list.find((i) => i.label === materialItem.label);
        if (findRecordMaterialItem) {
          const newRecordBrandList = [];
          materialItem.list.forEach((brandItem) => {
            const findRecordBrandItem = findRecordMaterialItem.list.find((i) => i.label === brandItem.label);
            if (findRecordBrandItem) {
              newRecordBrandList.push(findRecordBrandItem);
            } else {
              newRecordBrandList.push(createRecordBrandItem(brandItem));
            }
          });
          newRecordMaterialsList.push({
            ...findRecordMaterialItem,
            list: newRecordBrandList
          });
        } else {
          newRecordMaterialsList.push(createRecordMaterialItem(materialItem));
        }
      });
      newRecordList.push({
        recordDate: recordItem.recordDate,
        list: newRecordMaterialsList
      });
    });
    return newRecordList;
  }
  function sortRecordList(recordList) {
    recordList.sort((l, r) => {
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
    return recordList;
  }
  function complementRecordList(recordList) {
    return recordList.map((recordItem) => {
      return {
        ...recordItem,
        list: recordItem.list.map((recordMaterialItem) => {
          const findMaterialItem = getMaterialList().find((i) => i.label === recordMaterialItem.label) || {};
          return {
            // 补充物料的信息
            ...findMaterialItem,
            ...recordMaterialItem,
            list: recordMaterialItem.list.map((recordBrandItem) => {
              const findBrandItem = findMaterialItem.list.find((i) => i.label === recordBrandItem.label) || {};
              return {
                ...recordBrandItem,
                // 补充品牌的信息
                ...deleteProperty(findBrandItem, "specs")
              };
            })
          };
        })
      };
    });
  }
  function hooksRecordList(recordList) {
    function getBrandNum(belongField, brandItem) {
      const newBrandItemSpecs = JSON.parse(JSON.stringify(brandItem[belongField]));
      newBrandItemSpecs.reverse();
      let v = 0;
      let rate = 1;
      newBrandItemSpecs.forEach((specsItem) => {
        rate = rate * specsItem.spec;
        v += specsItem.num * rate;
      });
      return v;
    }
    function getBrandSpecsText(brandItem) {
      const newBrandItemSpecs = JSON.parse(JSON.stringify(brandItem.system));
      return getSpecsText(newBrandItemSpecs);
    }
    function getMaterialNum(belongField, materialItem) {
      let v = 0;
      materialItem.list.forEach((brandItem) => {
        const computedField = `${belongField}Num`;
        v += brandItem.computed[computedField];
      });
      return v;
    }
    function updateBrandComputedValueAndFireHooks(belongField, brandItem, materialItem) {
      const v = getBrandNum(belongField, brandItem);
      const computedField = `${belongField}Num`;
      brandItem.computed[computedField] = v;
      const hooksField = `${belongField}NumChange`;
      brandItem.hooks[hooksField].forEach((i) => {
        i(v);
      });
      if (belongField.includes("repo")) {
        const repoV = getBrandNum("repo", brandItem);
        const repoExtraV = getBrandNum("repoExtra", brandItem);
        brandItem.computed["repoFullNum"] = repoV + repoExtraV;
        brandItem.hooks["repoFullNumChange"].forEach((i) => {
          i(v);
        });
      }
      updateMaterialComputedValueAndFireHooks(belongField, materialItem);
    }
    function updateMaterialComputedValueAndFireHooks(belongField, materialItem) {
      const v = getMaterialNum(belongField, materialItem);
      const computedField = `${belongField}Num`;
      materialItem.computed[computedField] = v;
      const hooksField = `${belongField}NumChange`;
      materialItem.hooks[hooksField].forEach((i) => {
        i(v);
      });
      if (belongField.includes("repo")) {
        const repoV = getMaterialNum("repo", materialItem);
        const repoExtraV = getMaterialNum("repoExtra", materialItem);
        materialItem.computed["repoFullNum"] = repoV + repoExtraV;
        materialItem.hooks["repoFullNumChange"].forEach((i) => {
          i(v);
        });
      }
    }
    function updateMaterialComputedChartDataAndFireHooks(recordList2, materialLabel) {
      function _getAverageDayUse(recordMaterialItem, recordIndex) {
        if (recordIndex === 0) {
          return getFormatNum(recordMaterialItem.baseAverageDayUse);
        } else {
          const preRecordMaterialItem = recordList2[recordIndex - 1].list.find((i) => i.label === recordMaterialItem.label) || {};
          const currentMaterialItemDayUse = recordMaterialItem.computed.chartData.dayUse;
          const preMaterialItemAverageDayUse = preRecordMaterialItem.computed.chartData.averageDayUse;
          if (currentMaterialItemDayUse === "-") {
            return preMaterialItemAverageDayUse;
          } else {
            return getFormatNum(currentMaterialItemDayUse * 0.5 + preMaterialItemAverageDayUse * 0.5);
          }
        }
      }
      function _getOutSuggestInfo(recordMaterialItem) {
        const systemNum = recordMaterialItem.computed.systemNum;
        const repoNum = recordMaterialItem.computed.repoNum;
        const repoFullNum = recordMaterialItem.computed.repoFullNum;
        const usage = recordMaterialItem.uasge;
        const averageDayUse = recordMaterialItem.computed.chartData.averageDayUse;
        function _computed(_systemNum, _repoNum, isRepoFull) {
          let outSuggestText = `\u7CFB\u7EDF(${_systemNum})${isRepoFull ? "\u603B\u4ED3\u5E93" : "\u4ED3\u5E93"}(${_repoNum})`;
          let outSuggest;
          if (_systemNum > _repoNum) {
            const moreOutRate = Math.round((_systemNum - _repoNum) / averageDayUse);
            let catchUpDays;
            if (moreOutRate < 10) {
              outSuggestText += "[\u7CFB\u7EDF\u7A0D\u591A]";
              catchUpDays = isRepoFull ? 7 * 2 : 10;
            } else if (moreOutRate < 20) {
              outSuggestText += "[\u7CFB\u7EDF\u8F83\u591A]";
              catchUpDays = isRepoFull ? 7 * 4 : 10;
            } else {
              outSuggestText += "[\u7CFB\u7EDF\u8FDC\u591A]";
              catchUpDays = isRepoFull ? 7 * 6 : 10;
            }
            const moreOut = getFormatNum(1 / catchUpDays * averageDayUse);
            outSuggest = Math.min(...[averageDayUse + moreOut, usage.max]);
            outSuggest = getFormatNum(outSuggest);
            outSuggestText += `[\u903B\u8F91${averageDayUse}+${moreOut}]`;
            outSuggestText += `[\u51FA\u5E93<strong>${outSuggest}</strong>]`;
          } else if (_systemNum === _repoNum) {
            outSuggestText += "[\u4E00\u6837\u591A]";
            outSuggest = averageDayUse;
            outSuggest = getFormatNum(outSuggest);
            outSuggestText += `[\u51FA\u5E93<strong>${outSuggest}</strong>]`;
          } else {
            const lessOutRate = Math.round((_repoNum - _systemNum) / averageDayUse);
            let catchUpDays;
            if (lessOutRate < 10) {
              outSuggestText += "[\u603B\u4ED3\u5E93\u7A0D\u591A]";
              catchUpDays = isRepoFull ? 7 * 2 : 10;
            } else if (lessOutRate < 20) {
              outSuggestText += "[\u603B\u4ED3\u5E93\u8F83\u591A]";
              catchUpDays = isRepoFull ? 7 * 4 : 10;
            } else {
              outSuggestText += "[\u603B\u4ED3\u5E93\u8FDC\u591A]";
              catchUpDays = isRepoFull ? 7 * 6 : 10;
            }
            const lessOut = getFormatNum(1 / catchUpDays * averageDayUse);
            outSuggest = Math.max(...[averageDayUse - lessOut, usage.min]);
            outSuggest = getFormatNum(outSuggest);
            outSuggestText += `[\u903B\u8F91${averageDayUse}-${lessOut}]`;
            outSuggestText += `[\u51FA\u5E93<strong>${outSuggest}</strong>]`;
          }
          return {
            outSuggest,
            outSuggestText
          };
        }
        const outSuggestByRepoInfo = _computed(systemNum, repoNum, false);
        const outSuggestByRepoFullInfo = _computed(systemNum, repoFullNum, true);
        return {
          outSuggestByRepo: outSuggestByRepoInfo.outSuggest,
          outSuggestByRepoFull: outSuggestByRepoFullInfo.outSuggest,
          outSuggestTextByRepo: outSuggestByRepoInfo.outSuggestText,
          outSuggestTextByRepoFull: outSuggestByRepoFullInfo.outSuggestText
        };
      }
      function getNumToMaxUnitNumTextList(recordMaterialItem, num) {
        return recordMaterialItem.list.map((recordBrandItem) => {
          if (recordBrandItem.isDeprecated) {
            return "";
          } else {
            const MaxUnitMapMinUnitNum = recordBrandItem.system.reduce((total, cur) => {
              total = total * cur.spec;
              return total;
            }, 1);
            return `${getFormatNum(num / MaxUnitMapMinUnitNum)}${recordBrandItem.system[0].unit}`;
          }
        }).filter(Boolean);
      }
      function _getPurchaseInfo(recordMaterialItem, recordIndex) {
        let _repoFullNum = recordMaterialItem.computed.repoFullNum;
        let _averageDayUse = recordMaterialItem.computed.chartData.averageDayUse;
        const currentRecordItem = recordList2[recordIndex];
        let _purchaseText = "";
        let _purchaseNum = 0;
        const availableDays = 45;
        if (_averageDayUse === 0) {
          return {
            purchaseSuggest: _purchaseNum,
            purchaseSuggestText: "[\u65E5\u8017\u4E3A0\uFF0C\u65E0\u6CD5\u8BA1\u7B97]"
          };
        }
        if (recordIndex === recordList2.length - 1) {
          _purchaseText += `[\u9884\u8BA1]`;
          const dayDistanceToday = getDayDistance(getCurrentDate().full, currentRecordItem.recordDate);
          _repoFullNum = getFormatNum(_repoFullNum - _averageDayUse * dayDistanceToday);
        }
        _purchaseText += `[\u4ED3\u5E93${_repoFullNum}]`;
        _purchaseText += `[\u65E5\u8017${_averageDayUse}]`;
        const availableDay = _repoFullNum > 0 ? getFormatNum(_repoFullNum / _averageDayUse) : 0;
        _purchaseText += `[\u53EF\u7528${availableDay}\u5929]`;
        if (availableDay >= availableDays) {
          _purchaseNum = 0;
          _purchaseText += `[\u65E0\u9700\u8D2D\u4E70]`;
        } else {
          _purchaseNum = getFormatNum((availableDays - availableDay) * _averageDayUse);
          _purchaseText += `[\u9700\u8981\u8D2D\u4E70<strong>${getNumToMaxUnitNumTextList(recordMaterialItem, _purchaseNum)}</strong>]`;
        }
        return {
          purchaseSuggest: _purchaseNum,
          purchaseSuggestText: _purchaseText
        };
      }
      function _updateMaterialChartData(recordMaterialItem, recordIndex) {
        const currentRecordItem = recordList2[recordIndex];
        const currentRecordMaterialItem = recordMaterialItem;
        const currentChartData = currentRecordMaterialItem.computed.chartData;
        if (recordIndex !== 0) {
          const prevRecordItem = recordList2[recordIndex - 1];
          const prevRecordMaterialItem = prevRecordItem.list.find((i) => i.label === recordMaterialItem.label) || {};
          const dayDistance = getDayDistance(currentRecordItem.recordDate, prevRecordItem.recordDate);
          const repoFullUse = prevRecordMaterialItem.computed.repoFullNum + currentRecordMaterialItem.computed.purchaseNum - currentRecordMaterialItem.computed.repoFullNum;
          if (prevRecordMaterialItem.computed.repoFullNum === 0 && prevRecordMaterialItem.computed.systemNum === 0 && currentRecordMaterialItem.computed.repoFullNum === 0 && currentRecordMaterialItem.computed.systemNum) {
            currentChartData.dayUse = "-";
            currentChartData.weekUseText = "";
          } else {
            currentChartData.dayUse = getFormatNum(repoFullUse / dayDistance);
            currentChartData.weekUseText = getNumToMaxUnitNumTextList(recordMaterialItem, currentChartData.dayUse * 7).toString();
          }
        }
        currentChartData.averageDayUse = _getAverageDayUse(recordMaterialItem, recordIndex);
        if (currentChartData.averageDayUse <= 0) {
          currentChartData.availableDay = "-";
          currentChartData.outSuggestByRepo = "-";
          currentChartData.outSuggestByRepoFull = "-";
          currentChartData.outSuggestTextByRepo = "[\u6570\u636E\u5F02\u5E38\uFF0C\u65E0\u6CD5\u8BA1\u7B97]";
          currentChartData.outSuggestTextByRepoFull = "";
          currentChartData.purchaseSuggest = 0;
          currentChartData.purchaseSuggestText = "[\u6570\u636E\u5F02\u5E38\uFF0C\u65E0\u6CD5\u8BA1\u7B97]";
        } else {
          currentChartData.availableDay = getFormatNum(currentRecordMaterialItem.computed.repoFullNum / currentChartData.averageDayUse);
          const outSuggestInfo = _getOutSuggestInfo(recordMaterialItem);
          currentChartData.outSuggestByRepo = outSuggestInfo.outSuggestByRepo;
          currentChartData.outSuggestByRepoFull = outSuggestInfo.outSuggestByRepoFull;
          currentChartData.outSuggestTextByRepo = outSuggestInfo.outSuggestTextByRepo;
          currentChartData.outSuggestTextByRepoFull = outSuggestInfo.outSuggestTextByRepoFull;
          const purchaseInfo = _getPurchaseInfo(recordMaterialItem, recordIndex);
          currentChartData.purchaseSuggest = purchaseInfo.purchaseSuggest;
          currentChartData.purchaseSuggestText = purchaseInfo.purchaseSuggestText;
        }
        recordMaterialItem.hooks.chartDataChange.forEach((i) => {
          i(cloneData(recordMaterialItem.computed.chartData));
        });
      }
      recordList2.forEach((recordItem, recordIndex) => {
        if (materialLabel) {
          const findRecordMaterialItem = recordItem.list.find((i) => i.label === materialLabel);
          if (findRecordMaterialItem) {
            _updateMaterialChartData(findRecordMaterialItem, recordIndex);
          }
        } else {
          recordItem.list.forEach((recordMaterialItem) => {
            _updateMaterialChartData(recordMaterialItem, recordIndex);
          });
        }
      });
    }
    function addComputedAndHooksFields(recordList2) {
      return recordList2.map((recordItem) => {
        const recordHooksItem = {
          ...recordItem,
          list: recordItem.list.map((recordMaterialItem) => {
            const findMaterialItem = getMaterialList().find((i) => i.label === recordMaterialItem.label) || {};
            const recordMaterialHooksItem = {
              ...recordMaterialItem,
              computed: {
                purchaseNum: 0,
                repoNum: 0,
                repoExtraNum: 0,
                systemNum: 0,
                repoFullNum: 0,
                chartData: {
                  dayUse: "-",
                  weekUseText: "",
                  averageDayUse: findMaterialItem.baseAverageDayUse || 0,
                  // 默认值是物料列表中配置的baseAverageDayUse
                  availableDay: "-",
                  outSuggestByRepo: "-",
                  outSuggestTextByRepo: "",
                  outSuggestByRepoFull: "-",
                  outSuggestTextByRepoFull: "",
                  purchaseSuggest: 0,
                  purchaseSuggestText: ""
                }
              },
              hooks: {
                purchaseNumChange: [],
                repoNumChange: [],
                repoExtraNumChange: [],
                systemNumChange: [],
                repoFullNumChange: [],
                chartDataChange: []
              },
              list: recordMaterialItem.list.map((recordBrandItem) => {
                const recordBrandHooksItem = {
                  ...recordBrandItem,
                  computed: {
                    // 默认值
                    purchaseNum: 0,
                    repoNum: 0,
                    repoExtraNum: 0,
                    systemNum: 0,
                    repoFullNum: 0
                  },
                  hooks: {
                    // 默认值
                    purchaseNumChange: [],
                    repoNumChange: [],
                    repoExtraNumChange: [],
                    systemNumChange: [],
                    repoFullNumChange: []
                  },
                  specsText: getBrandSpecsText(recordBrandItem)
                };
                recordRecordBelong.forEach((belongItem) => {
                  recordBrandItem[belongItem.field].forEach((specsItem) => {
                    let _innerNum = specsItem["num"];
                    Object.defineProperty(specsItem, "num", {
                      set(v) {
                        if (typeof v !== "number") return;
                        if (v !== _innerNum) {
                          _innerNum = v;
                          updateBrandComputedValueAndFireHooks(belongItem.field, recordBrandHooksItem, recordMaterialHooksItem);
                        }
                      },
                      get() {
                        return _innerNum;
                      }
                    });
                  });
                });
                return recordBrandHooksItem;
              })
            };
            return recordMaterialHooksItem;
          })
        };
        return recordHooksItem;
      });
    }
    function fireBrandNumChangeToFillValue(recordHooksList2) {
      recordHooksList2.forEach((recordItem) => {
        recordItem.list.forEach((recordMaterialItem) => {
          recordMaterialItem.list.forEach((recordBrandItem) => {
            recordRecordBelong.forEach((belongItem) => {
              updateBrandComputedValueAndFireHooks(belongItem.field, recordBrandItem, recordMaterialItem);
            });
          });
        });
        recordItem.list.forEach((recordMaterialItem) => {
          const hoolsKeys = objectKeys(recordMaterialItem.hooks);
          hoolsKeys.forEach((hookItem) => {
            if (hookItem === "chartDataChange") return;
            if (hookItem === "repoNumChange" || hookItem === "repoExtraNumChange") return;
            recordMaterialItem.hooks[hookItem].push((value) => {
              updateMaterialComputedChartDataAndFireHooks(recordHooksList2, recordMaterialItem.label);
            });
          });
        });
      });
      updateMaterialComputedChartDataAndFireHooks(recordHooksList2);
    }
    const recordHooksList = addComputedAndHooksFields(recordList);
    fireBrandNumChangeToFillValue(recordHooksList);
    return recordHooksList;
  }
  function createRecordItem(recordDate) {
    return {
      recordDate,
      list: getMaterialList().map((materialItem) => createRecordMaterialItem(materialItem))
    };
  }
  function setRecordList(recordList) {
    const recordDateList = [];
    const isRecordDateRepeat = recordList.some((i) => {
      if (recordDateList.includes(i.recordDate)) {
        recordDateList.push(i.recordDate);
        return true;
      } else {
        recordDateList.push(i.recordDate);
        return false;
      }
    });
    if (isRecordDateRepeat) {
      alert(`\u8BB0\u5F55\u9879\u65E5\u671F\u91CD\u590D${recordDateList[recordDateList.length - 1]}`);
      return;
    }
    const newRecordList = recordList.slice(-10);
    const newRecordFirstItem = newRecordList[0];
    const newMaterialList = getMaterialList().map((materialItem) => {
      const findMaterialItem = newRecordFirstItem.list.find((_i) => _i.label === materialItem.label);
      return {
        ...materialItem,
        // 更新物料的基准baseAverageDayUse
        baseAverageDayUse: findMaterialItem.baseAverageDayUse
      };
    });
    const recordBaseList = newRecordList.map((recordItem) => {
      return {
        recordDate: recordItem.recordDate,
        list: recordItem.list.map((recordMaterialItem) => {
          return {
            label: recordMaterialItem.label,
            list: recordMaterialItem.list.map((recordBrandItem) => {
              const belongNumObj = {};
              recordRecordBelong.forEach((belongItem) => {
                belongNumObj[belongItem.field] = recordBrandItem[belongItem.field];
              });
              return {
                label: recordBrandItem.label,
                ...belongNumObj
              };
            })
          };
        })
      };
    });
    try {
      localStorage.setItem(RecordListStorageKey, JSON.stringify(recordBaseList));
      setMaterialList(newMaterialList);
    } catch (err) {
      alert("\u5B58\u50A8\u5F02\u5E38");
    }
  }
  function getRecordList() {
    let _recordListStr = localStorage.getItem(RecordListStorageKey);
    let _recordList = [];
    if (!_recordListStr) {
      _recordList = defaultRecordList;
    } else {
      try {
        _recordList = JSON.parse(_recordListStr);
      } catch (err) {
        _recordList = defaultRecordList;
      }
    }
    return _recordList;
  }
  function initRecordList(recordList) {
    sortRecordList(recordList);
    const newRecordList = updateRecordListByMaterialList(recordList);
    const recordFullList = complementRecordList(newRecordList);
    const recordHooksList = hooksRecordList(recordFullList);
    return recordHooksList;
  }
  function getFormatNumBySpecs(brandItem, num) {
    if (brandItem.isDeprecated) {
      return "";
    } else {
      let total = 1;
      let unit = "";
      const specs = cloneData(brandItem.system).reverse();
      for (const specItem of specs) {
        const newTotal = total * specItem.spec;
        if (num / newTotal < 0.5) {
          break;
        }
        unit = specItem.unit;
        total = newTotal;
      }
      return `${getFormatNum(num / total)}${unit}`;
    }
  }

  // utils/chartData.ts
  function getChartDataItem(chartTypeLabel, materialItemLabel) {
    const recordList = initRecordList(getRecordList());
    const chartTypeItem = chartShowTypes.find((i) => i.label === chartTypeLabel);
    const chartDataItem = {
      labels: [],
      datasets: [],
      materialItemLabel,
      chartMaterialItems: []
    };
    if (!chartTypeItem || !materialItemLabel || !getMaterialList().find((i) => i.label === materialItemLabel)) {
      return chartDataItem;
    }
    const { fields } = chartTypeItem;
    fields.forEach((fieldItem) => {
      chartDataItem.datasets.push({
        field: fieldItem,
        label: chartFieldsMap[fieldItem],
        data: []
      });
    });
    function getFieldValue(field, materialItem) {
      if (!materialItem) return null;
      const computedValue = materialItem.computed;
      if (field in computedValue) {
        return computedValue[field];
      } else if (field in computedValue.chartData) {
        return computedValue.chartData[field];
      } else {
        return null;
      }
    }
    recordList.forEach((recordItem) => {
      const findMaterialItem = recordItem.list.find((i) => i.label === materialItemLabel);
      chartDataItem.labels.push(recordItem.recordDate);
      fields.forEach((fieldItem, index) => {
        chartDataItem.datasets[index].data.push(getFieldValue(fieldItem, findMaterialItem));
      });
      chartDataItem.chartMaterialItems.push(cloneData({
        ...findMaterialItem,
        recordDate: recordItem.recordDate
      }));
    });
    return chartDataItem;
  }

  // components/my-inputs/index.ts
  var myInputs = {
    tagName: "my-inputs",
    createNode(shadowRoot, options) {
      const [recordMaterialItem, recordItem, recordList] = options.data;
      if (recordMaterialItem.isDeprecated) return;
      const brandList = recordMaterialItem.list.filter((i) => i.isDeprecated !== true);
      const currentBelongField = options.params.belong.field;
      const currentRecordIndex = recordList.findIndex((i) => i.recordDate === recordItem.recordDate);
      if (currentRecordIndex === -1) return;
      let lastRecordItem;
      let lastRecordMaterialItem;
      if (currentRecordIndex > 0) {
        lastRecordItem = recordList[currentRecordIndex - 1];
        lastRecordMaterialItem = lastRecordItem.list.find((i) => i.label === recordMaterialItem.label);
      }
      createElement({
        tagName: "div",
        className: "wrapper",
        childs: [
          {
            tagName: "div",
            className: "material-label-wrapper",
            childs: [
              {
                tagName: "span",
                className: "material-label",
                innerText: recordMaterialItem.label,
                events: {
                  "click"(e) {
                    options.params.belongHiddenFun();
                  }
                }
              },
              {
                tagName: "span",
                className: "material-belong",
                innerText: options.params.belong.label,
                events: {
                  "click"(e) {
                    saveHtmlActionStatus({
                      selectMaterialItem: {
                        belongField: options.params.belong.field,
                        label: recordMaterialItem.label
                      }
                    });
                    updateHtmlAction("\u56FE\u8868", {
                      defaultType: "\u5F52\u5C5E\u6570\u91CF",
                      defaultLabel: recordMaterialItem.label
                    });
                  }
                }
              }
            ]
          },
          {
            tagName: "div",
            className: "brand-list",
            childs: brandList.map((brandItem) => {
              return {
                tagName: "div",
                className: "brand-item",
                childs: [
                  {
                    tagName: "div",
                    className: "brand-label-wrapper",
                    childs: [
                      {
                        tagName: "span",
                        className: "brand-label",
                        innerText: brandItem.label
                      },
                      {
                        tagName: "span",
                        className: "brand-specs",
                        innerText: `\u89C4\u683C:${brandItem.specsText}`,
                        events: {
                          "click"(e) {
                            saveHtmlActionStatus({
                              selectMaterialItem: {
                                belongField: options.params.belong.field,
                                label: recordMaterialItem.label
                              }
                            });
                          }
                        }
                      }
                    ]
                  },
                  {
                    tagName: "div",
                    className: "brand-inputs-wrapper",
                    childs: brandItem[currentBelongField].map((specItem) => {
                      return {
                        tagName: "div",
                        className: "input-wrapper",
                        childs: [
                          {
                            tagName: "input",
                            attributes: {
                              value: specItem.num + ""
                            },
                            events: {
                              input(e) {
                                if (!e.target) return;
                                specItem.num = Number(e.target.value);
                              }
                            }
                          },
                          {
                            tagName: "span",
                            className: "input-unit",
                            innerText: specItem.unit
                          }
                        ]
                      };
                    })
                  },
                  {
                    tagName: "div",
                    className: "brand-help",
                    childs: () => {
                      function getBrandNums(_brandItem) {
                        const currentBelongItem = recordRecordBelong.find((i) => i.field === currentBelongField);
                        const otherBelongItems = recordRecordBelong.filter((i) => i.field !== currentBelongField);
                        const newRecordRecordBelong = [currentBelongItem, ...otherBelongItems];
                        const numList = newRecordRecordBelong.map((belongItem) => {
                          return [belongItem.field === currentBelongField, belongItem.shortLabel, _brandItem ? _brandItem.computed[`${belongItem.field}Num`] : "-"];
                        });
                        return numList;
                      }
                      if (recordMaterialItem.list.length < 2) {
                        return [];
                      }
                      return [
                        // 上次该品牌的信息
                        createUpdateElement(() => {
                          let lastRecordBrandItem;
                          if (lastRecordMaterialItem) {
                            lastRecordBrandItem = lastRecordMaterialItem.list.find((i) => i.label === brandItem.label);
                          }
                          return {
                            tagName: "div",
                            className: "brand-help-item",
                            childs: [
                              {
                                tagName: "span",
                                innerHTML: "\u4E0A\u6B21:&nbsp;"
                              },
                              {
                                tagName: "span",
                                className: "brand-help-item-content",
                                childs: getBrandNums(lastRecordBrandItem).map((i) => {
                                  const v = i[2];
                                  let color = "inherit";
                                  if (typeof v === "number" && v < 0) {
                                    color = "red";
                                  } else if (i[0]) {
                                    color = "#333";
                                  }
                                  return {
                                    tagName: "span",
                                    style: {
                                      color,
                                      width: `${getFormatNum(100 / (recordRecordBelong.length + 1))}%`
                                    },
                                    innerText: `${i[1]}:${i[2]}`
                                  };
                                })
                              }
                            ],
                            returnUpdateFun(updateFun) {
                              if (lastRecordBrandItem) {
                                lastRecordBrandItem.hooks[`${currentBelongField}NumChange`].push(updateFun);
                              }
                            }
                          };
                        }),
                        // 本次该品牌的信息
                        createUpdateElement(() => {
                          const currentBelongNum = brandItem.computed[`${currentBelongField}Num`];
                          return {
                            tagName: "div",
                            className: "brand-help-item",
                            childs: [
                              {
                                tagName: "span",
                                innerHTML: "\u672C\u6B21:&nbsp;"
                              },
                              {
                                tagName: "span",
                                className: "brand-help-item-content",
                                childs: getBrandNums(brandItem).map((i) => {
                                  const v = i[2];
                                  let color = "inherit";
                                  if (typeof v === "number" && v < 0) {
                                    color = "red";
                                  } else if (i[0]) {
                                    color = "#333";
                                  }
                                  return {
                                    tagName: "span",
                                    style: {
                                      color,
                                      width: `${getFormatNum(100 / (recordRecordBelong.length + 1))}%`
                                    },
                                    innerText: `${i[1]}:${i[2]}`
                                  };
                                })
                              }
                            ],
                            returnUpdateFun(updateFun) {
                              brandItem.hooks[`${currentBelongField}NumChange`].push(updateFun);
                            }
                          };
                        })
                      ];
                    }
                  }
                ]
              };
            })
          },
          // 物料的信息
          {
            tagName: "div",
            className: "material-help",
            childs: () => {
              function getMaterialNums(_materialItem) {
                const currentBelongItem = recordRecordBelong.find((i) => i.field === currentBelongField);
                const otherBelongItems = recordRecordBelong.filter((i) => i.field !== currentBelongField);
                const newRecordRecordBelong = [currentBelongItem, ...otherBelongItems];
                const numList = newRecordRecordBelong.map((belongItem) => {
                  return [belongItem.field === currentBelongField, belongItem.shortLabel, _materialItem ? _materialItem.computed[`${belongItem.field}Num`] : "-"];
                });
                numList.push([
                  true,
                  // 保持高亮
                  "\u65E5\u8017",
                  _materialItem ? _materialItem.computed.chartData.dayUse : "-"
                ]);
                return numList;
              }
              return [
                // 上次物料的信息
                createUpdateElement(() => {
                  return {
                    tagName: "div",
                    className: "material-help-item",
                    childs: [
                      {
                        tagName: "span",
                        innerHTML: "\u4E0A\u6B21:&nbsp;"
                      },
                      {
                        tagName: "span",
                        className: "material-help-item-content",
                        childs: getMaterialNums(lastRecordMaterialItem).map((i) => {
                          const v = i[2];
                          let color = "inherit";
                          if (typeof v === "number" && v < 0) {
                            color = "red";
                          } else if (i[0]) {
                            color = "#333";
                          }
                          return {
                            tagName: "span",
                            style: {
                              color,
                              width: `${getFormatNum(100 / (recordRecordBelong.length || 1))}%`
                            },
                            innerText: `${i[1]}:${i[2]}`
                          };
                        })
                      }
                    ],
                    returnUpdateFun(updateFun) {
                      if (lastRecordMaterialItem) {
                        lastRecordMaterialItem.hooks[`${currentBelongField}NumChange`].push(updateFun);
                        lastRecordMaterialItem.hooks.chartDataChange.push(updateFun);
                      }
                    }
                  };
                }),
                // 本次物料的信息
                createUpdateElement(() => {
                  return {
                    tagName: "div",
                    className: "material-help-item",
                    childs: [
                      {
                        tagName: "span",
                        innerHTML: "\u672C\u6B21:&nbsp;"
                      },
                      {
                        tagName: "span",
                        className: "material-help-item-content",
                        childs: getMaterialNums(recordMaterialItem).map((i) => {
                          const v = i[2];
                          let color = "inherit";
                          if (typeof v === "number" && v < 0) {
                            color = "red";
                          } else if (i[0]) {
                            color = "#333";
                          }
                          return {
                            tagName: "span",
                            style: {
                              color,
                              width: `${getFormatNum(100 / (recordRecordBelong.length || 1))}%`
                            },
                            innerText: `${i[1]}:${i[2]}`
                          };
                        })
                      }
                    ],
                    returnUpdateFun(updateFun) {
                      recordMaterialItem.hooks[`${currentBelongField}NumChange`].push(updateFun);
                      recordMaterialItem.hooks.chartDataChange.push(updateFun);
                    }
                  };
                })
              ];
            }
          }
        ]
      }, shadowRoot);
    }
  };

  // components/my-message/index.ts
  var myMessage = {
    tagName: "my-message",
    createNode(shadowRoot, options, stylePromise) {
      async function createWrapper(textList, config) {
        const wrapperNode = shadowRoot.querySelector(".message-wrapper");
        const { delay = 1200, cancel = false, confirm = false, input, textarea, select } = config || {};
        if (typeof textList === "string") {
          textList = [textList];
        }
        if (wrapperNode) wrapperNode.remove();
        await stylePromise;
        return new Promise((resolve, reject) => {
          let inputHelpText = "";
          let updateInputHelpTextFun;
          if (cancel || confirm || input || textarea || select) {
            const textListNodes = textList.map((i) => ({
              tagName: "div",
              className: "message-item",
              innerText: i
            }));
            const myInput = input || textarea;
            if (myInput) {
              textListNodes.push({
                tagName: "div",
                className: "input-wrapper",
                childs: [
                  {
                    tagName: input ? "input" : "textarea",
                    attributes: {
                      value: myInput.default || ""
                    },
                    innerText: myInput.default || "",
                    events: {
                      "input": (e) => {
                        const v = e.target.value;
                        if (myInput.validate) {
                          inputHelpText = myInput.validate(v) || "";
                          if (updateInputHelpTextFun) {
                            updateInputHelpTextFun();
                          }
                        }
                      }
                    },
                    attachedQueryNode: shadowRoot,
                    returnAttachedNode(ele) {
                      if (myInput.validate) {
                        inputHelpText = myInput.validate(myInput.default || "") || "";
                        if (updateInputHelpTextFun) {
                          updateInputHelpTextFun();
                        }
                      }
                      const currentInput = ele;
                      currentInput.focus();
                      currentInput.setSelectionRange(currentInput.value.length, currentInput.value.length);
                    }
                  },
                  createUpdateElement(() => {
                    return {
                      tagName: "div",
                      className: "input-help",
                      innerHTML: inputHelpText || "&nbsp;",
                      returnUpdateFun(updateFun) {
                        updateInputHelpTextFun = updateFun;
                      }
                    };
                  })
                ]
              });
            }
            if (select && select.list && select.onChange) {
              textListNodes.push({
                tagName: "div",
                className: "select-wrapper",
                childs: [
                  {
                    tagName: "select",
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
                      ...select.list.map((i) => {
                        return {
                          tagName: "option",
                          attributes: {
                            value: i.value
                          },
                          innerText: i.label
                        };
                      })
                    ],
                    events: {
                      change(e) {
                        if (!e.target) return;
                        const v = e.target.value;
                        select.onChange(v);
                      }
                    }
                  }
                ]
              });
            }
            const _wrapperNode = createElement({
              tagName: "div",
              className: "message-wrapper popup",
              childs: [{
                tagName: "div",
                className: "message-body",
                style: {
                  "minWidth": "calc(100vw - 100px)"
                },
                childs: [
                  {
                    tagName: "div",
                    className: "message-body-content",
                    childs: textListNodes
                  },
                  {
                    tagName: "div",
                    className: "message-body-footer",
                    childs: [
                      {
                        tagName: "div",
                        className: "message-body-footer-item",
                        show: !!myInput || !!select || confirm,
                        innerText: "\u786E\u5B9A",
                        events: {
                          "click"(e) {
                            if (myInput && inputHelpText) {
                              return;
                            }
                            removeEle(_wrapperNode, "remove").then(() => {
                              resolve("\u786E\u5B9A");
                            });
                          }
                        }
                      },
                      // 右侧显示取消，避免点快点到了确认
                      {
                        tagName: "div",
                        className: "message-body-footer-item",
                        show: !!myInput || !!select || cancel,
                        innerText: "\u53D6\u6D88",
                        events: {
                          "click"(e) {
                            removeEle(_wrapperNode, "remove").then(() => {
                              resolve("\u53D6\u6D88");
                            });
                          }
                        }
                      }
                    ]
                  }
                ]
              }]
            }, shadowRoot);
          } else {
            const _wrapperNode = createElement({
              tagName: "div",
              className: "message-wrapper text",
              childs: [{
                tagName: "div",
                className: "message-body",
                childs: textList.map((i) => ({
                  tagName: "div",
                  className: "message-item",
                  innerText: i
                })),
                returnNode(e) {
                  setTimeout(() => {
                    removeEle(_wrapperNode, "remove").then(() => {
                      resolve("ok");
                    });
                  }, delay);
                }
              }]
            }, shadowRoot);
          }
        });
      }
      return {
        show: createWrapper
      };
    }
  };

  // components/my-form/index.ts
  var myForm = {
    tagName: "my-form",
    createNode(shadowRoot, options, stylePromise) {
      const { params, status } = options;
      const defaultDate = status?.defaultDate;
      let selectMaterialItem = status?.selectMaterialItem;
      let formRecordList = [];
      let recordItem;
      function updateHeadChilds(_defaultDate) {
        const formHeadNode = shadowRoot.querySelector(".form-head");
        if (!formHeadNode) return;
        if (formHeadNode) {
          removeChilds(formHeadNode);
        }
        function getDateNodeConfigAndUpdateFormBody() {
          const _recordList = getRecordList();
          if (params.type === "add") {
            _defaultDate = getCurrentDate().full;
          } else if (params.type === "modify") {
            _defaultDate = _defaultDate || "";
          }
          if (params.type === "add") {
            return {
              tagName: "input",
              className: "form-date",
              attributes: {
                type: "date",
                value: _defaultDate,
                readOnly: "readOnly"
              },
              attachedQueryNode: formHeadNode,
              returnAttachedNode(e) {
                if (_recordList.find((i) => i.recordDate === _defaultDate)) {
                  showMessage("\u5F53\u524D\u65E5\u671F\u7684\u8BB0\u5F55\u5DF2\u7ECF\u5B58\u5728\u4E86");
                  updateBodyChilds("");
                  return;
                }
                const newRecordList = [..._recordList, createRecordItem(_defaultDate)];
                formRecordList = initRecordList(newRecordList);
                updateBodyChilds(_defaultDate);
              }
            };
          } else if (params.type === "modify") {
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
                ..._recordList.map((recordItem2) => {
                  return {
                    tagName: "option",
                    attributes: {
                      value: recordItem2.recordDate
                    },
                    innerText: recordItem2.recordDate
                  };
                }).reverse()
              ],
              events: {
                change(e) {
                  if (!e.target) return;
                  const recordDate = e.target.value;
                  formRecordList = initRecordList(_recordList);
                  updateBodyChilds(recordDate);
                }
              },
              attachedQueryNode: formHeadNode,
              returnAttachedNode(e) {
                e.value = _defaultDate || "";
                formRecordList = initRecordList(_recordList);
                updateBodyChilds(_defaultDate || "");
              }
            };
          } else {
            return;
          }
        }
        createChildsElement([
          {
            tagName: "span",
            className: "form-date-label",
            innerText: params.type === "add" ? "\u5F53\u524D\u65E5\u671F" : "\u9009\u62E9\u65E5\u671F"
          },
          getDateNodeConfigAndUpdateFormBody()
        ], formHeadNode);
      }
      function updateBodyChilds(selectDate) {
        saveHtmlActionStatus({
          defaultDate: selectDate,
          // 会重置selectMaterialItem为进来值
          selectMaterialItem
        });
        updateFormFooter(selectDate ? true : false);
        const formBodyNode = shadowRoot.querySelector(".form-body");
        if (!formBodyNode) return;
        if (formBodyNode) {
          removeChilds(formBodyNode);
        }
        if (!selectDate) return;
        recordItem = formRecordList.find((i) => i.recordDate === selectDate);
        if (!recordItem) return;
        createChildsElement(recordRecordBelong.map((belongItem) => {
          return {
            tagName: "div",
            className: "belong-item",
            childs: [
              {
                tagName: "div",
                className: "belong-item-label",
                innerText: belongItem.label,
                attributes: {
                  "data-belong-field": belongItem.field
                },
                events: {
                  "click"(e) {
                    const currentTarget = e.target;
                    const parentNode = currentTarget?.parentNode;
                    if (!parentNode) return;
                    const belongListNode = parentNode.querySelector(".belong-material-list");
                    if (belongListNode) {
                      belongListNode.remove();
                    } else {
                      createElement({
                        tagName: "div",
                        className: "belong-material-list",
                        attachedQueryNode: parentNode,
                        returnAttachedNode(e2) {
                          recordItem = formRecordList.find((i) => i.recordDate === selectDate);
                          if (!recordItem) return;
                          const allFinishPromise = oneByone(recordItem.list, (recordMaterialHooksItem) => {
                            return new Promise((resolve) => {
                              createElement({
                                tagName: "div",
                                className: "belong-material-item fade-in",
                                attributes: {
                                  "data-material-item-label": recordMaterialHooksItem.label
                                },
                                childs: [
                                  createCustomElement("my-inputs", {
                                    data: [recordMaterialHooksItem, recordItem, formRecordList],
                                    params: {
                                      belong: belongItem,
                                      onlyShowLastSpecs: belongItem.field === "system" ? true : false,
                                      belongHiddenFun: () => {
                                        allFinishPromise.then(() => {
                                          currentTarget?.click();
                                        });
                                      }
                                    }
                                  })
                                ]
                              }, e2);
                              setTimeout(() => {
                                resolve("ok");
                              }, 10);
                            });
                          });
                        }
                      }, parentNode);
                    }
                  }
                }
              }
            ]
          };
        }), formBodyNode);
        if (selectMaterialItem) {
          const _selectMaterialItem = cloneData(selectMaterialItem);
          console.log("_selectMaterialItem", _selectMaterialItem);
          selectMaterialItem = void 0;
          const belongLabelNode = formBodyNode.querySelector(`[data-belong-field=${_selectMaterialItem.belongField}]`);
          if (!belongLabelNode || !belongLabelNode.parentNode) return;
          belongLabelNode.click();
          if (!_selectMaterialItem.label) return;
          const queryText = `[data-material-item-label=${_selectMaterialItem.label}]`;
          waitCondition(() => {
            if (belongLabelNode && belongLabelNode.parentNode) {
              return !!belongLabelNode.parentNode.querySelector(queryText);
            } else {
              return false;
            }
          }).then(() => {
            setTimeout(() => {
              if (belongLabelNode && belongLabelNode.parentNode) {
                const targetNode = belongLabelNode.parentNode.querySelector(queryText);
                if (targetNode) {
                  targetNode.scrollIntoView({
                    block: "center"
                  });
                  setTimeout(() => {
                    targetNode.classList.add("active");
                    setTimeout(() => {
                      targetNode.classList.remove("active");
                    }, 600);
                  }, 300);
                }
              }
            }, 300);
          });
        }
      }
      function updateFormFooter(showChilds) {
        const footerNode = shadowRoot.querySelector(".form-footer");
        if (!footerNode) return;
        removeChilds(footerNode);
        if (!showChilds) {
          return;
        }
        if (params.type === "add") {
          createChildsElement([
            {
              tagName: "div",
              className: "form-footer-item",
              innerText: "\u6DFB\u52A0",
              events: {
                click() {
                  setRecordList(formRecordList);
                  showMessage("\u6DFB\u52A0\u6210\u529F", { delay: 300 }).then(() => {
                    actionFireBack(() => {
                      updateHeadChilds("");
                    });
                  });
                }
              }
            }
          ], footerNode);
        } else if (params.type === "modify") {
          createChildsElement([
            {
              tagName: "div",
              className: "form-footer-item",
              innerText: "\u79FB\u9664",
              events: {
                click() {
                  if (!formRecordList || !recordItem) return;
                  showMessage("\u786E\u5B9A\u79FB\u9664\u5417", { confirm: true, cancel: true }).then((res) => {
                    if (res === "\u53D6\u6D88") return;
                    const newRecordList = formRecordList.filter((i) => i.recordDate !== recordItem?.recordDate);
                    setRecordList(newRecordList);
                    showMessage("\u79FB\u9664\u6210\u529F", { delay: 300 }).then(() => {
                      actionFireBack(() => {
                        updateHeadChilds("");
                      });
                    });
                  });
                }
              }
            },
            {
              tagName: "div",
              className: "form-footer-item",
              innerText: "\u66F4\u65B0",
              events: {
                click() {
                  setRecordList(formRecordList);
                  showMessage("\u66F4\u65B0\u6210\u529F", { delay: 300 }).then(() => {
                    actionFireBack(() => {
                      updateHeadChilds("");
                    });
                  });
                }
              }
            }
          ], footerNode);
        } else {
        }
      }
      stylePromise.then((res) => {
        createElement({
          tagName: "div",
          className: "form-wrapper",
          childs: [
            // 头部
            {
              tagName: "div",
              className: "form-head-wrapper",
              // 解决strick吸附测漏问题
              childs: [{
                tagName: "div",
                className: "form-head"
              }]
            },
            // 内容
            {
              tagName: "div",
              className: "form-body",
              childs: []
            },
            {
              tagName: "div",
              className: "form-footer",
              childs: []
            }
          ]
        }, shadowRoot);
        updateHeadChilds(defaultDate);
      });
    }
  };

  // components/my-actions/index.ts
  var myActions = {
    tagName: "my-actions",
    createNode(shadowRoot, options, stylePromise) {
      const actionClickCacheList = [];
      function fireActionItem(label, options2, status) {
        const actionHeadNode = shadowRoot.querySelector(".action-head");
        const actionBodyNode = shadowRoot.querySelector(".action-body");
        if (!actionBodyNode || !actionHeadNode) return;
        const headActionItems = actionHeadNode.querySelectorAll(`.action-head-item[data-label]`);
        Array.from(headActionItems).forEach((headNodeItem) => {
          if (headNodeItem.dataset.label === label) {
            headNodeItem.classList.add("active");
          } else {
            headNodeItem.classList.remove("active");
          }
        });
        removeChilds(actionBodyNode);
        const componentName = htmlActions.find((i) => i.label === label)?.component;
        if (!componentName) return;
        const newOptions = { ...options2 || {}, status: status || {} };
        console.log(newOptions);
        createCustomElement(componentName, newOptions, actionBodyNode);
      }
      function addActionClickItemToCache(label, options2, status) {
        actionClickCacheList.push([label, options2, status]);
        if (actionClickCacheList.length > 1) {
          const actionHeadNode = shadowRoot.querySelector(".action-head");
          if (!actionHeadNode) return;
          const returnBtn = actionHeadNode.querySelector(".return-btn");
          if (!returnBtn) {
            createElement({
              tagName: "div",
              className: "return-btn action-head-item",
              innerText: "\u8FD4\u56DE",
              events: {
                "click"(e) {
                  actionClickCacheList.pop();
                  const lastItem = actionClickCacheList.slice(-1)[0];
                  debugger;
                  if (!lastItem) {
                    removeEle(e.target, "remove");
                  } else {
                    fireActionItem(lastItem[0], lastItem[1], lastItem[2]);
                    if (actionClickCacheList.length === 1) {
                      removeEle(e.target, "remove");
                    }
                  }
                }
              }
            }, actionHeadNode);
          }
        }
      }
      async function createWrapper() {
        await stylePromise;
        createElement({
          tagName: "div",
          className: "wrapper",
          childs: [
            {
              tagName: "div",
              className: "action-head",
              childs: htmlActions.map((actionItem) => {
                function fireClick(currentItem, status = {}) {
                  const params = {
                    label: currentItem.dataset.label,
                    options: actionItem.options,
                    status
                  };
                  fireActionItem(params.label, params.options, params.status);
                  addActionClickItemToCache(params.label, params.options, params.status);
                }
                return {
                  tagName: "div",
                  className: "action-head-item",
                  innerText: actionItem.label,
                  attributes: {
                    "data-label": actionItem.label
                  },
                  events: {
                    "click"(e) {
                      const defaultStatus = actionItem.options?.status;
                      fireClick(e.target, defaultStatus);
                    },
                    "customClick"(e) {
                      const detail = e.detail;
                      if (typeof detail === "object") {
                        fireClick(detail.target, detail.status);
                      }
                    }
                  }
                };
              })
            },
            {
              tagName: "div",
              className: "action-body"
            }
          ]
        }, shadowRoot);
      }
      createWrapper();
      function updateAction(label, status) {
        const actionHeadNode = shadowRoot.querySelector(".action-head");
        if (actionHeadNode) {
          const actionItems = actionHeadNode.querySelectorAll(".action-head-item");
          if (actionItems) {
            const targetEle = Array.from(actionItems).find((i) => i.innerText === label);
            if (targetEle) {
              const customClick = new CustomEvent("customClick", {
                detail: {
                  status,
                  target: targetEle
                }
              });
              targetEle.dispatchEvent(customClick);
            }
          }
        }
      }
      function saveStatus(status, needRender = false) {
        const lastItem = actionClickCacheList.slice(-1)[0];
        if (lastItem) {
          lastItem[2] = {
            ...lastItem[2] || {},
            // 支持只更新部分状态
            ...status
          };
        }
        if (needRender) {
          fireActionItem(lastItem[0], lastItem[1], lastItem[2]);
        }
      }
      function actionFireBack2(replaceFun) {
        const actionHeadNode = shadowRoot.querySelector(".action-head");
        if (!actionHeadNode) {
          replaceFun();
          return;
        }
        const backBtn = actionHeadNode.querySelector(".return-btn");
        if (!backBtn) {
          replaceFun();
          return;
        } else {
          backBtn.click();
        }
      }
      return {
        updateAction,
        saveStatus,
        actionFireBack: actionFireBack2
      };
    }
  };

  // components/my-materials/index.ts
  var myMaterials = {
    tagName: "my-materials",
    createNode(shadowRoot, options, stylePromise) {
      const materialFormList = getMaterialList();
      function createForm(isAddMaterial) {
        const wrapperNode = shadowRoot.querySelector(".wrapper");
        if (wrapperNode) {
          wrapperNode.remove();
        }
        createElement({
          tagName: "div",
          className: "wrapper",
          childs: [
            {
              tagName: "div",
              className: "materials-wrapper",
              attachedQueryNode: shadowRoot,
              returnAttachedNode(ele) {
                const allFinishPromise = oneByone(materialFormList, async (materialItem) => {
                  await new Promise((resolve) => {
                    setTimeout(() => {
                      resolve("");
                    }, 50);
                  });
                  return createUpdateElement(() => {
                    let updateMaterialItemFun;
                    return {
                      tagName: "div",
                      className: `material-item ${materialItem.newAdd ? "material-item-newAdd" : ""}`,
                      returnUpdateFun(_updateFun) {
                        updateMaterialItemFun = _updateFun;
                      },
                      childs: [
                        {
                          tagName: "div",
                          className: "material-item-label-wrapper",
                          childs: [
                            {
                              tagName: "div",
                              className: "material-item-label",
                              innerHTML: `${materialItem.label}${materialItem.newAdd ? "&nbsp;\u270D\u{1F3FB}" : ""}`,
                              events: {
                                "click"(e) {
                                  if (materialItem.newAdd) {
                                    let newV;
                                    showMessage("\u7269\u6599\u540D\u79F0\u662F\u4EC0\u4E48", {
                                      input: {
                                        default: "",
                                        validate(v) {
                                          newV = v.toString().trim();
                                          if (!newV) {
                                            return "\u4E0D\u80FD\u4E3A\u7A7A";
                                          } else if (newV.length > 10) {
                                            return "\u540D\u79F0\u8FC7\u957F";
                                          } else if (materialFormList.map((i) => i.label).includes(newV)) {
                                            return "\u548C\u5DF2\u6709\u7269\u6599\u540D\u79F0\u91CD\u590D";
                                          }
                                          return "";
                                        }
                                      }
                                    }).then((res) => {
                                      if (res === "\u786E\u5B9A") {
                                        materialItem.label = newV;
                                        updateMaterialItemFun();
                                      }
                                    });
                                  }
                                }
                              }
                            },
                            {
                              tagName: "div",
                              className: `material-item-isDeprecated ${materialItem.isDeprecated === true ? "material-item-isDeprecated-true" : ""} `,
                              innerText: materialItem.isDeprecated === true ? "\u6FC0\u6D3B" : "\u5E9F\u5F03",
                              events: {
                                "click"(e) {
                                  if (materialItem.isDeprecated) {
                                    delete materialItem.isDeprecated;
                                  } else {
                                    materialItem.isDeprecated = true;
                                  }
                                  if (updateMaterialItemFun) {
                                    updateMaterialItemFun();
                                  }
                                }
                              }
                            }
                          ]
                        },
                        {
                          tagName: "div",
                          className: "brand-list-wrapper",
                          childs: () => {
                            if (materialItem.isDeprecated) return [];
                            return [
                              {
                                tagName: "div",
                                className: "brand-list",
                                childs: materialItem.list.map((brandItem) => {
                                  const selectOPtions = objectKeys(brandPriorityMap).map((i) => {
                                    return {
                                      tagName: "option",
                                      attributes: {
                                        value: i
                                      },
                                      innerText: brandPriorityMap[i]
                                    };
                                  });
                                  return {
                                    tagName: "div",
                                    className: `brand-item ${brandItem.newAdd ? "brand-item-newAdd" : ""}`,
                                    childs: [
                                      createUpdateElement(() => {
                                        let updateBrandLabelFun;
                                        return {
                                          tagName: "div",
                                          className: "brand-item-label",
                                          innerHTML: `${brandItem.label}${brandItem.newAdd ? "&nbsp;\u270D\u{1F3FB}" : ""}`,
                                          returnUpdateFun(_updateFun) {
                                            updateBrandLabelFun = _updateFun;
                                          },
                                          events: {
                                            "click"(e) {
                                              if (brandItem.newAdd) {
                                                let newV;
                                                showMessage("\u54C1\u724C\u540D\u79F0\u662F\u4EC0\u4E48", {
                                                  input: {
                                                    default: "",
                                                    validate(v) {
                                                      newV = v.toString().trim();
                                                      if (!newV) {
                                                        return "\u4E0D\u80FD\u4E3A\u7A7A";
                                                      } else if (newV.length > 10) {
                                                        return "\u540D\u79F0\u8FC7\u957F";
                                                      } else if (materialItem.list.map((i) => i.label).includes(newV)) {
                                                        return "\u548C\u5DF2\u6709\u54C1\u724C\u540D\u79F0\u91CD\u590D";
                                                      }
                                                      return "";
                                                    }
                                                  }
                                                }).then((res) => {
                                                  if (res === "\u786E\u5B9A") {
                                                    brandItem.label = newV;
                                                    updateBrandLabelFun();
                                                  }
                                                });
                                              }
                                            }
                                          }
                                        };
                                      }),
                                      createUpdateElement(() => {
                                        const specsText = getSpecsText(brandItem.specs);
                                        let updateSpecsTextFun;
                                        return {
                                          tagName: "div",
                                          className: "brand-item-specs-text",
                                          innerHTML: `${specsText}${brandItem.newAdd ? "&nbsp;\u270D\u{1F3FB}" : ""}`,
                                          returnUpdateFun(updateFun) {
                                            updateSpecsTextFun = updateFun;
                                          },
                                          events: {
                                            "click"(e) {
                                              if (brandItem.newAdd) {
                                                let newSpecs = [];
                                                showMessage("\u4FEE\u6539\u89C4\u683C", {
                                                  input: {
                                                    default: specsText !== "-" ? specsText : "",
                                                    validate(v) {
                                                      if (!v.trim()) {
                                                        return "\u89C4\u683C\u4E0D\u80FD\u4E3A\u7A7A";
                                                      }
                                                      const _newSpecs = v.toString().trim().split("*").map((i) => i.trim()).filter(Boolean);
                                                      newSpecs = new Array(_newSpecs.length).fill("").map((i) => ({
                                                        unit: "",
                                                        spec: 0
                                                      }));
                                                      if (!newSpecs.length) {
                                                        return "\u4E0D\u80FD\u8F6C\u6362\u4E3A\u6709\u6548\u89C4\u683C";
                                                      }
                                                      let errorMsg = "";
                                                      _newSpecs.some((str, index) => {
                                                        const regex = /^(\d+)(.*)$/;
                                                        const match = str.trim().match(regex);
                                                        if (!match) {
                                                          errorMsg = "\u683C\u5F0F\u4E0D\u6B63\u786E";
                                                          return true;
                                                        }
                                                        if (!match[2].trim()) {
                                                          errorMsg = "\u5355\u4F4D\u4E0D\u80FD\u4E3A\u7A7A";
                                                          return true;
                                                        }
                                                        if (index > 0) {
                                                          newSpecs[index - 1].spec = Number(match[1]);
                                                        }
                                                        if (index === _newSpecs.length - 1) {
                                                          newSpecs[index].spec = 1;
                                                        }
                                                        newSpecs[index].unit = match[2].trim();
                                                      });
                                                      return errorMsg;
                                                    }
                                                  }
                                                }).then((res) => {
                                                  if (res === "\u786E\u5B9A") {
                                                    brandItem.specs = newSpecs;
                                                    updateSpecsTextFun();
                                                  }
                                                });
                                              }
                                            }
                                          }
                                        };
                                      }),
                                      {
                                        tagName: "select",
                                        className: "brand-item-priority",
                                        attributes: {
                                          placeholder: "\u9009\u62E9\u51FA\u5E93\u4F18\u5148\u7EA7",
                                          value: ""
                                        },
                                        childs: [
                                          {
                                            tagName: "option",
                                            attributes: {
                                              value: ""
                                            },
                                            innerText: "\u8BF7\u9009\u62E9\u51FA\u5E93\u4F18\u5148\u7EA7"
                                          },
                                          ...selectOPtions
                                        ]
                                      },
                                      createUpdateElement(() => {
                                        let updateFun;
                                        return {
                                          tagName: "div",
                                          className: `brand-item-isDeprecated ${brandItem.isDeprecated === true ? "brand-item-isDeprecated-true" : ""} `,
                                          innerText: brandItem.isDeprecated === true ? "\u6FC0\u6D3B" : "\u5E9F\u5F03",
                                          returnUpdateFun(_updateFun) {
                                            updateFun = _updateFun;
                                          },
                                          events: {
                                            "click"(e) {
                                              if (brandItem.isDeprecated) {
                                                delete brandItem.isDeprecated;
                                              } else {
                                                brandItem.isDeprecated = true;
                                              }
                                              if (updateFun) {
                                                updateFun();
                                              }
                                            }
                                          }
                                        };
                                      })
                                    ]
                                  };
                                })
                              }
                            ];
                          }
                        },
                        {
                          tagName: "div",
                          className: "material-item-form",
                          childs: () => {
                            if (materialItem.isDeprecated) return [];
                            return [
                              {
                                tagName: "div",
                                className: "material-item-inputs",
                                childs: [
                                  {
                                    tagName: "div",
                                    className: "material-item-input-wrapper",
                                    childs: [
                                      {
                                        tagName: "span",
                                        className: "material-item-input-label",
                                        innerText: "\u65E5\u8017"
                                      },
                                      {
                                        tagName: "input",
                                        attributes: {
                                          value: materialItem.baseAverageDayUse + "",
                                          type: "number",
                                          placeholder: "\u65E5\u8017\u57FA\u51C6",
                                          "data-label": "\u65E5\u8017"
                                        },
                                        events: {
                                          "input"(e) {
                                            const eleTarget = e.target;
                                            const v = eleTarget.value;
                                            if (!v.trim()) {
                                              eleTarget.value = "";
                                              return;
                                            }
                                            let numberV = Number(v);
                                            if (!isNaN(numberV)) {
                                              eleTarget.value = numberV + "";
                                              materialItem.baseAverageDayUse = numberV;
                                            } else {
                                              eleTarget.value = "";
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  },
                                  {
                                    tagName: "div",
                                    className: "material-item-input-wrapper",
                                    childs: [
                                      {
                                        tagName: "span",
                                        className: "material-item-input-label",
                                        innerText: "min"
                                      },
                                      {
                                        tagName: "input",
                                        className: "material-item-input",
                                        attributes: {
                                          value: materialItem.uasge.min + "",
                                          type: "number",
                                          placeholder: "\u6700\u5C0F\u51FA\u5E93\u91CF",
                                          "data-label": "min"
                                        },
                                        events: {
                                          "input"(e) {
                                            const eleTarget = e.target;
                                            const v = eleTarget.value;
                                            if (!v.trim()) {
                                              eleTarget.value = "";
                                              return;
                                            }
                                            let numberV = Number(v);
                                            if (!isNaN(numberV)) {
                                              eleTarget.value = numberV + "";
                                              materialItem.uasge.min = numberV;
                                            } else {
                                              eleTarget.value = "";
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  },
                                  {
                                    tagName: "div",
                                    className: "material-item-input-wrapper",
                                    childs: [
                                      {
                                        tagName: "span",
                                        className: "material-item-input-label",
                                        innerText: "max"
                                      },
                                      {
                                        tagName: "input",
                                        className: "material-item-input",
                                        attributes: {
                                          value: materialItem.uasge.max + "",
                                          type: "number",
                                          placeholder: "\u6700\u5927\u51FA\u5E93\u91CF",
                                          "data-label": "max"
                                        },
                                        events: {
                                          "input"(e) {
                                            const eleTarget = e.target;
                                            const v = eleTarget.value;
                                            if (!v.trim()) {
                                              eleTarget.value = "";
                                              return;
                                            }
                                            let numberV = Number(v);
                                            if (!isNaN(numberV)) {
                                              eleTarget.value = numberV + "";
                                              materialItem.uasge.max = numberV;
                                            } else {
                                              eleTarget.value = "";
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                ]
                              },
                              {
                                tagName: "div",
                                className: "material-item-btns",
                                childs: [
                                  {
                                    tagName: "span",
                                    className: "material-item-btn",
                                    innerText: "\u65B0\u589E\u54C1\u724C",
                                    events: {
                                      "click"(e) {
                                        materialItem.list.push(getEmptyBrandItem());
                                        updateMaterialItemFun();
                                      }
                                    }
                                  }
                                ]
                              }
                            ];
                          }
                        }
                      ]
                    };
                  }, ele);
                });
                if (isAddMaterial) {
                  allFinishPromise.then((res) => {
                    console.log("finish");
                    const allItems = ele.querySelectorAll(".material-item");
                    const lastItem = Array.from(allItems).slice(-1)[0];
                    if (lastItem) {
                      lastItem.scrollIntoView({
                        behavior: "smooth"
                      });
                    }
                  });
                }
              }
            },
            {
              tagName: "div",
              className: "materials-submit",
              childs: [
                {
                  tagName: "div",
                  className: "materials-submit-item",
                  innerText: "\u65B0\u589E\u7269\u6599",
                  events: {
                    "click"(e) {
                      const newBrandItem = getEmptyBrandItem();
                      const newMaterialItem = getEmptyMaterialItem();
                      newMaterialItem.list.push(newBrandItem);
                      materialFormList.push(newMaterialItem);
                      createForm(true);
                    }
                  }
                },
                {
                  tagName: "div",
                  className: "materials-submit-item",
                  innerText: "\u66F4\u65B0",
                  events: {
                    "click"(e) {
                      const saveList = [];
                      materialFormList.forEach((materialItem) => {
                        const newMaterialItem = JSON.parse(JSON.stringify(materialItem));
                        delete newMaterialItem.newAdd;
                        newMaterialItem.list.forEach((brandItem) => {
                          delete brandItem.newAdd;
                        });
                        saveList.push(newMaterialItem);
                      });
                      const saveMsg = setMaterialList(saveList);
                      if (saveMsg) {
                        showMessage(saveMsg);
                      } else {
                        showMessage("\u66F4\u65B0\u6210\u529F").then((res) => {
                          createForm();
                        });
                      }
                    }
                  }
                },
                {
                  tagName: "div",
                  className: "materials-submit-item",
                  innerText: "\u91CD\u7F6E",
                  events: {
                    "click"(e) {
                      materialFormList.splice(0, materialFormList.length, ...getMaterialList());
                      createForm();
                    }
                  }
                }
              ]
            }
          ]
        }, shadowRoot);
      }
      stylePromise.then((res) => createForm());
    }
  };

  // components/my-charts/index.ts
  var myCharts = {
    tagName: "my-charts",
    createNode(shadowRoot, options, stylePromise) {
      const { status } = options;
      const loadScriptPromise = oneByone(["https://cdn.jsdelivr.net/npm/chart.js", "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"], addScriptToGlobal);
      let currentSelectChartType;
      let currentSelectMaterialItemLabel;
      let currentHeadSelectNum = 2;
      let selectAttachNum = 0;
      function createSelect() {
        return [
          {
            tagName: "span",
            className: "select-label",
            innerText: "\u8BF7\u9009\u62E9"
          },
          {
            tagName: "select",
            className: "chart-select",
            attributes: {
              placeholder: "\u8BF7\u9009\u62E9\u56FE\u8868\u7C7B\u578B",
              value: status?.defaultType || ""
            },
            childs: [
              {
                tagName: "option",
                attributes: {
                  value: ""
                },
                innerText: "\u8BF7\u9009\u62E9\u56FE\u8868\u7C7B\u578B"
              },
              ...chartShowTypes.map((typeItem) => {
                return {
                  tagName: "option",
                  attributes: {
                    value: typeItem.label
                  },
                  innerText: typeItem.label
                };
              })
            ],
            events: {
              change(e) {
                if (!e.target) return;
                const v = e.target.value;
                currentSelectChartType = v;
                updateChartContent();
              }
            },
            attachedQueryNode: shadowRoot,
            returnAttachedNode(e) {
              loadScriptPromise.then((res) => {
                e.value = status?.defaultType || "";
                const v = e.value;
                currentSelectChartType = v;
                selectAttachNum += 1;
                setTimeout(() => {
                  updateChartContent();
                }, 100);
              });
            }
          },
          {
            tagName: "select",
            className: "chart-select",
            attributes: {
              placeholder: "\u8BF7\u9009\u62E9\u7269\u6599",
              value: status?.defaultLabel || ""
            },
            childs: [
              {
                tagName: "option",
                attributes: {
                  value: ""
                },
                innerText: "\u8BF7\u9009\u62E9\u7269\u6599"
              },
              ...getMaterialList().map((materialItem) => {
                return {
                  tagName: "option",
                  attributes: {
                    value: materialItem.label
                  },
                  innerText: materialItem.label.slice(0, 5)
                };
              })
            ],
            events: {
              change(e) {
                if (!e.target) return;
                const v = e.target.value;
                currentSelectMaterialItemLabel = v;
                updateChartContent();
              }
            },
            attachedQueryNode: shadowRoot,
            returnAttachedNode(e) {
              loadScriptPromise.then((res) => {
                e.value = status?.defaultLabel || "";
                const v = e.value;
                currentSelectMaterialItemLabel = v;
                selectAttachNum += 1;
                setTimeout(() => {
                  updateChartContent();
                }, 100);
              });
            }
          }
        ];
      }
      function updateChartContent() {
        if (selectAttachNum < currentHeadSelectNum) return;
        saveHtmlActionStatus({
          defaultType: currentSelectChartType,
          defaultLabel: currentSelectMaterialItemLabel
        });
        const node = shadowRoot.querySelector(".chart-content");
        removeChilds(node);
        if (!currentSelectChartType) {
          return;
        }
        if (!Chart) return;
        let selectLabels = [];
        if (!currentSelectMaterialItemLabel) {
          selectLabels = getMaterialList().map((materialItem) => materialItem.label);
        } else {
          selectLabels = [currentSelectMaterialItemLabel];
        }
        selectLabels.forEach((_selectLabel, index) => {
          const chartDataItem = getChartDataItem(currentSelectChartType, _selectLabel);
          const currentLabelConfigItem = chartShowTypes.find((i) => i.label === currentSelectChartType);
          let footerNodes = [];
          if (currentLabelConfigItem) {
            footerNodes = currentLabelConfigItem.getCanvasFooterNodes(chartDataItem.chartMaterialItems);
          }
          createChildsElement([
            {
              tagName: "div",
              className: "canvas-item",
              childs: [
                {
                  tagName: "div",
                  className: "material-item-label",
                  childs: [
                    {
                      tagName: "span",
                      innerText: _selectLabel
                    },
                    {
                      tagName: "span",
                      className: "specs",
                      innerText: `${chartDataItem.chartMaterialItems[0].list.map((i) => i.specsText)}`
                    }
                  ]
                },
                {
                  tagName: "div",
                  className: "canvas-wrapper",
                  style: {
                    width: "100%",
                    height: "380px"
                  },
                  childs: () => {
                    let currentChart;
                    return [
                      {
                        tagName: "canvas",
                        style: {
                          width: "100%",
                          height: "380px"
                        },
                        attachedQueryNode: node,
                        returnAttachedNode(e) {
                          if (e && e.parentNode) {
                            const canvasRenderingContext2D = e.getContext("2d");
                            if (!canvasRenderingContext2D) return;
                            currentChart = new Chart(canvasRenderingContext2D, {
                              type: "line",
                              data: {
                                labels: chartDataItem.labels,
                                datasets: chartDataItem.datasets.map((i) => ({
                                  label: i.label,
                                  data: i.data
                                }))
                              },
                              options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                // 否则高度不生效
                                plugins: {
                                  datalabels: {
                                    clamp: true,
                                    verflow: false,
                                    align: "start",
                                    offset: function(context) {
                                      const yMax = context.chart.scales.y.max;
                                      const canvasHeight = context.chart.height;
                                      const currentDataIndex = context.dataIndex;
                                      const currentDatasetIndex = context.datasetIndex;
                                      const currentValue = context.dataset.data[currentDataIndex];
                                      if (typeof currentValue !== "number") return;
                                      const othersValue = context.chart.data.datasets.map((i, index2) => {
                                        return {
                                          datasetIndex: index2,
                                          value: i.data[currentDataIndex]
                                        };
                                      }).filter((i) => i.datasetIndex !== currentDatasetIndex);
                                      let offset = 0;
                                      othersValue.forEach((i) => {
                                        if (typeof i.value !== "number") return;
                                        if (Math.abs(i.value - currentValue) < yMax / 10) {
                                          if (currentValue > i.value) {
                                            offset = -canvasHeight / 30;
                                          } else if (currentValue < i.value) {
                                            offset = canvasHeight / 30;
                                          } else {
                                            if (currentDatasetIndex < i.datasetIndex) {
                                              offset = -canvasHeight / 30;
                                            } else {
                                              offset = canvasHeight / 30;
                                            }
                                          }
                                        }
                                      });
                                      return offset;
                                    },
                                    // formatter: function(value:any) {
                                    //     console.log(value)
                                    //     return value > 0 ? value : ''; // 只有当值大于0时才显示标签
                                    // },
                                    color: "#fff",
                                    // 文字颜色，白色
                                    backgroundColor: function(context) {
                                      return context.dataset.backgroundColor;
                                    },
                                    font: {
                                      size: 12
                                    }
                                  }
                                }
                              },
                              plugins: []
                            });
                          }
                        },
                        events: {
                          "click"(e) {
                            const { clientX, clientY } = e;
                            const canvasNode = e.target;
                            const rect = canvasNode.getBoundingClientRect();
                            const relativeCanvasX = clientX - rect.left;
                            const relativeCanvasY = clientY - rect.top;
                            if (!currentChart) return;
                            function allowXLabelClick() {
                              const xHeight = currentChart.scales.x.height;
                              if (relativeCanvasY > rect.height - xHeight) {
                                const xIndex = currentChart.scales.x.getValueForPixel(relativeCanvasX);
                                const xLabel = currentChart.scales.x.getLabelForValue(xIndex);
                                let currentSelectBelongField;
                                showMessage("\u9009\u62E9\u4FEE\u6539\u7684\u5F52\u5C5E", {
                                  select: {
                                    list: recordRecordBelong.map((i) => {
                                      return {
                                        label: i.label,
                                        value: i.field
                                      };
                                    }),
                                    onChange(v) {
                                      currentSelectBelongField = v;
                                    }
                                  }
                                }).then((res) => {
                                  if (res === "\u786E\u5B9A") {
                                    updateHtmlAction("\u4FEE\u6539", {
                                      defaultDate: xLabel,
                                      selectMaterialItem: {
                                        belongField: currentSelectBelongField || currentLabelConfigItem?.navigateBelongField,
                                        label: chartDataItem.materialItemLabel
                                      }
                                    });
                                  }
                                });
                              }
                            }
                            function allowDatalabelsAreaClick(cb) {
                              const datasets = currentChart.data.datasets;
                              datasets.forEach((_, datasetIndex) => {
                                const datasetItemMeta = currentChart.getDatasetMeta(datasetIndex);
                                if (datasetItemMeta) {
                                  const pointElements = datasetItemMeta.data;
                                  pointElements.forEach((pointItem, pointIndex) => {
                                    if (pointItem.$datalabels) {
                                      pointItem.$datalabels.forEach((dataLabelItem) => {
                                        if (dataLabelItem.$layout) {
                                          const area = dataLabelItem.$layout?._box?._rect;
                                          if (area) {
                                            const { x, y, w, h } = area;
                                            if (relativeCanvasX > x && relativeCanvasX < x + w && relativeCanvasY > y && relativeCanvasY < y + h) {
                                              cb(datasetIndex, pointIndex);
                                              throw new Error("\u8DF3\u51FA");
                                            }
                                          }
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                              allowXLabelClick();
                            }
                            try {
                              allowDatalabelsAreaClick((datasetIndex, pointIndex) => {
                                const xLabel = currentChart.scales.x.getLabelForValue(pointIndex);
                                const pointField = chartDataItem.datasets[datasetIndex].field;
                                let navigateBelongField;
                                const matchItem = recordRecordBelong.find((i) => `${i.field}Num` === pointField);
                                if (matchItem) {
                                  navigateBelongField = matchItem.field;
                                } else {
                                  navigateBelongField = "repo";
                                }
                                showMessage("\u8FDB\u5165\u4FEE\u6539?", {
                                  confirm: true,
                                  cancel: true
                                }).then((res) => {
                                  if (res === "\u786E\u5B9A") {
                                    updateHtmlAction("\u4FEE\u6539", {
                                      defaultDate: xLabel,
                                      selectMaterialItem: {
                                        belongField: navigateBelongField,
                                        label: chartDataItem.materialItemLabel
                                      }
                                    });
                                  }
                                });
                              });
                            } catch (err) {
                            }
                          }
                        }
                      }
                    ];
                  }
                },
                {
                  tagName: "div",
                  className: "canvas-footer-wrapper",
                  childs: footerNodes
                }
              ]
            }
          ], node);
        });
      }
      function createChart() {
        createElement({
          tagName: "div",
          className: "chart-wrapper",
          childs: [
            // 头部
            {
              tagName: "div",
              className: "chart-head-wrapper",
              // 解决strick吸附测漏问题
              childs: [{
                tagName: "div",
                className: "chart-select-wrapper",
                childs: createSelect()
              }]
            },
            // 内容
            {
              tagName: "div",
              className: "chart-content",
              childs: []
            }
          ]
        }, shadowRoot);
      }
      createChart();
    }
  };

  // components/my-others/index.ts
  var myOthers = {
    tagName: "my-others",
    createNode(shadowRoot, options, stylePromise) {
      const blockList = [
        [
          "\u6570\u636E",
          (parentUpdateFun) => {
            return [
              {
                tagName: "div",
                innerText: "\u5BFC\u5165\u6570\u636E",
                events: {
                  "click"(e) {
                    console.log("\u5BFC\u5165\u6570\u636E");
                    parentUpdateFun();
                  }
                }
              },
              {
                tagName: "div",
                innerText: "\u5BFC\u51FA\u6570\u636E",
                events: {
                  "click"(e) {
                    console.log("\u5BFC\u5165\u6570\u636E");
                    parentUpdateFun();
                  }
                }
              }
            ];
          }
        ],
        [
          "\u7F13\u5B58",
          (parentUpdateFun) => {
            const cacheKeys = Object.keys(localStorage);
            console.log("update");
            return cacheKeys.map((key) => {
              return {
                tagName: "div",
                innerText: key,
                events: {
                  "click"(e) {
                    let newV = "";
                    showMessage("\u7F16\u8F91\u7F13\u5B58", {
                      textarea: {
                        default: localStorage.getItem(key) || "",
                        validate(v) {
                          newV = v;
                        }
                      }
                    }).then((res) => {
                      if (res === "\u53D6\u6D88") return;
                      if (newV !== "") {
                        localStorage.setItem(key, newV);
                      } else {
                        localStorage.removeItem(key);
                      }
                      parentUpdateFun();
                    });
                  }
                }
              };
            });
          }
        ]
      ];
      createElement({
        tagName: "div",
        className: "wrapper",
        childs: blockList.map(([label, blockFun]) => {
          return {
            tagName: "div",
            className: "block-wrapper",
            childs: [
              {
                tagName: "div",
                className: "block-title",
                innerText: label
              },
              createUpdateElement(() => {
                return {
                  tagName: "div",
                  className: "block-body",
                  returnUpdateFun(updateFun, ele) {
                    createChildsElement(blockFun(updateFun), ele);
                  }
                };
              })
            ]
          };
        })
      }, shadowRoot);
    }
  };

  // components/index.ts
  var components_default = [
    myInputs,
    myMessage,
    myForm,
    myActions,
    myMaterials,
    myCharts,
    myOthers
  ];

  // main/index.ts
  components_default.forEach((customComponentsItem) => {
    initCustomElement(customComponentsItem);
  });
  createCustomElement("my-actions", {}, document.body);
  function isMountedToDocument(ele) {
    if (!ele) {
      return false;
    }
    function getParentNode(_ele) {
      if (!_ele) {
        return void 0;
      } else if (_ele instanceof ShadowRoot) {
        return _ele.host;
      } else if (_ele.parentNode) {
        return _ele.parentNode;
      } else {
        return void 0;
      }
    }
    let parentNode = ele;
    let isMounted = false;
    while (parentNode) {
      parentNode = getParentNode(parentNode);
      if (parentNode?.nodeType === document.nodeType) {
        isMounted = true;
      }
    }
    return isMounted;
  }
  isMountedToDocument(document.body);
})();
