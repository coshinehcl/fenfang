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
  function isMountedToDocument(ele) {
    if (!ele) {
      return false;
    }
    function getParentNode(_ele) {
      if (!_ele) {
        return void 0;
      } else if (_ele instanceof ShadowRoot) {
        return _ele.host.parentNode ?? void 0;
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
  function waitEleDuration(ele, className, isAdd) {
    if (!ele || ele === null) {
      return Promise.resolve();
    }
    const style = window.getComputedStyle(ele);
    let durationTimeStr = "";
    if (style.animationDuration.includes("s")) {
      durationTimeStr = style.transitionDuration;
    } else {
      durationTimeStr = style.animationDuration;
    }
    const durationTimeStrLit = durationTimeStr.split(",");
    const durationTimeList = [];
    durationTimeStrLit.forEach((i) => {
      if (i.includes("ms")) {
        durationTimeList.push(parseFloat(durationTimeStr));
      } else {
        durationTimeList.push(parseFloat(durationTimeStr) * 1e3);
      }
    });
    const durationTime = Math.max(...durationTimeList);
    return new Promise((resolve) => {
      if (isAdd) {
        ele.classList.add(className);
      } else {
        ele.classList.remove(className);
      }
      setTimeout(() => {
        resolve();
      }, durationTime);
    });
  }
  function cancelableTasks(controller, tasks) {
    return new Promise(async (resolve, reject) => {
      if (controller.signal.aborted) {
        reject(new Error("\u4EFB\u52A1\u5DF2\u53D6\u6D88"));
        return;
      }
      const abortListener = () => {
        reject(new Error("\u4EFB\u52A1\u88AB\u4E2D\u6B62"));
      };
      controller.signal.addEventListener("abort", abortListener);
      let lastIsResolve = true;
      let lastResolveValue = void 0;
      let lastRejectValue = void 0;
      for (const taskItem of tasks) {
        try {
          if (controller.signal.aborted) {
            break;
          }
          lastResolveValue = await taskItem(lastIsResolve, lastResolveValue, lastRejectValue);
          lastIsResolve = true;
          lastRejectValue = void 0;
        } catch (err) {
          lastResolveValue = void 0;
          lastIsResolve = false;
          lastRejectValue = err;
        }
      }
      controller.signal.removeEventListener("abort", abortListener);
      if (controller.signal.aborted) return;
      if (lastIsResolve) {
        resolve(lastResolveValue);
      } else {
        reject(lastRejectValue);
      }
    });
  }
  var MoreTimeExecute = class {
    constructor() {
    }
    async execute(tasks) {
      if (this.pendingPromise) {
        this.controller.abort();
        try {
          await this.pendingPromise;
        } catch (err) {
        }
      }
      this.controller = new AbortController();
      this.pendingPromise = cancelableTasks(this.controller, tasks);
      return this.pendingPromise.finally(() => {
        this.pendingPromise = void 0;
      });
    }
  };
  function sleep(duration) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }
  function getJson(name) {
    return new Promise((resolve, reject) => {
      const url = `../dist/${name}.json`;
      fetch(url).then((response) => {
        if (!response.ok) {
          reject(new Error(`HTTP error! status: ${response.status}`));
        }
        resolve(response.json());
      });
    });
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
  function addObserve(obj, field, fun) {
    let _innerV = obj[field];
    let isFirstset = true;
    Object.defineProperty(obj, field, {
      set(v) {
        if (isFirstset) {
          _innerV = v;
          fun(v);
        } else if (v !== _innerV) {
          _innerV = v;
          fun(v);
        }
        isFirstset = false;
      },
      get() {
        return _innerV;
      }
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
  var getDayDistance = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const leftDate = new Date(date1).getTime();
    const rightDate = new Date(date2).getTime();
    const millisecondsDiff = leftDate - rightDate;
    const daysDiff = Math.round(millisecondsDiff / (1e3 * 60 * 60 * 24));
    return daysDiff;
  };
  function debounce(func, delay, immediate = false) {
    let timer = null;
    return function(...args) {
      const context = this;
      if (timer) clearTimeout(timer);
      if (immediate && !timer) {
        func.apply(context, args);
      }
      timer = setTimeout(() => {
        timer = null;
        if (!immediate) {
          func.apply(context, args);
        }
      }, delay);
    };
  }
  function exponentialMovingAverage(data, period) {
    const alpha = 0.3;
    const smaList = [];
    for (let i = 0; i < period; i++) {
      if (i === 0) {
        smaList.push(data[i]);
        continue;
      }
      let lastV = smaList[i - 1];
      smaList.push(lastV + (data[i] - lastV) * alpha);
    }
    if (data.length > period) {
      for (let i = period; i < data.length; i++) {
        const currentValue = data[i];
        const previousEMA = smaList[smaList.length - 1];
        const currentEMA = (currentValue - previousEMA) * alpha + previousEMA;
        smaList.push(currentEMA);
      }
    }
    return smaList;
  }
  async function oneByone(list, processFun) {
    for (let i = 0; i < list.length; i++) {
      await processFun(list[i]);
    }
  }

  // utils/tsHelper.ts
  function cloneData(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => cloneData(item));
    }
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = cloneData(obj[key]);
      }
    }
    return clonedObj;
  }
  function objectKeys(obj) {
    return Object.keys(obj);
  }
  function arrayFilterNull(arr) {
    return arr.filter((i) => i !== void 0 && i !== null);
  }
  function GetPromiseAndParams() {
    let resolve;
    let reject;
    const p = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    return [p, resolve, reject];
  }
  function objectPick(obj, keys) {
    const newObj = {};
    keys.forEach((i) => {
      newObj[i] = obj[i];
    });
    return newObj;
  }
  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // utils/element.ts
  var appendChildElements = (parentNode, childs) => {
    const usefulChilds = arrayFilterNull(childs);
    if (parentNode) {
      usefulChilds.forEach((childNode) => {
        parentNode.appendChild(childNode);
      });
    }
    return usefulChilds;
  };
  var createElement = (config, parentNode) => {
    const { tagName, show = true, hooks, childs, ...attrs } = config;
    if (!tagName) return;
    let isShow = typeof show === "function" ? show() : show;
    if (!isShow) return;
    const elementNode = document.createElement(tagName);
    objectKeys(attrs).forEach((attrKey) => {
      if (attrKey === "innerHTML" || attrKey === "innerText" || attrKey === "className") {
        elementNode[attrKey] = attrs[attrKey] ?? "";
      } else if (attrKey === "style") {
        const arrrValue = attrs[attrKey] || {};
        objectKeys(arrrValue).forEach((i) => {
          if (arrrValue[i] !== void 0) {
            elementNode.style.setProperty(i.replace(/([A-Z])/g, "-$1").toLowerCase(), arrrValue[i] || "");
          }
        });
      } else if (attrKey === "attributes") {
        const arrrValue = attrs[attrKey] || {};
        objectKeys(arrrValue).forEach((i) => {
          if (arrrValue[i] !== void 0) {
            elementNode.setAttribute(i, arrrValue[i]);
          }
        });
      } else if (attrKey === "events") {
        const arrrValue = attrs[attrKey] || {};
        objectKeys(arrrValue).forEach((i) => {
          if (i && typeof arrrValue[i] === "function") {
            elementNode.addEventListener(i, arrrValue[i]);
          }
        });
      }
    });
    if (childs) {
      if (typeof childs === "function") {
        appendChildElements(elementNode, childs());
      } else {
        appendChildElements(elementNode, childs);
      }
    }
    if (hooks && hooks.onCreated && typeof hooks.onCreated === "function") {
      hooks.onCreated(elementNode);
    }
    if (parentNode) {
      parentNode.appendChild(elementNode);
    }
    if (hooks && hooks.onMounted && typeof hooks.onMounted === "function") {
      waitCondition(() => isMountedToDocument(elementNode)).then(() => {
        if (hooks.onMounted) {
          hooks.onMounted(elementNode);
        }
      });
    }
    return elementNode;
  };
  var createUpdateElement = (getConfig, parentNode) => {
    function updateFun() {
      if (elementNode && elementNode.parentNode) {
        const newElementNode = createUpdateElement(getConfig);
        if (newElementNode) {
          elementNode.parentNode.insertBefore(newElementNode, elementNode);
        }
        elementNode.remove();
        return true;
      } else {
        return false;
      }
    }
    if (!getConfig || typeof getConfig !== "function") return;
    const config = getConfig();
    const { getUpdateFun, events, ...attrs } = config;
    let newEvents = {};
    if (events) {
      objectKeys(events).forEach((eventKey) => {
        if (typeof events[eventKey] === "function") {
          newEvents[eventKey] = (e) => {
            events[eventKey]?.(e, updateFun);
          };
        }
      });
    }
    const elementNode = createElement({ ...attrs, events: newEvents }, parentNode);
    if (!elementNode) return;
    if (getUpdateFun && typeof getUpdateFun === "function") {
      getUpdateFun(updateFun, elementNode);
    }
    return elementNode;
  };
  var removeChilds = (ele) => {
    if (!ele) return;
    if (ele instanceof Element || ele instanceof ShadowRoot) {
      while (ele.firstChild) {
        ele.removeChild(ele.firstChild);
      }
    }
  };

  // utils/components.ts
  var urlCache = {};
  function preloadStyle(name) {
    const url = `../dist/${name}.css`;
    if (url in urlCache) {
      return urlCache[url];
    }
    const ret = new Promise((resolve, reject) => {
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
    urlCache[url] = ret;
    return ret;
  }
  function initComponent(config) {
    if (customElements.get(config.componentName)) return;
    function getComponent() {
      return class myComponent extends HTMLElement {
        constructor() {
          super();
          this._config = config.content();
          ;
          this._shadowRoot = this.attachShadow({ mode: "closed" });
          const injectPromiseList = GetPromiseAndParams();
          this._injectPromise = injectPromiseList[0];
          this._injectPromiseResolve = injectPromiseList[1];
          const exposeMethodsPromiseList = GetPromiseAndParams();
          this._exposeMethodsResolve = exposeMethodsPromiseList[1];
          this.$getExposeMethods = () => exposeMethodsPromiseList[0];
          this._preloadstylePromise = preloadStyle(config.componentName);
        }
        connectedCallback() {
          Promise.all([
            this._preloadstylePromise,
            this._injectPromise
          ]).then((resList) => {
            const [styleStr, injectData] = resList;
            const styles = new CSSStyleSheet();
            styles.replaceSync(styleStr);
            this._shadowRoot.adoptedStyleSheets = [styles];
            const exposeMethods = this._config.onMounted(
              this._shadowRoot,
              ...injectData
            );
            this._exposeMethodsResolve(exposeMethods);
          });
        }
        disconnectedCallback() {
          if (typeof this._config.onDestroy === "function") {
            this._config.onDestroy(this._shadowRoot);
          }
        }
        injectProps(...args) {
          this._injectPromiseResolve(args);
        }
      };
    }
    if (config.reuseComponentNames) {
      config.reuseComponentNames.forEach((reuseName) => {
        customElements.define(reuseName, getComponent());
      });
    }
    customElements.define(config.componentName, getComponent());
  }
  var createComponent = (name, options, status, elementConfig) => {
    const elementNode = document.createElement(name);
    if ("injectProps" in elementNode) {
      elementNode.injectProps(options, status);
    } else {
      console.error(`\u68C0\u67E5${name}\u7EC4\u4EF6\u662F\u5426\u6CE8\u518C`);
    }
    if (elementConfig) {
      if (elementConfig.style) {
        objectKeys(elementConfig.style).forEach((i) => {
          let v = elementConfig.style?.[i];
          if (v !== void 0) {
            elementNode.style.setProperty(i.replace(/([A-Z])/g, "-$1").toLowerCase(), v || "");
          }
        });
      }
      if (elementConfig.attributes) {
        objectKeys(elementConfig.attributes).forEach((i) => {
          let v = elementConfig.attributes?.[i];
          if (v !== void 0) {
            elementNode.setAttribute(i, v);
          }
        });
      }
    }
    return elementNode;
  };
  var createReuseComponent = (name, targetName, options, status, elementConfig) => {
    const elementNode = document.createElement(name);
    if ("injectProps" in elementNode) {
      elementNode.injectProps(options, status);
    } else {
      console.error(`\u68C0\u67E5${name}\u7EC4\u4EF6\u662F\u5426\u6CE8\u518C`);
    }
    if (elementConfig) {
      if (elementConfig.style) {
        objectKeys(elementConfig.style).forEach((i) => {
          let v = elementConfig.style?.[i];
          if (v !== void 0) {
            elementNode.style.setProperty(i.replace(/([A-Z])/g, "-$1").toLowerCase(), v || "");
          }
        });
      }
      if (elementConfig.attributes) {
        objectKeys(elementConfig.attributes).forEach((i) => {
          let v = elementConfig.attributes?.[i];
          if (v !== void 0) {
            elementNode.setAttribute(i, v);
          }
        });
      }
    }
    return elementNode;
  };

  // utils/componentExpose.ts
  function componentUpdateStatus(componentName, status, options, methodName = "updateStatus") {
    let component = document.querySelector(componentName);
    if (!component) {
      component = createComponent(componentName, options || {}, status);
      document.body.appendChild(component);
    }
    return component.$getExposeMethods().then((res) => {
      return res[methodName](status);
    });
  }
  var showMessage = (status) => {
    return componentUpdateStatus("my-message", status, {});
  };
  var showDialog = (status, waitClosed) => {
    let component = document.querySelector("my-dialog");
    if (!component) {
      component = createComponent("my-dialog", {
        zIndex: 10
      }, { display: false });
      document.body.appendChild(component);
    }
    return component.$getExposeMethods().then((res) => {
      return res.showDialog(status, waitClosed);
    });
  };
  var showReuseDialog = (status, waitClosed) => {
    let component = document.querySelector("my-dialog-again");
    if (!component) {
      component = createReuseComponent("my-dialog-again", "my-dialog", {
        zIndex: 20
      }, { display: false });
      document.body.appendChild(component);
    }
    return component.$getExposeMethods().then((res) => {
      return res.showDialog(status, waitClosed);
    });
  };

  // config/materials.ts
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
      usage: {
        min: 0,
        max: SettlementNum
      },
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
      usage: {
        min: 0,
        max: SettlementNum
      },
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
      usage: {
        min: 0,
        max: SettlementNum
      },
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
      usage: {
        min: 0,
        max: SettlementNum * 5
      },
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
      usage: {
        min: 0,
        max: SettlementNum * 2
      },
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
      usage: {
        min: 0,
        max: SettlementNum
      },
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
      usage: {
        min: 0,
        max: SettlementNum * 3
      },
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
      usage: {
        min: 0,
        max: SettlementNum * 2
      },
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
      usage: {
        min: 0,
        max: SettlementNum * 2
      },
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
      usage: {
        min: 0,
        max: SettlementNum * 2
      },
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
      usage: {
        min: 0,
        max: SettlementNum
      },
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
      usage: {
        min: 0,
        max: SettlementNum * 2
      },
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
      usage: {
        min: 0,
        max: SettlementNum * 2
      },
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
      usage: {
        min: 0,
        max: SettlementNum * 2
      },
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
      usage: {
        min: 0,
        max: SettlementNum * 2
      },
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
      usage: {
        min: 0,
        max: SettlementNum
      },
      baseAverageDayUse: 35
    }
  ];
  var brandPriorityMap = {
    "1": "\u4F18\u5148\u4F7F\u7528",
    "2": "\u6B21\u4F18\u5148\u4F7F\u7528",
    "3": "\u6700\u540E\u4F7F\u7528"
  };

  // config/pageHeadBtns.ts
  var pageHeadBtns = [
    {
      label: "\u7269\u6599",
      componentName: "my-materials",
      options: {},
      status: {}
    },
    {
      label: "\u65B0\u589E",
      componentName: "my-record-form",
      options: {
        type: "add"
      },
      status: {
        date: ""
      }
    },
    {
      label: "\u4FEE\u6539",
      componentName: "my-record-form",
      options: {
        type: "edit"
      },
      status: {
        date: ""
      }
    },
    {
      label: "\u56FE\u8868",
      componentName: "my-charts",
      options: {},
      status: {
        type: "",
        label: ""
      }
    },
    {
      label: "\u5176\u4ED6",
      componentName: "my-others",
      options: {},
      status: {}
    }
  ];
  function getDefaultHeadItem() {
    return pageHeadBtns.find((i) => i.label === "\u56FE\u8868");
  }

  // config/recordList.ts
  var recordBelongList = [
    {
      belong: "system",
      shortLabel: "\u7CFB\u7EDF",
      label: "\u7CFB\u7EDF",
      onlyShowLastSpecInput: true
    },
    {
      belong: "purchase",
      shortLabel: "\u91C7\u8D2D",
      label: "\u91C7\u8D2D",
      onlyShowLastSpecInput: false
    },
    {
      belong: "repo",
      shortLabel: "\u5E93\u5B58",
      label: "\u5E93\u5B58",
      onlyShowLastSpecInput: false
    },
    {
      belong: "repoExtra",
      shortLabel: "\u5E93\u989D",
      label: "\u5E93\u5B58\u989D\u5916",
      onlyShowLastSpecInput: false
    }
  ];

  // config/var.ts
  var MaterialsStorageKey = "materials";
  var RecordListStorageKey = "recordList";
  var storageKeys = [MaterialsStorageKey, RecordListStorageKey];

  // config/chart.ts
  var chartDataFields = [
    {
      field: "dayUse",
      label: "\u65E5\u8017",
      default: "-"
    },
    {
      field: "weekUseText",
      label: "\u5468\u8017",
      default: ""
    },
    {
      field: "monthUseText",
      label: "\u6708\u8017",
      default: ""
    },
    {
      field: "averageDayUse",
      label: "\u5747\u8017",
      default: 0
    },
    {
      field: "availableDay",
      label: "\u53EF\u7528",
      default: 0
    },
    {
      field: "outSuggestStrong",
      label: "\u5F3A\u51FA\u5E93",
      default: "-"
    },
    {
      field: "outSuggestStrongText",
      label: "\u5F3A\u51FA\u5E93\u63CF\u8FF0",
      default: ""
    },
    {
      field: "outSuggestRelax",
      label: "\u7F13\u51FA\u5E93",
      default: "-"
    },
    {
      field: "outSuggestRelaxText",
      label: "\u7F13\u51FA\u5E93\u63CF\u8FF0",
      default: ""
    },
    {
      field: "purchaseSuggest",
      label: "\u8D2D\u4E70",
      default: "-"
    },
    {
      field: "purchaseSuggestText",
      label: "\u8D2D\u4E70\u63CF\u8FF0",
      default: ""
    }
  ];
  var chartDataTypeMap = {
    "system_repoFull_Num": {
      field: "system_repoFull_Num",
      label: "[\u7CFB-\u4ED3]\u5DEE\u503C",
      navigateBelongField: "repo",
      getValue(item) {
        return item.computed.systemNum - (item.computed.repoNum + item.computed.repoExtraNum);
      }
    },
    "repoNum": {
      field: "repoNum",
      label: "\u4ED3\u5E93",
      navigateBelongField: "repo",
      getValue(item) {
        return item.computed.repoNum;
      }
    },
    "availableDay": {
      field: "availableDay",
      label: "\u53EF\u7528",
      navigateBelongField: "repo",
      getValue(item) {
        return item.chartData.availableDay;
      }
    },
    "averageDayUse": {
      field: "averageDayUse",
      label: "\u5747\u65E5\u8017",
      navigateBelongField: "repo",
      navigateTo: (item) => ({
        label: "\u7269\u6599",
        status: {
          activeLabel: item.label
        }
      }),
      getValue(item) {
        return item.chartData.averageDayUse;
      }
    },
    "repoExtraNum": {
      field: "repoExtraNum",
      label: "\u4ED3\u989D",
      navigateBelongField: "repoExtra",
      getValue(item) {
        return item.computed.repoExtraNum;
      }
    },
    "repoFullNum": {
      field: "repoFullNum",
      label: "\u603B\u4ED3",
      navigateBelongField: "repo",
      getValue(item) {
        return item.computed.repoExtraNum + item.computed.repoNum;
      }
    },
    "systemNum": {
      field: "systemNum",
      label: "\u7CFB\u7EDF",
      navigateBelongField: "system",
      getValue(item) {
        return item.computed.systemNum;
      }
    },
    "purchaseNum": {
      field: "purchaseNum",
      label: "\u8D2D\u4E70\u4E86",
      navigateBelongField: "purchase",
      getValue(item) {
        return item.computed.purchaseNum;
      }
    },
    "outSuggestRelax": {
      field: "outSuggestRelax",
      label: "\u7F13\u51FA\u5E93",
      navigateBelongField: "repo",
      getValue(item) {
        return item.chartData.outSuggestRelax;
      }
    },
    "outSuggestStrong": {
      field: "outSuggestStrong",
      navigateBelongField: "repo",
      label: "\u5F3A\u51FA\u5E93",
      getValue(item) {
        return item.chartData.outSuggestStrong;
      }
    },
    "purchaseSuggest": {
      field: "purchaseSuggest",
      label: "\u9700\u8981\u91C7\u8D2D",
      navigateBelongField: "repo",
      getValue(item) {
        return item.chartData.purchaseSuggest;
      }
    },
    "dayUse": {
      field: "dayUse",
      label: "\u65E5\u8017",
      navigateBelongField: "repo",
      getValue(item) {
        return item.chartData.dayUse;
      }
    }
  };
  var chartDataTypes = [
    {
      label: "\u4ED3\u5E93\u6570\u91CF",
      fields: [chartDataTypeMap.repoNum, chartDataTypeMap.repoExtraNum, chartDataTypeMap.repoFullNum],
      navigateBelongField: "repo",
      footer: (items) => {
        return items.map((item) => {
          const systemNum = item.computed.systemNum;
          const repoFullNum = item.computed.repoExtraNum + item.computed.repoNum;
          return createElement({
            tagName: "div",
            className: "footer-item",
            childs: [
              createElement({
                tagName: "div",
                className: "date",
                innerText: item.recordDate
              }),
              createElement({
                tagName: "div",
                className: "content",
                innerHTML: `\u7CFB\u7EDF(${systemNum}),\u4ED3\u5E93(${repoFullNum}),\u5DEE\u989D<strong>${systemNum - repoFullNum}</strong>`
              })
            ]
          });
        });
      }
    },
    {
      label: "\u4ED3\u5E93-\u7CFB\u7EDF\u6570\u91CF",
      fields: [chartDataTypeMap.repoFullNum, chartDataTypeMap.systemNum, chartDataTypeMap.system_repoFull_Num],
      navigateBelongField: "repo",
      footer: (items) => {
        return items.map((item) => {
          const systemNum = item.computed.systemNum;
          const repoFullNum = item.computed.repoExtraNum + item.computed.repoNum;
          return createElement({
            tagName: "div",
            className: "footer-item",
            childs: [
              createElement({
                tagName: "div",
                className: "date",
                innerText: item.recordDate
              }),
              createElement({
                tagName: "div",
                className: "content",
                innerHTML: `\u7CFB\u7EDF(${systemNum}),\u4ED3\u5E93(${repoFullNum}),\u5DEE\u989D<strong>${systemNum - repoFullNum}</strong>`
              })
            ]
          });
        });
      }
    },
    {
      label: "\u6D88\u8017\u5BF9\u6BD4",
      fields: [chartDataTypeMap.dayUse, chartDataTypeMap.averageDayUse],
      navigateBelongField: "repo",
      footer: (items) => {
        return items.map((item) => {
          const dayUse = item.chartData.dayUse;
          const averageDayUse = item.chartData.averageDayUse;
          const useDistance = dayUse !== "-" ? getFormatNum(dayUse - averageDayUse) : "-";
          return createElement({
            tagName: "div",
            className: "footer-item",
            childs: [
              createElement({
                tagName: "div",
                className: "date",
                innerText: item.recordDate
              }),
              createElement({
                tagName: "div",
                className: "content",
                innerHTML: `\u65E5\u8017(${dayUse}),\u5747\u8017(${averageDayUse}),\u5DEE\u989D<strong>${useDistance}</strong>`
              })
            ]
          });
        });
      }
    },
    {
      label: "\u51FA\u5E93",
      fields: [chartDataTypeMap.outSuggestRelax, chartDataTypeMap.outSuggestStrong, chartDataTypeMap.averageDayUse],
      navigateBelongField: "repo",
      footer: (items) => {
        return items.map((item) => {
          const systemNum = item.computed.systemNum;
          const dayUse = item.chartData.dayUse;
          const averageDayUse = item.chartData.averageDayUse;
          const repoFullNum = item.computed.repoExtraNum + item.computed.repoNum;
          return createElement({
            tagName: "div",
            className: "footer-item",
            childs: [
              createElement({
                tagName: "div",
                className: "date",
                innerText: item.recordDate
              }),
              createElement({
                tagName: "div",
                className: "content",
                childs: [
                  createElement({
                    tagName: "div",
                    innerHTML: `\u7CFB\u7EDF(${systemNum}),\u4ED3\u5E93(${repoFullNum}),\u65E5\u8017(${dayUse}),\u5747\u8017(${averageDayUse})`
                  }),
                  createElement({
                    tagName: "div",
                    innerHTML: item.chartData.outSuggestStrongText
                  }),
                  createElement({
                    tagName: "div",
                    innerHTML: item.chartData.outSuggestRelaxText
                  })
                ]
              })
            ]
          });
        });
      }
    },
    {
      label: "\u91C7\u8D2D",
      fields: [chartDataTypeMap.purchaseSuggest, chartDataTypeMap.purchaseNum],
      navigateBelongField: "purchase",
      footer: (items) => {
        return items.map((item) => {
          const systemNum = item.computed.systemNum;
          const repoFullNum = item.computed.repoExtraNum + item.computed.repoNum;
          let purchaseNumFormat = "";
          if (item.chartData.purchaseSuggest !== "-" && item.chartData.purchaseSuggest !== 0) {
            purchaseNumFormat = getMaterialValueText(item, item.chartData.purchaseSuggest);
          }
          return createElement({
            tagName: "div",
            className: "footer-item",
            childs: [
              createElement({
                tagName: "div",
                className: "date",
                innerText: item.recordDate
              }),
              createElement({
                tagName: "div",
                className: "content",
                childs: [
                  createElement({
                    tagName: "div",
                    innerHTML: `\u7CFB\u7EDF(${systemNum}),\u4ED3\u5E93(${repoFullNum}),\u53EF\u7528\u5929\u6570${item.chartData.availableDay}`
                  }),
                  createElement({
                    tagName: "div",
                    innerHTML: item.chartData.purchaseSuggestText + (purchaseNumFormat ? `\u5373<strong>${purchaseNumFormat}</strong>` : "")
                  })
                ]
              })
            ]
          });
        });
      }
    }
  ];

  // utils/materials.ts
  function getMaterialList() {
    const cache = localStorage.getItem(MaterialsStorageKey);
    if (cache) {
      try {
        return JSON.parse(cache);
      } catch (err) {
        return cloneData(materialList);
      }
    } else {
      return cloneData(materialList);
    }
  }
  function validatorBrandItem(item, fields, list) {
    let errorMsg = "";
    function validatorBody(field) {
      if (field === "label") {
        if (item.label.length === 0) {
          return "\u54C1\u724C\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A";
        }
        if (item.label.length > 10) {
          return "\u54C1\u724C\u540D\u79F0\u8FC7\u957F";
        }
        if (list && list.filter((_i) => _i !== item).find((_i) => _i.label === item.label)) {
          return "\u54C1\u724C\u540D\u79F0\u91CD\u590D";
        }
      } else if (field === "specs") {
        if (list) {
          const units = list.map((i) => i.specs[i.specs.length - 1].unit);
          if (Array.from(new Set(units)).length > 1) {
            return "\u54C1\u724C\u6700\u540E\u89C4\u683C\u5355\u4F4D\u4E0D\u4E00\u81F4";
          }
        }
        let _errMsg = "";
        item.specs.some((i) => {
          if (i.unit.length < 0) {
            _errMsg = "\u89C4\u683C\u5355\u4F4D\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A";
            return true;
          } else if (i.unit.length > 4) {
            _errMsg = "\u89C4\u683C\u5355\u4F4D\u540D\u79F0\u8FC7\u957F";
            return true;
          } else if (typeof i.spec !== "number") {
            _errMsg = "\u89C4\u683C\u6570\u91CF\u9700\u8981\u4E3A\u6570\u5B57";
            return true;
          } else if (i.spec < 0) {
            _errMsg = "\u89C4\u683C\u6570\u91CF\u9700\u8981\u4E3A\u6B63\u6570";
            return true;
          }
        });
        return _errMsg;
      }
    }
    fields.some((field) => {
      errorMsg = validatorBody(field);
      return errorMsg ? true : false;
    });
    return errorMsg || "";
  }
  function validatorMaterialItem(item, fields, list) {
    function validatorBody(field) {
      if (field === "baseAverageDayUse") {
        if (typeof item.baseAverageDayUse !== "number") {
          return "baseAverageDayUse\u9700\u8981\u4E3A\u6570\u5B57";
        }
        if (item.baseAverageDayUse < 0) {
          return "baseAverageDayUse\u4E0D\u80FD\u4E3A\u8D1F\u6570";
        }
        return;
      }
      if (field === "label") {
        if (item.label.length === 0) {
          return "\u7269\u6599\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A";
        }
        if (item.label.length > 10) {
          return "\u7269\u6599\u540D\u79F0\u957F\u5EA6\u8FC7\u957F";
        }
        if (list && list.filter((i) => i !== item).find((i) => i.label === item.label)) {
          return `\u7269\u6599\u540D\u79F0\u91CD\u590D`;
        }
        return;
      }
      if (field === "list") {
        if (item.list.length === 0) {
          return "\u54C1\u724C\u5217\u8868\u4E0D\u80FD\u4E3A\u7A7A";
        }
        let errMsg = "";
        item.list.some((i) => {
          errMsg = validatorBrandItem(i, ["label", "specs"], item.list);
          if (errMsg) {
            return true;
          }
        });
        if (errMsg) {
          return errMsg;
        }
        return;
      }
      if (field === "usage") {
        if (typeof item.usage.max !== "number") {
          return "\u7269\u6599\u6700\u5927\u51FA\u5E93\u503C\u9700\u8981\u4E3A\u6570\u5B57";
        }
        if (typeof item.usage.min !== "number") {
          return "\u7269\u6599\u6700\u5C0F\u51FA\u5E93\u503C\u9700\u8981\u4E3A\u6570\u5B57";
        }
        if (item.usage.max < item.usage.min) {
          return "\u7269\u6599\u6700\u5927\u51FA\u5E93\u503C\u9700\u4E0D\u80FD\u5C0F\u4E8E\u6700\u5C0F\u51FA\u5E93\u503C";
        }
      }
    }
    let errorMsg = "";
    fields.some((field) => {
      errorMsg = validatorBody(field);
      return errorMsg ? true : false;
    });
    return errorMsg || "";
  }
  function setMaterials(list) {
    let errorMsg = "";
    let errorItemIndex = 0;
    list.some((item, index) => {
      errorItemIndex = index;
      errorMsg = validatorMaterialItem(item, ["label", "list", "usage", "baseAverageDayUse"], list);
      return errorMsg ? true : false;
    });
    if (errorMsg) {
      return [errorMsg, errorItemIndex];
    }
    const newList = cloneData(list);
    newList.forEach((materialItem) => {
      if ("isNewAdd" in materialItem) {
        delete materialItem.isNewAdd;
      }
      materialItem.list.forEach((brandItem) => {
        if ("isNewAdd" in brandItem) {
          delete brandItem.isNewAdd;
        }
      });
      materialItem.baseAverageDayUse = getFormatNum(materialItem.baseAverageDayUse);
    });
    localStorage.setItem(MaterialsStorageKey, JSON.stringify(newList));
  }
  var defaultBrandLabel = "\u54C1\u724C\u540D\u79F0";
  var defaultMaterialLabel = "\u7269\u6599\u540D\u79F0";
  function getEmptyBrandItem() {
    return {
      label: defaultBrandLabel,
      specs: [{
        unit: "\u4E2A",
        spec: 1
      }],
      priority: 1,
      isNewAdd: true
    };
  }
  function getEmptyMaterialItem() {
    return {
      label: defaultMaterialLabel,
      list: [getEmptyBrandItem()],
      usage: {
        min: 0,
        max: 100
      },
      baseAverageDayUse: 1,
      isNewAdd: true
    };
  }
  function getBrandSpecsText(brandItem) {
    const textList = [];
    brandItem.specs.forEach((i, index) => {
      if (index === 0) {
        textList.push(`1${i.unit}`);
        return;
      }
      textList.push(`${brandItem.specs[index - 1].spec}${i.unit}`);
    });
    return textList.join("*");
  }
  function validatorBrandSpecstext(text) {
    if (!text || !text.trim()) {
      return "\u4E0D\u80FD\u4E3A\u7A7A";
    }
    const itemList = text.trim().split("*");
    let errMsg = "";
    itemList.some((i, index) => {
      const regex = /^(\d+)(.*)$/;
      const match = i.trim().match(regex);
      if (!match) {
        errMsg = "\u683C\u5F0F\u4E0D\u6B63\u786E";
        return true;
      }
      if (!match[2]) {
        errMsg = "\u5355\u4F4D\u4E0D\u80FD\u4E3A\u7A7A";
        return true;
      }
    });
    return errMsg;
  }
  function getBrandSpecsByText(text) {
    const specsList = [];
    const errMsg = validatorBrandSpecstext(text);
    if (errMsg) {
      return specsList;
    }
    const itemList = text.trim().split("*");
    itemList.forEach((i, index) => {
      const regex = /^(\d+)(.*)$/;
      const match = i.trim().match(regex);
      if (index === 0) {
        specsList.push({
          unit: match[2],
          spec: 1
        });
      } else {
        specsList[index - 1].spec = Number(match[1]);
        specsList.push({
          unit: match[2],
          spec: 1
        });
      }
    });
    return specsList;
  }
  function getBrandValueText(item, v) {
    const textItem = {
      num: v,
      unit: item.specs.slice(-1)[0].unit
    };
    let rate = 1;
    cloneData(item.specs).reverse().some((specItem) => {
      rate = rate * specItem.spec;
      if (v / rate < 0.2) {
        return true;
      }
      textItem.num = getFormatNum(v / rate);
      textItem.unit = specItem.unit;
    });
    return `${textItem.num}${textItem.unit}`;
  }
  function getMaterialValueText(item, v) {
    const textList = [];
    item.list.filter((i) => !i.isDeprecated).forEach((brandItem) => {
      textList.push(getBrandValueText(brandItem, v));
    });
    return Array.from(new Set(textList)).join(",");
  }

  // utils/recordList.ts
  function getEmptyRecordBrandItem(brandItem) {
    const belongObj = recordBelongList.reduce((total, cur) => {
      total[cur.belong] = brandItem.specs.map((specItem) => {
        return {
          unit: specItem.unit,
          num: 0
        };
      });
      return total;
    }, {});
    return {
      label: brandItem.label,
      ...belongObj
    };
  }
  function getEmptyRecordMaterialItem(materialItem) {
    return {
      label: materialItem.label,
      list: materialItem.list.map((brandItem) => getEmptyRecordBrandItem(brandItem))
    };
  }
  function getEmptyRecordItem(date) {
    const materialList2 = getMaterialList();
    return {
      recordDate: date,
      list: materialList2.map((materialItem) => getEmptyRecordMaterialItem(materialItem))
    };
  }
  async function getRecordListBase(voidGetJson = false) {
    let _recordListStr = localStorage.getItem(RecordListStorageKey);
    let _recordList = [];
    if (!_recordListStr || voidGetJson && _recordListStr === "[]") {
      try {
        _recordList = await getJson("defaultRecordList");
        if (_recordList && _recordList.length) {
          localStorage.setItem(RecordListStorageKey, JSON.stringify(_recordList));
        }
      } catch (err) {
        console.error(err);
        _recordList = [];
      }
    } else {
      try {
        _recordList = JSON.parse(_recordListStr);
      } catch (err) {
        _recordList = [];
      }
    }
    return _recordList;
  }
  function setRecordListBase(list) {
    if (list && Array.isArray(list) && list.every((i) => i.recordDate && Array.isArray(i.list))) {
      localStorage.setItem(RecordListStorageKey, JSON.stringify(list));
    }
    return "\u683C\u5F0F\u4E0D\u6B63\u786E";
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
  }
  function updateRecordList(recordList) {
    const materialList2 = getMaterialList();
    recordList.forEach((recordItem) => {
      const newRecordMaterialList = [];
      materialList2.forEach((materialItem) => {
        let recordMaterialItem = recordItem.list.find((i) => i.label === materialItem.label);
        if (!recordMaterialItem) {
          recordMaterialItem = getEmptyRecordMaterialItem(materialItem);
        } else {
          const newRecordBrandList = [];
          materialItem.list.forEach((brandItem) => {
            let recordBrandItem = recordMaterialItem?.list.find((i) => i.label === brandItem.label);
            if (!recordBrandItem) {
              recordBrandItem = getEmptyRecordBrandItem(brandItem);
            }
            newRecordBrandList.push(recordBrandItem);
          });
          recordMaterialItem.list = newRecordBrandList;
        }
        newRecordMaterialList.push(recordMaterialItem);
      });
      recordItem.list = newRecordMaterialList;
    });
    return recordList;
  }
  function fillRecordList(recordList) {
    const materialList2 = getMaterialList();
    return recordList.map((recordItem) => {
      return {
        ...recordItem,
        list: recordItem.list.map((recordMaterialItem) => {
          const findMaterialItem = materialList2.find((i) => i.label === recordMaterialItem.label);
          return {
            ...recordMaterialItem,
            ...findMaterialItem,
            list: recordMaterialItem.list.map((recordBrandItem) => {
              const findBrandItem = findMaterialItem.list.find((i) => i.label === recordBrandItem.label);
              const belongObj = recordBelongList.reduce((total, cur) => {
                total[cur.belong] = recordBrandItem[cur.belong].map((specItem) => {
                  if (!findBrandItem) {
                    console.log(findMaterialItem, recordBrandItem);
                  }
                  const findSpecItem = findBrandItem.specs.find((i) => i.unit === specItem.unit);
                  if (!findSpecItem) {
                    console.log(findBrandItem, specItem);
                  }
                  return {
                    ...specItem,
                    spec: findSpecItem.spec
                  };
                });
                return total;
              }, {});
              return {
                ...recordBrandItem,
                ...findBrandItem,
                ...belongObj
              };
            })
          };
        })
      };
    });
  }
  function recordListAddFields(recordList) {
    function getComputedFields() {
      return recordBelongList.reduce((total, cur) => {
        total[`${cur.belong}Num`] = 0;
        return total;
      }, {});
    }
    function getHooksFields() {
      return recordBelongList.reduce((total, cur) => {
        total[`on${capitalizeFirstLetter(cur.belong)}NumChange`] = [];
        return total;
      }, {});
    }
    return recordList.map((recordItem) => {
      return {
        ...recordItem,
        list: recordItem.list.map((recordMaterialItem) => {
          return {
            ...recordMaterialItem,
            computed: getComputedFields(),
            hooks: getHooksFields(),
            chartData: chartDataFields.reduce((total, cur) => {
              total[cur.field] = cur.default;
              return total;
            }, {}),
            onChartDataChange: [],
            list: recordMaterialItem.list.map((recordBrandItem) => {
              return {
                ...recordBrandItem,
                computed: getComputedFields(),
                hooks: getHooksFields()
              };
            })
          };
        })
      };
    });
  }
  function getSpecsValue(specs) {
    let total = 0;
    specs = cloneData(specs);
    let numRate = 1;
    specs.reverse().forEach((i) => {
      numRate = numRate * i.spec;
      total += i.num * numRate;
    });
    return total;
  }
  function _setChartExtendData(recordList) {
    const materialList2 = getMaterialList();
    materialList2.forEach((materialItem) => {
      const recordMaterialList = recordList.map((recordItem) => recordItem.list.find((i) => i.label === materialItem.label));
      const dayUseVoidIndexList = [];
      recordMaterialList.forEach((i, index) => {
        if (i.chartData.dayUse === "-") {
          dayUseVoidIndexList.push(index);
        }
      });
      const NotVoidIndexMap = {};
      let notVoidNewIndex = 0;
      const dayUseNotVoidList = recordMaterialList.filter((i, index) => {
        if (i.chartData.dayUse !== "-") {
          NotVoidIndexMap[`${index}`] = notVoidNewIndex++;
          return true;
        }
        return false;
      }).map((i) => i.chartData.dayUse);
      const averageList = exponentialMovingAverage(dayUseNotVoidList, 3);
      recordMaterialList.forEach((recordMaterialItem, recordMaterialIndex) => {
        if (recordMaterialIndex === 0) {
          recordMaterialItem.chartData.averageDayUse = getFormatNum(materialItem.baseAverageDayUse);
        } else {
          const lastRecordMaterialItem = recordMaterialList[recordMaterialIndex - 1];
          if (recordMaterialItem.chartData.dayUse === "-") {
            recordMaterialItem.chartData.averageDayUse = getFormatNum(lastRecordMaterialItem.chartData.averageDayUse);
          } else {
            recordMaterialItem.chartData.averageDayUse = getFormatNum(averageList[NotVoidIndexMap[`${recordMaterialIndex}`]]);
          }
        }
      });
      recordMaterialList.forEach((recordMaterialItem) => {
        if (recordMaterialItem.chartData.dayUse === "-") {
          recordMaterialItem.chartData.outSuggestStrong = 0;
          recordMaterialItem.chartData.outSuggestStrongText = "\u65E5\u8017\u4E3A-,\u4E0D\u51FA\u5E93";
          recordMaterialItem.chartData.outSuggestRelax = 0;
          recordMaterialItem.chartData.outSuggestRelaxText = "\u65E5\u8017\u4E3A-,\u4E0D\u51FA\u5E93";
        } else {
          const systemNum = recordMaterialItem.computed.systemNum;
          const repoFullNum = recordMaterialItem.computed.repoNum + recordMaterialItem.computed.repoExtraNum;
          const averageDayUse = recordMaterialItem.chartData.averageDayUse;
          if (systemNum > repoFullNum) {
            let daysForLeveling = 0;
            if (systemNum >= repoFullNum + averageDayUse * 14) {
              daysForLeveling = 14;
            } else {
              daysForLeveling = 7;
            }
            const moreOutStrong = getFormatNum((systemNum - repoFullNum) / 7);
            const moreOutRelax = getFormatNum((systemNum - repoFullNum) / daysForLeveling);
            recordMaterialItem.chartData.outSuggestStrong = getFormatNum(averageDayUse + moreOutStrong);
            recordMaterialItem.chartData.outSuggestStrongText = `\u7CFB\u7EDF\u591A\u4F59\u4ED3\u5E93,\u591A\u51FA(${moreOutStrong}),\u5F3A\u51FA\u5E93:<strong>${recordMaterialItem.chartData.outSuggestStrong}</strong>`;
            recordMaterialItem.chartData.outSuggestRelax = getFormatNum(averageDayUse + moreOutRelax);
            recordMaterialItem.chartData.outSuggestRelaxText = `\u7CFB\u7EDF\u591A\u4F59\u4ED3\u5E93,\u591A\u51FA(${moreOutRelax}),\u7F13\u51FA\u5E93:<strong>${recordMaterialItem.chartData.outSuggestRelax}</strong>`;
          } else if (systemNum === repoFullNum) {
            recordMaterialItem.chartData.outSuggestStrong = averageDayUse;
            recordMaterialItem.chartData.outSuggestRelax = averageDayUse;
            recordMaterialItem.chartData.outSuggestStrongText = `\u7CFB\u7EDF\u62C9\u5E73\u4ED3\u5E93,\u6B63\u5E38\u51FA\u5E93:<strong>${averageDayUse}</strong>`;
            recordMaterialItem.chartData.outSuggestRelaxText = `\u7CFB\u7EDF\u62C9\u5E73\u4ED3\u5E93,\u6B63\u5E38\u51FA\u5E93:<strong>${averageDayUse}</strong>`;
          } else if (systemNum < repoFullNum) {
            let daysForLeveling = 0;
            if (repoFullNum >= systemNum + averageDayUse * 14) {
              daysForLeveling = 14;
            } else {
              daysForLeveling = 7;
            }
            const lessOutStrong = getFormatNum((repoFullNum - systemNum) / 7);
            const lessOutRelax = getFormatNum((repoFullNum - systemNum) / daysForLeveling);
            const strongOut = averageDayUse - lessOutStrong;
            const relaxOut = averageDayUse - lessOutRelax;
            recordMaterialItem.chartData.outSuggestStrong = strongOut > 0 ? getFormatNum(strongOut) : 0;
            recordMaterialItem.chartData.outSuggestStrongText = `\u7CFB\u7EDF\u5C11\u4E8E\u4ED3\u5E93,\u5C11\u51FA(${lessOutStrong}),\u5F3A\u51FA\u5E93:<strong>${recordMaterialItem.chartData.outSuggestStrong}</strong>`;
            recordMaterialItem.chartData.outSuggestRelax = relaxOut > 0 ? getFormatNum(relaxOut) : 0;
            recordMaterialItem.chartData.outSuggestRelaxText = `\u7CFB\u7EDF\u5C11\u4F59\u4ED3\u5E93,\u5C11\u51FA(${lessOutRelax}),\u7F13\u51FA\u5E93:<strong>${recordMaterialItem.chartData.outSuggestRelax}</strong>`;
          }
        }
      });
      recordMaterialList.forEach((recordMaterialItem) => {
        const averageDayUse = recordMaterialItem.chartData.averageDayUse;
        const repoFullNum = recordMaterialItem.computed.repoNum + recordMaterialItem.computed.repoExtraNum;
        const needUseDay = 50;
        const needPurchaseDay = 50 - getFormatNum(repoFullNum / averageDayUse);
        if (recordMaterialItem.chartData.dayUse === "-") {
          recordMaterialItem.chartData.availableDay = getFormatNum(repoFullNum / averageDayUse);
          recordMaterialItem.chartData.purchaseSuggest = "-";
          recordMaterialItem.chartData.purchaseSuggestText = "\u65E5\u8017\u4E3A-,\u4E0D\u8D2D\u4E70";
        } else {
          recordMaterialItem.chartData.availableDay = getFormatNum(repoFullNum / averageDayUse);
          recordMaterialItem.chartData.purchaseSuggest = needPurchaseDay <= 0 ? 0 : getFormatNum(needPurchaseDay * averageDayUse);
          recordMaterialItem.chartData.purchaseSuggestText = recordMaterialItem.chartData.purchaseSuggest <= 0 ? "\u6570\u91CF\u5145\u8DB3\uFF0C\u65E0\u9700\u8D2D\u4E70" : `\u9700\u8D2D\u4E70<strong>${recordMaterialItem.chartData.purchaseSuggest}</strong>`;
        }
      });
    });
  }
  var setChartExtendData = debounce(_setChartExtendData, 0, false);
  function getChartBasicData(materialItem, recordIndex, recordList) {
    const systemNum = materialItem.computed.systemNum;
    const repoFullNum = materialItem.computed.repoNum + materialItem.computed.repoExtraNum;
    const purchaseNum = materialItem.computed.purchaseNum;
    if (recordIndex === 0) return;
    const lastRecordItem = recordList[recordIndex - 1];
    const lastRecordMaterialItem = lastRecordItem.list.find((i) => i.label === materialItem.label);
    const lastSystemNum = lastRecordMaterialItem.computed.systemNum;
    const lastRepoFullNum = lastRecordMaterialItem.computed.repoNum + lastRecordMaterialItem.computed.repoExtraNum;
    const lastPurchaseNum = lastRecordMaterialItem.computed.purchaseNum;
    const dayDistance = getDayDistance(recordList[recordIndex].recordDate, lastRecordItem.recordDate);
    const styleUse = lastRepoFullNum + purchaseNum - repoFullNum;
    if (systemNum === 0 && lastSystemNum === 0 && repoFullNum === 0 && lastRepoFullNum === 0) {
    } else {
      materialItem.chartData.dayUse = getFormatNum(styleUse / dayDistance);
    }
    materialItem.chartData.weekUseText = `${getMaterialValueText(materialItem, getFormatNum(styleUse * 7 / dayDistance))}`;
    materialItem.chartData.monthUseText = `${getMaterialValueText(materialItem, getFormatNum(styleUse * 30 / dayDistance))}`;
    setChartExtendData(recordList);
  }
  function recordListAddObserver(recordList) {
    return recordList.map((recordItem, recordIndex) => {
      return {
        ...recordItem,
        list: recordItem.list.map((recordMaterialItem) => {
          objectKeys(recordMaterialItem.computed).forEach((computedKey) => {
            addObserve(recordMaterialItem.computed, computedKey, (v) => {
              recordMaterialItem.hooks[`on${capitalizeFirstLetter(computedKey)}Change`].forEach((fun) => {
                try {
                  fun(v);
                } catch (err) {
                }
              });
            });
            recordMaterialItem.hooks[`on${capitalizeFirstLetter(computedKey)}Change`].push(() => {
              getChartBasicData(recordMaterialItem, recordIndex, recordList);
            });
          });
          objectKeys(recordMaterialItem.chartData).forEach((computedKey) => {
            addObserve(recordMaterialItem.chartData, computedKey, (v) => {
              recordMaterialItem.onChartDataChange.forEach((fun) => {
                try {
                  fun();
                } catch (err) {
                }
              });
            });
          });
          return {
            ...recordMaterialItem,
            list: recordMaterialItem.list.map((recordBrandItem) => {
              recordBelongList.forEach((belongItem) => {
                recordBrandItem[belongItem.belong].forEach((specItem) => {
                  addObserve(specItem, "num", (v) => {
                    recordBrandItem.computed[`${belongItem.belong}Num`] = getSpecsValue(recordBrandItem[belongItem.belong]);
                  });
                });
              });
              objectKeys(recordBrandItem.computed).forEach((computedKey) => {
                addObserve(recordBrandItem.computed, computedKey, (v) => {
                  recordBrandItem.hooks[`on${capitalizeFirstLetter(computedKey)}Change`].forEach((fun) => {
                    try {
                      fun(v);
                    } catch (err) {
                    }
                  });
                });
                recordBrandItem.hooks[`on${capitalizeFirstLetter(computedKey)}Change`].push(() => {
                  function getBrandsNum(_materialItem) {
                    let total = 0;
                    _materialItem.list.forEach((i) => {
                      total += i.computed[computedKey];
                    });
                    return total;
                  }
                  recordMaterialItem.computed[computedKey] = getBrandsNum(recordMaterialItem);
                });
              });
              return {
                ...recordBrandItem
              };
            })
          };
        })
      };
    });
  }
  function recordListFireObserver(recordList) {
    recordList.forEach((recordItem) => {
      recordItem.list.forEach((recordMaterialItem) => {
        recordMaterialItem.list.forEach((recordBrandItem) => {
          recordBelongList.forEach((belongItem) => {
            recordBrandItem.computed[`${belongItem.belong}Num`] = getSpecsValue(recordBrandItem[belongItem.belong]);
          });
        });
      });
    });
    return recordList;
  }
  function initRecordList(recordList) {
    recordList = cloneData(recordList);
    sortRecordList(recordList);
    recordList = updateRecordList(recordList);
    const recordListFull = fillRecordList(recordList);
    const recordList1 = recordListAddFields(recordListFull);
    const recordList2 = recordListAddObserver(recordList1);
    const recordList3 = recordListFireObserver(recordList2);
    return recordList3;
  }
  function validateRecordItem(recordItem) {
    if (!recordItem.recordDate) return "\u65E5\u671F\u4E0D\u80FD\u4E3A\u7A7A";
    if (!recordItem.list.length) return "\u5217\u8868\u4E0D\u80FD\u4E3A\u7A7A";
    let errMsg;
    recordItem.list.some((recordMaterialItem, recordMaterialIndex) => {
      recordMaterialItem.list.some((recordBrandItem) => {
        recordBelongList.some((belongItem) => {
          const v = recordBrandItem.computed[`${belongItem.belong}Num`];
          if (typeof v !== "number") {
            errMsg = [belongItem.belong, recordMaterialIndex, "\u6570\u91CF\u9700\u8981\u4E3A\u6570\u5B57"];
            return true;
          }
          if (isNaN(v)) {
            errMsg = [belongItem.belong, recordMaterialIndex, "\u6570\u91CF\u9700\u8981\u4E3A\u6570\u5B57"];
            return true;
          }
          if (v < 0) {
            errMsg = [belongItem.belong, recordMaterialIndex, "\u6570\u91CF\u9700\u8981\u4E3A\u5927\u4E8E0"];
            return true;
          }
        });
        if (errMsg) return true;
      });
      if (errMsg) return true;
    });
    return errMsg ? errMsg : "";
  }
  function setRecordList(recordList) {
    let errMsg;
    let errrRecordIndex;
    recordList.some((recordItem, recordIndex) => {
      errMsg = validateRecordItem(recordItem);
      if (errMsg) {
        errrRecordIndex = recordIndex;
        return true;
      }
      ;
    });
    if (errMsg) {
      console.error(recordList, `index:${errrRecordIndex}`, errMsg);
      throw new Error("\u6570\u636E\u5F02\u5E38");
    }
    const recordListBase = [];
    const MaxStorageNum = 10;
    let storageList = recordList;
    if (recordList.length > MaxStorageNum) {
      storageList = recordList.slice(-MaxStorageNum);
      const spliceItem = recordList[recordList.length - MaxStorageNum - 1];
      const materialList2 = getMaterialList();
      materialList2.forEach((materialItem) => {
        const findItem = spliceItem.list.find((i) => i.label === materialItem.label);
        if (findItem) {
          materialItem.baseAverageDayUse = findItem.chartData.averageDayUse;
        }
      });
      setMaterials(materialList2);
    }
    storageList.forEach((recordItem) => {
      const newList = recordItem.list.map((recordMaterialItem) => {
        return {
          label: recordMaterialItem.label,
          list: recordMaterialItem.list.map((recordBrandItem) => {
            const newSpecsObj = recordBelongList.reduce((total, cur) => {
              total[cur.belong] = recordBrandItem[cur.belong].map((i) => {
                return {
                  unit: i.unit,
                  num: i.num
                };
              });
              return total;
            }, {});
            return {
              label: recordBrandItem.label,
              ...newSpecsObj
            };
          })
        };
      });
      recordListBase.push({
        recordDate: recordItem.recordDate,
        list: newList
      });
    });
    localStorage.setItem(RecordListStorageKey, JSON.stringify(recordListBase));
  }

  // utils/chart.ts
  async function getChartData(label) {
    const labels = [];
    if (label) {
      labels.push(label);
    } else {
      labels.push(...getMaterialList().map((i) => i.label));
    }
    const recordBaseList = await getRecordListBase();
    const recordList = initRecordList(recordBaseList);
    const chartDataList = [];
    labels.forEach((_label) => {
      const chartDataItemList = [];
      recordList.forEach((recordItem) => {
        const recordMaterialItem = recordItem.list.find((i) => i.label === _label);
        chartDataItemList.push({
          recordDate: recordItem.recordDate,
          ...recordMaterialItem
        });
      });
      chartDataList.push(chartDataItemList);
    });
    return chartDataList;
  }

  // utils/eventEmitter.ts
  var EventEmitter = class {
    constructor() {
      this.events = /* @__PURE__ */ new Map();
    }
    /**
     * 注册事件
     * @param eventName 事件名称
     * @param handler 事件句柄
     * @returns 清理函数
     */
    on(eventName, handler) {
      if (!this.events.has(eventName)) {
        this.events.set(eventName, []);
      }
      const handlers = this.events.get(eventName);
      handlers.push(handler);
      return () => {
        this.off(eventName, handler);
      };
    }
    /**
     * 事件移除
     * @param eventName 事件名称
     * @param handler 事件句柄
     */
    off(eventName, handler) {
      let handlers = this.events.get(eventName);
      if (!handlers || !handlers.length) return;
      handlers = handlers.filter((i) => i !== handler);
      if (!handlers.length) {
        this.events.delete(eventName);
      } else {
        this.events.set(eventName, handlers);
      }
    }
    /**
     * 事件清空
     */
    clear() {
      this.events.clear();
    }
    /**
     * 事件触发
     * @param eventName 事件名称
     * @param data 传递给事件处理函数的数据
     * @returns 
     */
    emit(eventName, data) {
      let handlers = this.events.get(eventName);
      if (!handlers) return Promise.resolve();
      const handlersPromise = handlers.map((handler) => {
        return Promise.resolve(handler(cloneData(data)));
      });
      return Promise.all(handlersPromise);
    }
  };

  // utils/router.ts
  var RouterManager = class extends EventEmitter {
    constructor() {
      super();
      this.pageStack = [];
      this._isAllowBack = false;
      addObserve(this, "_isAllowBack", (v) => {
        this.emit("allowBackChange", v);
      });
    }
    get isAllowBack() {
      return this._isAllowBack;
    }
    get currentPage() {
      return this.pageStack.slice(-1)[0];
    }
    onAllowBackChange(fun) {
      return this.on("allowBackChange", fun);
    }
    onPageChange(fun) {
      return this.on("pageChange", fun);
    }
    getBackPage() {
      if (this.pageStack.length <= 1) return;
      for (let i = this.pageStack.length - 2; i >= 0; i--) {
        const targetPage = this.pageStack[i];
        if (!targetPage.ignoreByBack) {
          return targetPage;
        }
      }
    }
    /**
     * 页面前进
     * @param {object} pageItem 页面项信息
     * @param {string} pageItem.pageName 页面名称
     * @param {object} pageItem.pageStatus 页面内部状态
     * @param {boolean} [pageItem.ignoreByBack] [可选]返回时，是否跳过这个页面
     * @param {boolean} [pageItem.silentByForward] [可选]前进时，静默前进，也就是仅仅入页面栈，不触发pageChange回调
     * @returns {number} 新的页面栈长度
     */
    pageForward(pageItem) {
      const currentPage = this.currentPage;
      const innerPageItem = cloneData(pageItem);
      if (innerPageItem.silentByForward) {
        this.pageStack.push(innerPageItem);
        this._isAllowBack = !!this.getBackPage();
        return;
      }
      ;
      this.emit("pageChange", {
        page: innerPageItem,
        meta: {
          by: currentPage,
          type: "forward"
        }
      })?.then(() => {
        this.pageStack.push(innerPageItem);
        console.log("pageStack", this.pageStack.length);
        this._isAllowBack = !!this.getBackPage();
      }).catch((err) => {
        console.log(err);
      });
    }
    /**
     * 页面回退
     * @returns 回退的页面信息 | Error
     */
    pageBack() {
      const currentPage = this.currentPage;
      const targetPage = this.getBackPage();
      const targetPageIndex = this.pageStack.findIndex((i) => i === targetPage);
      if (!targetPage) {
        throw new Error("\u8FD4\u56DE\u5931\u8D25,\u9875\u9762\u6808:" + JSON.stringify(this.pageStack));
      }
      this.pageStack = this.pageStack.splice(0, targetPageIndex + 1);
      this._isAllowBack = !!this.getBackPage();
      const pageInfo = {
        page: targetPage,
        meta: {
          by: currentPage,
          type: "back"
        }
      };
      this.emit("pageChange", pageInfo);
      return cloneData(pageInfo);
    }
  };
  var globalRouterManager = new RouterManager();

  // utils/task.ts
  var TaskManager = class {
    constructor() {
      this.isProcessing = false;
      this.tasksList = [];
    }
    /**
     * 任务添加器
     * @param tasks 
     * @param failStrategy 
     * @param abortPreTasks 
     * @returns 
     */
    execute(tasks, failStrategy, abortPreTasks = true) {
      if (abortPreTasks) {
        this.cancel("\u6709\u65B0\u7684\u4EFB\u52A1\u961F\u5217\u8981\u6267\u884C\uFF0C\u4E2D\u65AD\u4E4B\u524D\u4EFB\u52A1\u961F\u5217");
      }
      const [promise, resolve, reject] = GetPromiseAndParams();
      const controller = new AbortController();
      this.tasksList.push({ tasks, failStrategy, controller, resolve, reject });
      this.processQueue();
      return promise;
    }
    /**
     * 任务触发器
     */
    async processQueue() {
      if (this.isProcessing) return;
      this.isProcessing = true;
      while (this.tasksList.length > 0) {
        const tasksConfig = this.tasksList[0];
        try {
          await this.fireTasks(tasksConfig);
        } catch (err) {
          console.error("\u6267\u884C\u5668\u6267\u884C\u51FA\u9519", err);
        }
        this.tasksList.shift();
      }
      this.isProcessing = false;
    }
    /**
     * 任务执行器
     * @param tasksConfig 
     */
    fireTasks(tasksConfig) {
      const { tasks, failStrategy, controller, resolve: taskResolve, reject: taskReject } = tasksConfig;
      return new Promise((resolve, reject) => {
        if (controller.signal.aborted) {
          reject(new Error(controller.signal.reason));
          return;
        }
        const taskList = tasks.map((item) => {
          return typeof item === "function" ? {
            task: item,
            rollback: () => {
            },
            taskId: void 0,
            nextTaskId: void 0
          } : item;
        });
        const fireTaskIndexList = [];
        let isStop = false;
        let preStatus, preResult;
        let nextTaskIndex = 0;
        function stop() {
          isStop = true;
        }
        function setNextTaskId(taskId) {
          const findIndex = taskList.findIndex((item) => item.taskId === taskId && taskId);
          if (findIndex !== -1) {
            nextTaskIndex = findIndex;
          } else {
            console.error(`\u4E0D\u5B58\u5728taskId\u4E3A${taskId}\u7684\u4EFB\u52A1\uFF0C\u5F53\u524D\u4EFB\u52A1\u961F\u5217\u4E0D\u518D\u7EE7\u7EED\u6267\u884C`);
            stop();
          }
        }
        function getPreTaskId(index) {
          if (taskList.length && index <= taskList.length - 1) {
            return taskList[index].taskId;
          }
          return void 0;
        }
        async function rollback() {
          while (fireTaskIndexList.length) {
            const fireIndex = fireTaskIndexList.pop();
            if (fireIndex !== void 0) {
              try {
                await taskList[fireIndex].rollback?.();
              } catch (err) {
                console.error("rollback\u6267\u884C\u5931\u8D25", taskList[fireIndex]);
              }
            }
          }
        }
        const abortPromise = new Promise((_resolve) => {
          controller.signal.addEventListener("abort", () => {
            _resolve();
          }, { once: true });
        });
        (async () => {
          while (nextTaskIndex !== void 0 && taskList[nextTaskIndex]) {
            const currentTaskIndex = nextTaskIndex;
            nextTaskIndex = void 0;
            fireTaskIndexList.push(currentTaskIndex);
            let taskParams;
            if (currentTaskIndex === 0) {
              taskParams = [setNextTaskId, stop];
            } else {
              taskParams = [preStatus, preResult, getPreTaskId(currentTaskIndex - 1), setNextTaskId, stop];
            }
            const taskPromise = Promise.resolve(taskList[currentTaskIndex].task(...taskParams)).then((res) => {
              preStatus = "success";
              preResult = res;
            }).catch((err) => {
              preStatus = "fail";
              preResult = err;
            });
            await Promise.race([taskPromise, abortPromise]);
            if (isStop) {
              console.log("\u5F53\u524D\u4EFB\u52A1\u961F\u5217\u88AB\u4E2D\u65AD", tasks, currentTaskIndex);
              preStatus === "success" ? resolve(preResult) : reject(preResult);
              break;
            }
            if (controller.signal.aborted) {
              await rollback();
              reject(new Error(controller.signal.reason));
              break;
            }
            if (preStatus === "fail") {
              if (failStrategy === "rollback") {
                console.log("\u5F53\u524D\u4EFB\u52A1\u5931\u8D25,\u6267\u884C\u56DE\u6EDA", tasks, currentTaskIndex);
                await rollback();
                reject(preResult);
                break;
              }
              if (failStrategy === "stop") {
                console.log("\u5F53\u524D\u4EFB\u52A1\u5931\u8D25,\u4E2D\u65AD\u6267\u884C", tasks, currentTaskIndex);
                reject(preResult);
                break;
              }
            }
            if (nextTaskIndex === void 0) {
              nextTaskIndex = currentTaskIndex + 1;
            }
          }
          preStatus === "success" ? resolve(preResult) : reject(preResult);
        })();
      }).then((res) => {
        taskResolve(res);
      }).catch((err) => {
        taskReject(err);
      });
    }
    // 取消
    cancel(reason) {
      this.tasksList.forEach((tasksConfig) => {
        if (!tasksConfig.controller.signal.aborted) {
          tasksConfig.controller.abort(reason);
        }
      });
    }
  };

  // components/my-page-head/index.ts
  var myPageHead = {
    componentName: "my-page-head",
    content() {
      const headItemCss = "head-item";
      return {
        onMounted(shadowRoot, options, status) {
          const updateHead = (_status) => {
            const wrapper = shadowRoot.querySelector(".wrapper");
            if (wrapper) {
              wrapper.remove();
            }
            createElement({
              tagName: "div",
              className: "wrapper",
              childs: [...pageHeadBtns.map((i) => {
                return createElement({
                  tagName: "div",
                  className: `${headItemCss} ${i.label === _status.label ? "active" : ""}`,
                  innerText: i.label,
                  attributes: {
                    "data-label": i.label
                  },
                  events: {
                    "click"(e) {
                      const findItemConfig = pageHeadBtns.find((_i) => _i.label === i.label);
                      globalRouterManager.pageForward({
                        pageName: i.label,
                        pageStatus: findItemConfig?.status || {}
                      });
                    }
                  }
                });
              }), globalRouterManager.isAllowBack ? createElement({
                tagName: "div",
                className: headItemCss,
                innerText: "\u8FD4\u56DE",
                events: {
                  "click"(e) {
                    globalRouterManager.pageBack();
                  }
                }
              }) : void 0]
            }, shadowRoot);
            return Promise.resolve(true);
          };
          updateHead(status);
          globalRouterManager.onAllowBackChange(() => {
            updateHead({ label: globalRouterManager.currentPage.pageName });
          });
          globalRouterManager.onPageChange((pageItem) => {
            updateHead({ label: pageItem.page.pageName });
          });
          return {
            updateStatus: updateHead
          };
        },
        onDestroy(shadowRoot) {
          console.log("destroy");
        }
      };
    }
  };

  // components/my-page-wrapper/index.ts
  var myPageWrapper = {
    componentName: "my-page-wrapper",
    content() {
      return {
        onMounted(shadowRoot, options, status) {
          const updateStatus = (_status) => {
            globalRouterManager.pageForward({
              pageName: _status.label,
              pageStatus: _status.status
            });
            const wrapper = shadowRoot.querySelector(".wrapper");
            if (wrapper) {
              wrapper.remove();
            }
            createElement({
              tagName: "div",
              className: "wrapper",
              childs: [
                createComponent("my-page-head", {}, { label: status.label }),
                createComponent("my-page-body", {}, status)
              ]
            }, shadowRoot);
            return Promise.resolve(true);
          };
          updateStatus(status);
          return {
            updateStatus
          };
        },
        onDestroy(shadowRoot) {
        }
      };
    }
  };

  // components/my-page-body/index.ts
  var myPageBody = {
    componentName: "my-page-body",
    content() {
      return {
        onMounted(shadowRoot, options, status) {
          const taskManager3 = new TaskManager();
          const updateBody = (status2) => {
            return taskManager3.execute([
              () => {
                const wrapperNode = shadowRoot.querySelector(".wrapper");
                if (wrapperNode) {
                  return waitEleDuration(wrapperNode, "active", false).then((res) => {
                    wrapperNode.remove();
                  });
                }
              },
              () => {
                return new Promise((resolve, reject) => {
                  const findHeadItemConfig = pageHeadBtns.find((i) => i.label === status2.label);
                  if (!findHeadItemConfig) {
                    reject(new Error("label\u4E0D\u6B63\u786E"));
                    return;
                  }
                  ;
                  createElement({
                    tagName: "div",
                    className: "wrapper",
                    childs: () => {
                      const myComponent = createComponent(findHeadItemConfig.componentName, {
                        ...findHeadItemConfig.options,
                        label: findHeadItemConfig.label,
                        returnUpdateStatusType(type) {
                          if (type) {
                            resolve("");
                          } else {
                            reject(new Error("\u8282\u70B9\u663E\u793A\u5F02\u5E38"));
                          }
                        }
                      }, status2.status);
                      return [myComponent];
                    }
                  }, shadowRoot);
                });
              },
              () => {
                return new Promise((resolve, reject) => {
                  const wrapperNode = shadowRoot.querySelector(".wrapper");
                  if (wrapperNode) {
                    waitEleDuration(wrapperNode, "active", true);
                    resolve(true);
                  } else {
                    reject(new Error("wrapper\u8282\u70B9\u672A\u627E\u5230"));
                  }
                });
              }
            ], "stop", true);
          };
          updateBody(status);
          globalRouterManager.onPageChange((pageItem) => {
            return updateBody({
              label: pageItem.page.pageName,
              status: pageItem.page.pageStatus
            });
          });
          return {
            updateStatus: updateBody
          };
        },
        onDestroy(shadowRoot) {
        }
      };
    }
  };

  // components/my-charts/index.ts
  var myCharts = {
    componentName: "my-charts",
    content() {
      return {
        onMounted(shadowRoot, options, status) {
          const loadScriptPromise = oneByone([
            "https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js",
            "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"
          ], addScriptToGlobal);
          const updateStatus = async (_status) => {
            const recordBaseList = await getRecordListBase();
            if (!recordBaseList.length) {
              return Promise.reject(() => {
                showDialog({
                  title: "\u5F53\u524D\u65E0\u6570\u636E",
                  content: "\u8DF3\u8F6C\u5230\u65B0\u589E\uFF1F",
                  footer: {
                    confirm: "\u786E\u8BA4",
                    cancel: "\u53D6\u6D88"
                  }
                }, true).then((res) => {
                  globalRouterManager.pageForward({
                    pageName: "\u65B0\u589E",
                    pageStatus: {
                      date: ""
                    }
                  });
                });
              });
            }
            const wrapperNode = shadowRoot.querySelector(".wrapper");
            if (wrapperNode) {
              wrapperNode.remove();
            }
            createElement({
              tagName: "div",
              className: "wrapper",
              childs: [
                createElement({
                  tagName: "div",
                  className: "head-wrapper"
                }),
                createElement({
                  tagName: "div",
                  className: "body-wrapper"
                })
              ]
            }, shadowRoot);
            function createHeadWrapper(resolve2) {
              const headWrapper = shadowRoot.querySelector(".head-wrapper");
              if (!headWrapper) return resolve2();
              removeChilds(headWrapper);
              const materialList2 = getMaterialList();
              const _innerStatus = cloneData(_status);
              appendChildElements(headWrapper, [
                createElement({
                  tagName: "div",
                  className: "head-label",
                  innerText: "\u8BF7\u9009\u62E9"
                }),
                createElement({
                  tagName: "select",
                  className: "chart-type-select",
                  attributes: {
                    placeholder: "\u8BF7\u9009\u62E9\u56FE\u8868\u7C7B\u578B"
                  },
                  hooks: {
                    onCreated(ele) {
                      ele.value = _status.type || "";
                    }
                  },
                  events: {
                    "change": (e) => {
                      delete _innerStatus.activeLabel;
                      _innerStatus.type = e.currentTarget.value;
                      globalRouterManager.pageForward({
                        pageName: options.label,
                        pageStatus: _innerStatus,
                        silentByForward: true
                      });
                      createBodyWrapper(_innerStatus);
                    }
                  },
                  childs: () => {
                    return [
                      createElement({
                        tagName: "option",
                        attributes: {
                          value: ""
                        },
                        innerText: "\u8BF7\u9009\u62E9\u56FE\u8868\u7C7B\u578B"
                      }),
                      ...chartDataTypes.map((chartTypeItem) => {
                        return createElement({
                          tagName: "option",
                          attributes: {
                            value: chartTypeItem.label
                          },
                          innerText: chartTypeItem.label
                        });
                      })
                    ];
                  }
                }),
                createElement({
                  tagName: "select",
                  className: "chart-label-select",
                  attributes: {
                    placeholder: "\u8BF7\u9009\u62E9\u7269\u6599"
                  },
                  hooks: {
                    onCreated(ele) {
                      ele.value = _status.label || "";
                    }
                  },
                  events: {
                    "change": (e) => {
                      delete _innerStatus.activeLabel;
                      _innerStatus.label = e.currentTarget.value;
                      if (!_innerStatus.type) {
                        showMessage({
                          text: "\u5148\u9009\u62E9\u56FE\u8868\u7C7B\u578B",
                          type: "warn",
                          duration: 2e3
                        });
                        return;
                      }
                      globalRouterManager.pageForward({
                        pageName: options.label,
                        pageStatus: _innerStatus,
                        silentByForward: true
                      });
                      createBodyWrapper(_innerStatus);
                    }
                  },
                  childs: () => {
                    return [
                      createElement({
                        tagName: "option",
                        attributes: {
                          value: ""
                        },
                        innerText: "\u8BF7\u9009\u62E9\u7269\u6599"
                      }),
                      ...materialList2.map((materialItem) => {
                        return createElement({
                          tagName: "option",
                          attributes: {
                            value: materialItem.label
                          },
                          innerText: materialItem.label
                        });
                      })
                    ];
                  }
                })
              ]);
              resolve2(createBodyWrapper(_innerStatus));
            }
            async function createBodyWrapper(__status) {
              const bodyWrapper = shadowRoot.querySelector(".body-wrapper");
              if (!bodyWrapper) return;
              removeChilds(bodyWrapper);
              if (!__status.type) return;
              await loadScriptPromise;
              const chartDataList = await getChartData(__status.label);
              await sleep(100);
              appendChildElements(bodyWrapper, chartDataList.map((chartDataItem) => {
                return createElement({
                  tagName: "div",
                  className: "material-wrapper",
                  childs: [
                    // 标题
                    createElement({
                      tagName: "div",
                      className: "material-label-wrapper",
                      childs: [
                        createElement({
                          tagName: "div",
                          className: "material-label",
                          innerText: chartDataItem[0].label
                        })
                      ]
                    }),
                    // 画布
                    createElement({
                      tagName: "div",
                      className: "material-canvas-wrapper",
                      childs: () => {
                        let currentChart;
                        const chartDataTypesItem = chartDataTypes.find((i) => i.label === __status.type);
                        if (!chartDataTypesItem) return [];
                        return [
                          createUpdateElement(() => ({
                            tagName: "canvas",
                            style: {
                              width: "100%",
                              height: "380px"
                            },
                            hooks: {
                              onMounted(ele) {
                                const canvasRenderingContext2D = ele.getContext("2d");
                                if (!canvasRenderingContext2D) return;
                                currentChart = new Chart(canvasRenderingContext2D, {
                                  type: "line",
                                  data: {
                                    labels: chartDataItem.map((_i) => _i.recordDate),
                                    datasets: chartDataTypesItem.fields.map((i) => {
                                      return {
                                        label: i.label,
                                        data: chartDataItem.map((_i) => i.getValue(_i))
                                      };
                                    })
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
                                        display: "auto",
                                        offset: function(context) {
                                          const yMax = context.chart.scales.y.max;
                                          const canvasHeight = context.chart.height;
                                          const currentDataIndex = context.dataIndex;
                                          const currentDatasetIndex = context.datasetIndex;
                                          const currentValue = context.dataset.data[currentDataIndex];
                                          if (typeof currentValue !== "number") return;
                                          const othersValue = [];
                                          function getBlockHeight() {
                                            const currentMeta = context.chart.getDatasetMeta(currentDatasetIndex);
                                            debugger;
                                            const pointElements = currentMeta.data;
                                            const currentPoint = pointElements[currentDataIndex];
                                            const currentHeight = 20;
                                            return currentHeight || 0;
                                          }
                                          context.chart.data.datasets.forEach((i, index) => {
                                            const meta = context.chart.getDatasetMeta(index);
                                            if (!meta.hidden && index !== currentDatasetIndex) {
                                              othersValue.push({
                                                datasetIndex: index,
                                                value: i.data[currentDataIndex]
                                              });
                                            }
                                          });
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
                                          return offset - getBlockHeight() / 2;
                                        },
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
                                  plugins: [ChartDataLabels]
                                });
                                if (__status.activeLabel === chartDataItem[0].label) {
                                  ele.scrollIntoView({
                                    block: "center"
                                  });
                                }
                              }
                            },
                            events: {
                              "click"(e) {
                                const { clientX, clientY } = e;
                                const canvasNode = e.currentTarget;
                                const rect = canvasNode.getBoundingClientRect();
                                const relativeCanvasX = clientX - rect.left;
                                const relativeCanvasY = clientY - rect.top;
                                function saveStatusAndNavigate(fun) {
                                  globalRouterManager.pageForward({
                                    pageName: options.label,
                                    pageStatus: {
                                      ...__status,
                                      activeLabel: chartDataItem[0].label
                                    },
                                    silentByForward: true
                                  });
                                  fun();
                                }
                                if (!currentChart) return;
                                function allowXLabelClick() {
                                  const xHeight = currentChart.scales.x.height;
                                  if (relativeCanvasY > rect.height - xHeight) {
                                    const xIndex = currentChart.scales.x.getValueForPixel(relativeCanvasX);
                                    const xLabel = currentChart.scales.x.getLabelForValue(xIndex);
                                    showDialog({
                                      title: `\u9009\u4E2D\u65E5\u671F${xLabel},\u9009\u62E9\u8DF3\u8F6C\u76EE\u6807`,
                                      content: {
                                        default: chartDataTypesItem?.navigateBelongField || "",
                                        validator(v) {
                                          if (!v.trim()) {
                                            return "\u4E0D\u80FD\u4E3A\u7A7A";
                                          }
                                          return "";
                                        },
                                        list: recordBelongList.map((i) => ({
                                          label: i.label,
                                          value: i.belong
                                        }))
                                      },
                                      footer: {
                                        cancel: "\u53D6\u6D88",
                                        confirm: "\u786E\u8BA4"
                                      }
                                    }, true).then((res) => {
                                      saveStatusAndNavigate(() => globalRouterManager.pageForward({
                                        pageName: "\u4FEE\u6539",
                                        pageStatus: {
                                          date: xLabel,
                                          material: {
                                            belongField: res,
                                            label: chartDataItem[0].label
                                          }
                                        }
                                      }));
                                    });
                                  }
                                }
                                function allowLegendClick() {
                                  const legend = currentChart.legend;
                                  const legendHitBoxes = legend?.legendHitBoxes;
                                  if (legendHitBoxes && Array.isArray(legendHitBoxes)) {
                                    legendHitBoxes.some((legendAreaItem, legendIndex) => {
                                      if (legendAreaItem) {
                                        const { left, top, width, height } = legendAreaItem;
                                        if (relativeCanvasX > left && relativeCanvasX < left + width && relativeCanvasY > top && relativeCanvasY < top + height) {
                                          const datasetItemMeta = currentChart.getDatasetMeta(legendIndex);
                                          datasetItemMeta.hidden = !datasetItemMeta.hidden;
                                          currentChart.update();
                                          return true;
                                        }
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
                                  allowLegendClick();
                                }
                                try {
                                  allowDatalabelsAreaClick((datasetIndex, pointIndex) => {
                                    const xLabel = currentChart.scales.x.getLabelForValue(pointIndex);
                                    const fieldItem = chartDataTypesItem.fields[datasetIndex];
                                    if (fieldItem.navigateTo) {
                                      const targetPage = fieldItem.navigateTo(chartDataItem[0]);
                                      saveStatusAndNavigate(() => globalRouterManager.pageForward({
                                        pageName: targetPage.label,
                                        pageStatus: targetPage.status
                                      }));
                                    } else {
                                      saveStatusAndNavigate(
                                        () => globalRouterManager.pageForward({
                                          pageName: "\u4FEE\u6539",
                                          pageStatus: {
                                            date: xLabel,
                                            material: {
                                              belongField: fieldItem.navigateBelongField,
                                              label: chartDataItem[0].label
                                            }
                                          }
                                        })
                                      );
                                    }
                                  });
                                } catch (err) {
                                }
                              }
                            },
                            getUpdateFun(updateFun, ele) {
                              chartDataList.forEach((chartItem) => {
                                chartItem.forEach((chartRecordItem) => {
                                  chartRecordItem.onChartDataChange.push(updateFun);
                                });
                              });
                            }
                          }))
                        ];
                      }
                    }),
                    // footer
                    createElement({
                      tagName: "div",
                      className: "footer",
                      childs: () => {
                        const chartDataTypesItem = chartDataTypes.find((i) => i.label === __status.type);
                        return chartDataTypesItem.footer(chartDataItem.slice(-3).reverse());
                      }
                    })
                  ]
                });
              }));
            }
            const [headPromise, resolve] = GetPromiseAndParams();
            createHeadWrapper(resolve);
            return headPromise.then(() => {
              return true;
            });
          };
          updateStatus(status).then(() => {
            options.returnUpdateStatusType(true);
          }).catch((res) => {
            options.returnUpdateStatusType(false);
            if (res && typeof res === "function") {
              res();
            }
          });
          return {
            updateStatus
          };
        },
        onDestroy(shadowRoot) {
        }
      };
    }
  };

  // components/my-record-form/index.ts
  var myRecordForm = {
    componentName: "my-record-form",
    content() {
      return {
        onMounted(shadowRoot, options, status) {
          const recordList = [];
          let lastInnerStatus;
          const innerUpdate = async (_status) => {
            if (_status.date === "_inner") {
              _status.date = lastInnerStatus.date;
            }
            lastInnerStatus = cloneData(_status);
            async function updateFormBodyWrapper(date) {
              const formBodywrapper = shadowRoot.querySelector(".form-body-wrapper");
              if (!formBodywrapper) return;
              removeChilds(formBodywrapper);
              const currentFormRecordIndex = recordList.findIndex((i) => i.recordDate === date);
              if (currentFormRecordIndex == -1) return;
              const currentFormRecordItem = recordList[currentFormRecordIndex];
              if (!date) {
                return;
              }
              const [myPromise, resolve, reject] = GetPromiseAndParams();
              appendChildElements(formBodywrapper, recordBelongList.map((belongItem) => {
                function updateBelongContentWrapper() {
                  const belongContentWrapper = belongWrapper?.querySelector(".belong-content-wrapper");
                  if (belongContentWrapper) {
                    belongContentWrapper.remove();
                  } else {
                    const lastRecordItem = currentFormRecordIndex === -1 ? void 0 : recordList[currentFormRecordIndex - 1];
                    createElement({
                      tagName: "div",
                      className: "belong-content-wrapper",
                      childs: currentFormRecordItem.list.map((recordMaterialItem) => {
                        let lastRecordMaterialItem = void 0;
                        if (lastRecordItem) {
                          lastRecordMaterialItem = lastRecordItem.list.find((i) => i.label === recordMaterialItem.label);
                        }
                        const materialInputNode = createComponent("my-material-input", {
                          data: recordMaterialItem,
                          lastRecordMaterialItem,
                          dayDistance: lastRecordItem ? getDayDistance(currentFormRecordItem.recordDate, lastRecordItem.recordDate) : void 0,
                          belong: belongItem,
                          closeBelongContent: updateBelongContentWrapper,
                          updateFormStatus: innerUpdate,
                          navigateTo: (fun) => {
                            if (typeof fun === "function") {
                              globalRouterManager.pageForward({
                                pageName: options.label,
                                pageStatus: {
                                  date,
                                  material: {
                                    belongField: belongItem.belong,
                                    label: recordMaterialItem.label
                                  }
                                },
                                silentByForward: true
                              });
                              fun();
                            }
                          }
                        }, {});
                        if (_status.material && _status.material.belongField === belongItem.belong && recordMaterialItem.label === _status.material.label) {
                          setTimeout(() => {
                            materialInputNode.scrollIntoView({
                              block: "center"
                            });
                            materialInputNode.classList.add("active");
                            sleep(2e3).then(() => {
                              materialInputNode.classList.remove("active");
                            });
                            resolve();
                          }, 400);
                        }
                        return materialInputNode;
                      })
                    }, belongWrapper);
                  }
                }
                const belongWrapper = createElement({
                  tagName: "div",
                  className: "belong-wrapper",
                  childs: [
                    createElement({
                      tagName: "div",
                      className: "belong-label",
                      innerText: belongItem.label,
                      events: {
                        "click"(e) {
                          updateBelongContentWrapper();
                        }
                      }
                    })
                  ]
                });
                if (_status.material && _status.material.belongField === belongItem.belong) {
                  updateBelongContentWrapper();
                }
                return belongWrapper;
              }));
              if (!_status.material) {
                resolve();
              }
              return myPromise;
            }
            async function updateFormFooterWrapper(date) {
              const formFooterWrapper = shadowRoot.querySelector(".form-footer-wrapper");
              if (!formFooterWrapper) return;
              removeChilds(formFooterWrapper);
              const currentFormRecordIndex = recordList.findIndex((i) => i.recordDate === date);
              if (currentFormRecordIndex == -1) return;
              const currentFormRecordItem = recordList[currentFormRecordIndex];
              if (!date) return;
              function _validateRecordItem() {
                const errMsg = validateRecordItem(currentFormRecordItem);
                if (typeof errMsg === "string" && errMsg) {
                  showMessage({
                    text: errMsg,
                    type: "error",
                    duration: 2e3
                  });
                } else if (errMsg) {
                  const [belongField, materialIndex, _errMsg] = errMsg;
                  innerUpdate({
                    date,
                    material: {
                      belongField,
                      label: currentFormRecordItem.list[materialIndex].label
                    }
                  }).then((res) => {
                    showMessage({
                      text: _errMsg,
                      type: "error",
                      duration: 2e3
                    });
                  });
                }
                return errMsg;
              }
              function add() {
                appendChildElements(formFooterWrapper, [
                  createElement({
                    tagName: "div",
                    className: "btn-item",
                    innerText: "\u589E\u52A0",
                    events: {
                      click() {
                        let errMsg = _validateRecordItem();
                        if (!errMsg) {
                          try {
                            setRecordList(recordList);
                            showMessage({
                              text: "\u589E\u52A0\u6210\u529F",
                              type: "success",
                              duration: 2e3
                            }).then(() => {
                              globalRouterManager.pageForward({
                                pageName: "\u4FEE\u6539",
                                pageStatus: {
                                  date: currentFormRecordItem.recordDate
                                }
                              });
                            });
                          } catch (err) {
                            showMessage({
                              text: err.message,
                              type: "error",
                              duration: 2e3
                            });
                          }
                        }
                      }
                    }
                  })
                ]);
              }
              function modify() {
                appendChildElements(formFooterWrapper, [
                  createElement({
                    tagName: "div",
                    className: "btn-item",
                    innerText: "\u79FB\u9664",
                    events: {
                      "click"(e) {
                        showDialog({
                          title: "\u786E\u5B9A\u79FB\u9664\u5417",
                          content: "",
                          footer: {
                            cancel: "\u53D6\u6D88",
                            confirm: "\u786E\u8BA4"
                          }
                        }, true).then(() => {
                          debugger;
                          recordList.splice(currentFormRecordIndex, 1);
                          setRecordList(recordList);
                          showMessage({
                            text: "\u79FB\u9664\u6210\u529F",
                            type: "success",
                            duration: 2e3
                          });
                          updateStatus({ date: "" });
                        }).catch(() => {
                        });
                      }
                    }
                  }),
                  createElement({
                    tagName: "div",
                    className: "btn-item",
                    innerText: "\u66F4\u65B0",
                    events: {
                      "click"(e) {
                        let errMsg = _validateRecordItem();
                        if (!errMsg) {
                          try {
                            setRecordList(recordList);
                            showMessage({
                              text: "\u66F4\u65B0\u6210\u529F",
                              type: "success",
                              duration: 2e3
                            }).then(() => {
                            });
                          } catch (err) {
                            showMessage({
                              text: err.message,
                              type: "error",
                              duration: 2e3
                            });
                          }
                        }
                      }
                    }
                  })
                ]);
              }
              options.type === "add" ? add() : modify();
            }
            await updateFormBodyWrapper(_status.date);
            await updateFormFooterWrapper(_status.date);
            return Promise.resolve(true);
          };
          const updateStatus = async (_status) => {
            const wrapperNode = shadowRoot.querySelector(".wrapper");
            if (wrapperNode) {
              wrapperNode.remove();
            }
            let recordListBase = await getRecordListBase();
            if (!recordListBase.length) {
              await showDialog({
                title: "\u672C\u5730\u65E0\u6570\u636E\u5217\u8868\uFF0C\u662F\u5426\u62C9\u53D6\u8FDC\u7A0B\u6570\u636E",
                content: "",
                footer: {
                  confirm: "\u786E\u8BA4",
                  cancel: "\u53D6\u6D88"
                }
              }, true).then(() => {
                return getRecordListBase(true).then((res) => {
                  recordListBase = res;
                });
              }).catch(() => {
                return Promise.reject("\u65E0\u6570\u636E");
              });
            }
            recordList.splice(0, recordList.length);
            recordList.push(...initRecordList(recordListBase));
            const currentDate = getCurrentDate().full;
            if (options.type === "add" && recordList.find((i) => i.recordDate === currentDate)) {
              await showDialog({
                title: "\u5F53\u524D\u65E5\u671F\u5DF2\u6709\u6570\u636E",
                content: currentDate,
                footer: {
                  confirm: "\u786E\u8BA4"
                }
              }, true);
              return Promise.reject(() => {
                globalRouterManager.pageForward({
                  pageName: "\u4FEE\u6539",
                  pageStatus: {
                    date: currentDate
                  }
                });
              });
            }
            createElement({
              tagName: "div",
              className: "wrapper",
              childs: [
                createElement({
                  tagName: "div",
                  className: "form-head-wrapper"
                }),
                createElement({
                  tagName: "div",
                  className: "form-body-wrapper"
                }),
                createElement({
                  tagName: "div",
                  className: "form-footer-wrapper"
                })
              ]
            }, shadowRoot);
            function createFormHeadWrapper() {
              const formHeadWrapper = shadowRoot.querySelector(".form-head-wrapper");
              if (!formHeadWrapper) return Promise.reject();
              removeChilds(formHeadWrapper);
              return new Promise((resolve) => {
                function addType() {
                  appendChildElements(formHeadWrapper, [
                    createElement({
                      tagName: "span",
                      className: "form-date-label",
                      innerText: "\u5F53\u524D\u65E5\u671F"
                    }),
                    createElement({
                      tagName: "input",
                      className: "form-date",
                      attributes: {
                        type: "date",
                        value: currentDate,
                        disabled: "disabled"
                      }
                    })
                  ]);
                  recordListBase.push(getEmptyRecordItem(currentDate));
                  recordList.splice(0, recordList.length);
                  recordList.push(...initRecordList(recordListBase));
                  resolve(innerUpdate({
                    ..._status,
                    date: currentDate
                  }));
                }
                function modifytype() {
                  const dateList = cloneData(recordList.map((i) => i.recordDate));
                  appendChildElements(formHeadWrapper, [
                    createElement({
                      tagName: "span",
                      className: "form-date-label",
                      innerText: "\u9009\u62E9\u65E5\u671F"
                    }),
                    createElement({
                      tagName: "select",
                      className: "form-date",
                      attributes: {
                        placeholder: "\u8BF7\u9009\u62E9",
                        value: ""
                      },
                      childs: [
                        createElement({
                          tagName: "option",
                          attributes: {
                            value: ""
                          },
                          innerText: "\u8BF7\u9009\u62E9"
                        }),
                        ...dateList.reverse().map((dateItem) => {
                          return createElement({
                            tagName: "option",
                            attributes: {
                              value: dateItem
                            },
                            innerText: dateItem
                          });
                        })
                      ],
                      events: {
                        "change"(e) {
                          recordList.splice(0, recordList.length);
                          recordList.push(...initRecordList(recordListBase));
                          innerUpdate({
                            date: e.currentTarget.value
                          });
                          globalRouterManager.pageForward({
                            pageName: options.label,
                            pageStatus: {
                              date: e.currentTarget.value
                            },
                            // ignoreByBack:true,
                            silentByForward: true
                          });
                        }
                      },
                      hooks: {
                        onCreated(e) {
                          if (_status.date) {
                            e.value = _status.date;
                          }
                          resolve(innerUpdate(_status));
                        }
                      }
                    })
                  ]);
                }
                if (options.type === "add") {
                  addType();
                } else {
                  modifytype();
                }
              });
            }
            await createFormHeadWrapper();
            return Promise.resolve(true);
          };
          updateStatus(status).then(() => {
            options.returnUpdateStatusType(true);
          }).catch((res) => {
            options.returnUpdateStatusType(false);
            if (res && typeof res === "function") {
              res();
            }
          });
          return {
            updateStatus
          };
        },
        onDestroy(shadowRoot) {
        }
      };
    }
  };

  // components/my-dialog/index.ts
  var myDialog = {
    componentName: "my-dialog",
    reuseComponentNames: ["my-dialog-again"],
    content() {
      return {
        onMounted(shadowRoot, options, status) {
          const dialogBgClassName = "dialog-bg";
          const dialogContentClassName = "dialog-content";
          const executor = new MoreTimeExecute();
          async function hideDialog(onlyContent = false) {
            const wrapperNode = shadowRoot.querySelector(".wrapper");
            if (wrapperNode) {
              const dialogContent = wrapperNode.querySelector(`.${dialogContentClassName}`);
              if (dialogContent) {
                await waitEleDuration(dialogContent, "active", false).then((res) => {
                  dialogContent.remove();
                });
              }
              if (onlyContent) {
                return;
              }
              const dialogBg = wrapperNode.querySelector(`.${dialogBgClassName}`);
              if (dialogBg) {
                await waitEleDuration(dialogBg, "active", false).then((res) => {
                  dialogBg.remove();
                });
              }
              wrapperNode.remove();
            }
          }
          const showDialog4 = (_status, waitClosed = true) => {
            return executor.execute([
              () => {
                return hideDialog(true);
              },
              () => {
                const dialogBg = shadowRoot.querySelector(`.${dialogBgClassName}`);
                if (dialogBg) return;
                return new Promise((resolve) => {
                  createElement({
                    tagName: "div",
                    className: "wrapper",
                    style: {
                      zIndex: (options.zIndex || 10) + ""
                    },
                    childs: [
                      createElement(
                        {
                          tagName: "div",
                          className: dialogBgClassName,
                          hooks: {
                            onMounted(ele) {
                              waitEleDuration(ele, "active", true).then(resolve);
                            }
                          }
                        }
                      )
                    ]
                  }, shadowRoot);
                });
              },
              () => {
                const dialogConfig = _status;
                let inputValue = "";
                let inputErrorMsg = "";
                let contentNode;
                if (typeof dialogConfig.content === "string") {
                  contentNode = createElement({
                    tagName: "div",
                    className: "content",
                    innerText: dialogConfig.content
                  });
                } else if (dialogConfig.content instanceof Element) {
                  contentNode = createElement({
                    tagName: "div",
                    className: "content",
                    childs: [dialogConfig.content],
                    events: {
                      "customChange": (e) => {
                        inputValue = e.detail.value;
                      }
                    }
                  });
                } else if (typeof dialogConfig.content === "object") {
                  const content = dialogConfig.content;
                  inputValue = content.default;
                  inputErrorMsg = content.validator(inputValue);
                  contentNode = createElement({
                    tagName: "div",
                    className: "content",
                    childs: [
                      createElement({
                        tagName: "div",
                        className: "input-wrapper",
                        childs: () => {
                          let updateErrMsgFun;
                          return [
                            content.list ? createElement({
                              tagName: "select",
                              hooks: {
                                onCreated(ele) {
                                  ele.value = inputValue;
                                }
                              },
                              events: {
                                "change"(e) {
                                  inputValue = e.currentTarget.value;
                                  inputErrorMsg = content.validator(inputValue);
                                  updateErrMsgFun();
                                }
                              },
                              childs: [
                                createElement({
                                  tagName: "option",
                                  attributes: {
                                    value: ""
                                  },
                                  innerText: "\u8BF7\u9009\u62E9"
                                }),
                                ...content.list.map((item) => {
                                  let itemObj = {
                                    label: "",
                                    value: ""
                                  };
                                  if (typeof item === "string") {
                                    itemObj.label = item;
                                    itemObj.value = item;
                                  } else {
                                    itemObj = item;
                                  }
                                  return createElement({
                                    tagName: "option",
                                    attributes: {
                                      value: itemObj.value
                                    },
                                    innerText: itemObj.label
                                  });
                                })
                              ]
                            }) : createComponent("my-input", {
                              unit: "\u2716\uFE0F",
                              onStatusChange(status2) {
                                inputValue = status2.value;
                                inputErrorMsg = content.validator(inputValue);
                                updateErrMsgFun();
                              }
                            }, {
                              value: inputValue
                            }, {
                              style: {
                                width: "100%"
                              }
                            }),
                            createUpdateElement(() => ({
                              tagName: "div",
                              className: "input-error-msg",
                              innerText: inputErrorMsg,
                              getUpdateFun(updateFun, ele) {
                                updateErrMsgFun = updateFun;
                              }
                            }))
                          ];
                        }
                      })
                    ]
                  });
                } else {
                  contentNode = createElement({
                    tagName: "div",
                    className: "content"
                  });
                }
                return function createWrapper(_resolve, _reject) {
                  let confirmText = "";
                  let cancelText = "";
                  if (typeof dialogConfig.footer.confirm === "string") {
                    confirmText = dialogConfig.footer.confirm;
                  } else if (dialogConfig.footer.confirm === true) {
                    confirmText = "\u786E\u8BA4";
                  }
                  if (typeof dialogConfig.footer.cancel === "string") {
                    cancelText = dialogConfig.footer.cancel;
                  } else if (dialogConfig.footer.cancel === true) {
                    cancelText = "\u53D6\u6D88";
                  }
                  const dialogContent = createElement({
                    tagName: "div",
                    className: dialogContentClassName,
                    childs: [
                      createElement({
                        tagName: "div",
                        className: "title",
                        innerText: dialogConfig.title
                      }),
                      contentNode,
                      createElement({
                        tagName: "div",
                        className: "footer",
                        childs: [
                          confirmText ? createElement({
                            tagName: "div",
                            className: "footer-item",
                            innerText: confirmText,
                            events: {
                              "click"(e) {
                                if (!inputErrorMsg) {
                                  hideDialog().then(() => {
                                    if (_resolve) {
                                      _resolve(inputValue);
                                    }
                                  });
                                } else {
                                  showMessage({
                                    text: inputErrorMsg,
                                    type: "error",
                                    duration: 2e3
                                  });
                                }
                              }
                            }
                          }) : void 0,
                          cancelText ? createElement({
                            tagName: "div",
                            className: "footer-item",
                            innerText: cancelText,
                            events: {
                              click(e) {
                                hideDialog().then(() => {
                                  if (_reject) {
                                    _reject(void 0);
                                  }
                                });
                              }
                            }
                          }) : void 0
                        ]
                      })
                    ]
                  });
                  const wrapperNode = shadowRoot.querySelector(".wrapper");
                  wrapperNode.appendChild(dialogContent);
                  return waitEleDuration(dialogContent, "active", true).then((res) => {
                    if (!confirmText && !cancelText && _resolve) {
                      _resolve();
                    }
                  });
                };
              },
              (lastIsResolve, lastResolveValue, lastRejectValue) => {
                if (lastIsResolve) {
                  if (waitClosed) {
                    const promiseList = GetPromiseAndParams();
                    lastResolveValue(promiseList[1], promiseList[2]);
                    return promiseList[0];
                  } else {
                    return lastResolveValue();
                  }
                }
                return "";
              }
            ]);
          };
          async function updateStatus(_status) {
            if (_status.display === false) {
              return executor.execute([
                () => {
                  return new Promise((resolve) => {
                    hideDialog().then(() => {
                      resolve(true);
                    });
                  });
                }
              ]);
            } else {
              return showDialog4(_status.config, false).then((res) => {
                return true;
              });
            }
          }
          return {
            updateStatus,
            showDialog: showDialog4
          };
        },
        onDestroy(shadowRoot) {
        }
      };
    }
  };

  // components/my-message/index.ts
  var myMessage = {
    componentName: "my-message",
    content() {
      return {
        onMounted(shadowRoot, options, status) {
          const executor = new MoreTimeExecute();
          const contentClassName = "content";
          async function hideMessageBox() {
            const wrapperNode = shadowRoot.querySelector(".wrapper");
            if (wrapperNode) {
              const contentNode = wrapperNode.querySelector(`.${contentClassName}`);
              if (contentNode) {
                await waitEleDuration(contentNode, "active", false).then((res) => {
                  contentNode.remove();
                });
              }
              wrapperNode.remove();
            }
          }
          const showMessage3 = (_status) => {
            return executor.execute([
              () => {
                return hideMessageBox();
              },
              () => {
                const strList = Array.isArray(_status.text) ? _status.text : [_status.text];
                createElement({
                  tagName: "div",
                  className: "wrapper",
                  childs: [
                    createElement({
                      tagName: "div",
                      className: `${contentClassName} ${_status.type}`,
                      childs: strList.map((i) => {
                        return createElement({
                          tagName: "div",
                          className: "text-item",
                          innerText: i
                        });
                      })
                    })
                  ]
                }, shadowRoot);
              },
              () => {
                const contentNode = shadowRoot.querySelector(`.${contentClassName}`);
                if (!contentNode) {
                  return false;
                }
                return waitEleDuration(contentNode, "active", true);
              },
              () => {
                return sleep(_status.duration);
              },
              () => {
                return hideMessageBox().then(() => {
                  return true;
                });
              }
            ]);
          };
          return {
            updateStatus: showMessage3
          };
        },
        onDestroy(shadowRoot) {
        }
      };
    }
  };

  // components/my-materials/index.ts
  function createMaterialItemNode(shadowRoot, materialItem) {
    const wrapperContent = shadowRoot.querySelector(".content");
    return createUpdateElement(() => {
      let updateMaterialItemFun;
      let updateMaterialItemLabelFun;
      let currentContentIsOpen = false;
      let isUpdateFinish = true;
      async function waitupdateMaterialItemContent(wrapper, isOpen) {
        if (isUpdateFinish) {
          isUpdateFinish = false;
          currentContentIsOpen = isOpen;
          updateMaterialItemContent(wrapper, materialItem, currentContentIsOpen, updateMaterialItemFun).finally(() => {
            isUpdateFinish = true;
          });
        }
      }
      return {
        tagName: "div",
        className: `material-item-wrapper ${materialItem.isNewAdd ? "new-material-item" : ""} ${materialItem.isDeprecated ? "material-item-deprecated" : ""}`,
        attributes: {
          "data-label": materialItem.label
        },
        getUpdateFun(updateFun) {
          updateMaterialItemFun = updateFun;
        },
        events: {
          customClick(e) {
            waitupdateMaterialItemContent(e.target, true).then(() => {
              if (typeof e.detail.resolve === "function") {
                e.detail.resolve();
              }
            });
          }
        },
        childs: [
          createElement({
            tagName: "div",
            className: "material-label-wrapper",
            childs: [
              createUpdateElement(() => ({
                tagName: "div",
                className: "material-label",
                innerText: materialItem.label,
                getUpdateFun(updateFun, ele) {
                  updateMaterialItemLabelFun = updateFun;
                }
              })),
              materialItem.isNewAdd ? createElement({
                tagName: "div",
                className: "edit-icon",
                innerText: "\u270D\u{1F3FB}",
                events: {
                  "click"(e) {
                    e.stopPropagation();
                    const newMaterialItem = cloneData(materialItem);
                    showDialog({
                      title: "\u65B0\u7684\u7269\u6599\u540D\u79F0",
                      content: {
                        default: materialItem.label,
                        validator(v) {
                          newMaterialItem.label = v;
                          return validatorMaterialItem(newMaterialItem, ["label"]);
                        }
                      },
                      footer: {
                        cancel: "\u53D6\u6D88",
                        confirm: "\u786E\u8BA4"
                      }
                    }, true).then((res) => {
                      materialItem.label = res;
                      updateMaterialItemLabelFun();
                    }).catch(() => {
                    });
                  }
                }
              }) : void 0
            ],
            events: {
              click(e) {
                waitupdateMaterialItemContent(e.currentTarget.parentNode, !currentContentIsOpen);
              }
            }
          })
        ],
        hooks: {
          onMounted(ele) {
            waitupdateMaterialItemContent(ele, currentContentIsOpen);
          }
        }
      };
    }, wrapperContent);
  }
  async function updateMaterialItemContent(parentNode, materialItem, isShow, updateMaterialItemFun) {
    const wrapperName = "material-item-content";
    const wrapperNode = parentNode.querySelector(`.${wrapperName}`);
    if (wrapperNode) {
      wrapperNode.style.height = "0px";
      await waitEleDuration(wrapperNode, "active", false).then(() => {
        wrapperNode.remove();
      });
    }
    if (!isShow) return;
    {
      parentNode.classList.add("active");
      setTimeout(() => {
        parentNode.classList.remove("active");
      }, 2e3);
    }
    function createBrandItem(brandItem, newBrandItem = false) {
      const wrapperNode2 = parentNode.querySelector(`.${wrapperName}`);
      const brandListWrapper = wrapperNode2.querySelector(".brand-list-wrapper");
      createUpdateElement(() => {
        let updateBrandItemFun;
        return {
          tagName: "div",
          className: `brand-item-wrapper ${brandItem.isNewAdd ? "new-brand-item" : ""} ${brandItem.isDeprecated ? "brand-item-deprecated" : ""}`,
          getUpdateFun(updateFun) {
            updateBrandItemFun = updateFun;
          },
          childs: () => {
            let labelUpdateFun;
            return [
              createElement({
                tagName: "div",
                className: "brand-label-wrapper",
                childs: [
                  createUpdateElement(() => ({
                    tagName: "div",
                    innerText: brandItem.label,
                    getUpdateFun(updateFun, ele) {
                      labelUpdateFun = updateFun;
                    }
                  })),
                  brandItem.isNewAdd ? createElement({
                    tagName: "div",
                    className: "edit-icon",
                    innerText: "\u270D\u{1F3FB}",
                    events: {
                      "click"(e) {
                        const newBrandItem2 = cloneData(brandItem);
                        showDialog({
                          title: "\u65B0\u7684\u54C1\u724C\u540D\u79F0",
                          content: {
                            default: brandItem.label,
                            validator(v) {
                              newBrandItem2.label = v;
                              return validatorBrandItem(newBrandItem2, ["label"]);
                            }
                          },
                          footer: {
                            cancel: "\u53D6\u6D88",
                            confirm: "\u786E\u8BA4"
                          }
                        }, true).then((res) => {
                          brandItem.label = res;
                          labelUpdateFun();
                        }).catch(() => {
                        });
                      }
                    }
                  }) : void 0
                ]
              }),
              createElement({
                tagName: "div",
                className: "brand-specs-text",
                childs: () => {
                  let updateSpecsTextFun;
                  return [
                    createUpdateElement(() => ({
                      tagName: "span",
                      innerText: getBrandSpecsText(brandItem),
                      getUpdateFun(updateFun, ele) {
                        updateSpecsTextFun = updateFun;
                      }
                    })),
                    brandItem.isNewAdd ? createElement({
                      tagName: "span",
                      className: "edit-icon",
                      innerText: "\u270D\u{1F3FB}",
                      events: {
                        "click"(e) {
                          showDialog({
                            title: "\u65B0\u7684\u89C4\u683C",
                            content: {
                              default: getBrandSpecsText(brandItem),
                              validator(v) {
                                return validatorBrandSpecstext(v);
                              }
                            },
                            footer: {
                              cancel: "\u53D6\u6D88",
                              confirm: "\u786E\u8BA4"
                            }
                          }, true).then((res) => {
                            brandItem.specs = getBrandSpecsByText(res);
                            updateSpecsTextFun();
                          }).catch(() => {
                          });
                        }
                      }
                    }) : void 0
                  ];
                }
              }),
              createElement({
                tagName: "select",
                className: "brand-priority",
                attributes: {
                  value: brandItem.priority + ""
                },
                childs: objectKeys(brandPriorityMap).map((i) => {
                  return createElement({
                    tagName: "option",
                    attributes: {
                      value: i
                    },
                    innerText: brandPriorityMap[i]
                  });
                })
              }),
              createElement({
                tagName: "div",
                className: "brand-deprecated",
                innerText: brandItem.isDeprecated ? "\u6FC0\u6D3B" : "\u5E9F\u5F03",
                events: {
                  "click"(e) {
                    brandItem.isDeprecated = !brandItem.isDeprecated;
                    updateBrandItemFun();
                  }
                }
              })
            ];
          }
        };
      }, brandListWrapper);
      if (newBrandItem) {
        fireTransition();
      }
    }
    async function fireTransition() {
      const wrapperNode2 = parentNode.querySelector(`.${wrapperName}`);
      if (!wrapperNode2) return;
      wrapperNode2.style.height = wrapperNode2.scrollHeight + "px";
      await waitEleDuration(wrapperNode2, "active", true);
    }
    createUpdateElement(() => {
      return {
        tagName: "div",
        className: wrapperName,
        childs: [
          // 品牌列表
          createElement({
            tagName: "div",
            className: "brand-list-wrapper"
          }),
          // 物料表单
          createElement({
            tagName: "div",
            className: "material-item-form",
            childs: [
              createComponent("my-input", {
                unit: "\u65E5\u8017",
                onStatusChange(status) {
                  materialItem.baseAverageDayUse = Number(status.value);
                }
              }, { value: materialItem.baseAverageDayUse + "" }),
              createComponent("my-input", {
                unit: "min",
                onStatusChange(status) {
                  materialItem.usage.min = Number(status.value);
                }
              }, { value: materialItem.usage.min + "" }),
              createComponent("my-input", {
                unit: "max",
                onStatusChange(status) {
                  materialItem.usage.max = Number(status.value);
                }
              }, { value: materialItem.usage.max + "" }),
              createElement({
                tagName: "div",
                className: "add-brand-item",
                innerText: "\u589E\u52A0\u54C1\u724C",
                events: {
                  "click"(e) {
                    const newBrandItem = getEmptyBrandItem();
                    materialItem.list.push(newBrandItem);
                    createBrandItem(newBrandItem, true);
                  }
                }
              })
            ]
          })
        ]
      };
    }, parentNode);
    materialItem.list.forEach((brandItem) => createBrandItem(brandItem));
    await fireTransition();
  }
  var myMaterials = {
    componentName: "my-materials",
    content() {
      return {
        onMounted(shadowRoot, options, status) {
          let materialList2 = [];
          function createWrapper() {
            removeChilds(shadowRoot);
            materialList2 = getMaterialList();
            createElement({
              tagName: "div",
              className: "wrapper",
              childs: [
                createElement({
                  tagName: "div",
                  className: "content",
                  hooks: {
                    onMounted(ele) {
                      materialList2.forEach((materialItem) => {
                        createMaterialItemNode(shadowRoot, materialItem);
                      });
                    }
                  },
                  childs: []
                }),
                createElement({
                  tagName: "div",
                  className: "footer",
                  childs: [
                    createElement({
                      tagName: "div",
                      className: "footer-item",
                      innerText: "\u589E\u52A0\u7269\u6599",
                      events: {
                        "click"(e) {
                          const newMaterialItem = getEmptyMaterialItem();
                          materialList2.push(newMaterialItem);
                          const targetNode = createMaterialItemNode(shadowRoot, newMaterialItem);
                          targetNode.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                          });
                        }
                      }
                    }),
                    createElement({
                      tagName: "div",
                      className: "footer-item",
                      innerText: "\u91CD\u7F6E\u7269\u6599",
                      events: {
                        "click"(e) {
                          createWrapper();
                        }
                      }
                    }),
                    createElement({
                      tagName: "div",
                      className: "footer-item",
                      innerText: "\u66F4\u65B0\u7269\u6599",
                      events: {
                        "click"(e) {
                          const errInfo = setMaterials(materialList2);
                          if (errInfo) {
                            const materialNodes = shadowRoot.querySelectorAll(".material-item-wrapper");
                            if (materialNodes) {
                              const targetNode = materialNodes[errInfo[1]];
                              if (targetNode) {
                                materialActive(targetNode).then(() => {
                                  showMessage({
                                    text: errInfo[0],
                                    type: "error",
                                    duration: 2e3
                                  });
                                });
                              }
                            }
                          } else {
                            showMessage({
                              text: "\u66F4\u65B0\u6210\u529F",
                              type: "success",
                              duration: 2e3
                            }).then(() => {
                            });
                          }
                        }
                      }
                    })
                  ]
                })
              ]
            }, shadowRoot);
          }
          createWrapper();
          function materialActive(targetNode) {
            return new Promise((resolve) => {
              targetNode.dispatchEvent(new CustomEvent("customClick", {
                detail: {
                  target: targetNode,
                  resolve
                }
              }));
            }).then(() => {
              targetNode.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            });
          }
          const updateStatus = async (_status) => {
            const targetItem = materialList2.find((i) => i.label === _status.activeLabel);
            if (targetItem) {
              let getTargetNode2 = function() {
                return shadowRoot.querySelector(`.material-item-wrapper[data-label="${targetItem.label}"]`);
              };
              var getTargetNode = getTargetNode2;
              console.log(targetItem.label);
              await waitCondition(() => !!getTargetNode2(), 2e3);
              await materialActive(getTargetNode2());
            }
            return Promise.resolve(true);
          };
          updateStatus(status);
          options.returnUpdateStatusType(true);
          return {
            updateStatus
          };
        },
        onDestroy(shadowRoot) {
        }
      };
    }
  };

  // components/my-input/index.ts
  var myInput = {
    componentName: "my-input",
    content() {
      return {
        onMounted(shadowRoot, options, status) {
          const updateStatus = (_status) => {
            let inputValue = _status.value;
            createElement({
              tagName: "div",
              className: "wrapper",
              childs: [
                createElement({
                  tagName: "input",
                  attributes: {
                    value: inputValue
                  },
                  events: {
                    "input"(e) {
                      inputValue = e.currentTarget.value;
                      if (options.onStatusChange) {
                        options.onStatusChange({
                          value: e.currentTarget.value
                        });
                      }
                    },
                    "blur"(e) {
                      inputValue = e.currentTarget.value;
                      if (inputValue === "") {
                        inputValue = options.voidValue || "";
                        e.currentTarget.value = inputValue;
                      }
                      if (options.onStatusChange) {
                        options.onStatusChange({
                          value: e.currentTarget.value
                        });
                      }
                    }
                  }
                }),
                options.unit ? createElement({
                  tagName: "div",
                  className: "unit",
                  innerText: options.unit,
                  style: {
                    fontSize: options.unit.length > 1 ? "14px" : "12px"
                  },
                  events: {
                    "click"(e) {
                      console.log(inputValue, !inputValue);
                      if (!inputValue) {
                        return;
                      }
                      showReuseDialog({
                        title: "\u786E\u5B9A\u79FB\u9664\u5F53\u524D\u503C\u5417?",
                        content: "",
                        footer: {
                          cancel: "\u53D6\u6D88",
                          confirm: "\u786E\u8BA4"
                        }
                      }, true).then((res) => {
                        const inputNode = shadowRoot.querySelector("input");
                        inputValue = options.voidValue || "";
                        if (inputNode) {
                          inputNode.value = inputValue;
                          if (options.onStatusChange) {
                            options.onStatusChange({
                              value: ""
                            });
                          }
                        }
                      }).catch(() => {
                      });
                    }
                  }
                }) : void 0
              ]
            }, shadowRoot);
            return Promise.resolve(true);
          };
          updateStatus(status);
          return {
            updateStatus
          };
        },
        onDestroy(shadowRoot) {
        }
      };
    }
  };

  // components/my-material-input/index.ts
  function getForecastValue(currentMaterialItem, lastMaterialItem, belong, dayDistance) {
    if (!lastMaterialItem || !dayDistance) return "";
    const averageDayUse = lastMaterialItem.chartData.averageDayUse;
    const dayUse = lastMaterialItem.chartData.dayUse;
    if (dayUse === "-") return;
    if (belong.belong === "system") {
      const forecastValue = lastMaterialItem.computed.systemNum + currentMaterialItem.computed.purchaseNum - averageDayUse * dayDistance;
      return getFormatNum(forecastValue) + "";
    } else if (belong.belong === "purchase") {
      return "";
    } else if (belong.belong === "repo") {
      const lastRepoFullNum = lastMaterialItem.computed.repoNum + lastMaterialItem.computed.repoExtraNum;
      const forecastValue = lastRepoFullNum + currentMaterialItem.computed.purchaseNum - averageDayUse * dayDistance;
      return getFormatNum(forecastValue) + "";
    } else if (belong.belong === "repoExtra") {
      return "";
    } else {
      return "";
    }
  }
  var myMaterialInput = {
    componentName: "my-material-input",
    content() {
      return {
        onMounted(shadowRoot, options, status) {
          const updateStatus = (_status) => {
            return Promise.resolve(true);
          };
          const materialItem = options.data;
          const belong = options.belong;
          createElement({
            tagName: "div",
            className: "wrapper",
            childs: [
              createElement({
                tagName: "div",
                className: "material-item-label-wrapper",
                childs: [
                  createElement({
                    tagName: "span",
                    className: "material-item-label",
                    innerText: materialItem.label
                  }),
                  createElement({
                    tagName: "span",
                    className: "material-item-belong",
                    innerText: options.belong.label
                  })
                ],
                events: {
                  click(e) {
                    options.closeBelongContent();
                  }
                }
              }),
              createElement({
                tagName: "div",
                className: "brand-list-wrapper",
                childs: materialItem.list.filter((i) => !i.isDeprecated).map((brandItem) => {
                  return createElement({
                    tagName: "div",
                    className: "brand-item-wrapper",
                    childs: [
                      createElement({
                        tagName: "div",
                        className: "brand-item-label-wrapper",
                        childs: [
                          createElement({
                            tagName: "span",
                            className: "brand-item-label",
                            innerText: brandItem.label,
                            events: {
                              "click"(e) {
                                options.navigateTo(() => {
                                  globalRouterManager.pageForward({
                                    pageName: "\u56FE\u8868",
                                    pageStatus: {
                                      type: "\u4ED3\u5E93\u6570\u91CF",
                                      label: materialItem.label
                                    }
                                  });
                                });
                              }
                            }
                          }),
                          createElement({
                            tagName: "span",
                            className: "brand-item-specs-text",
                            innerText: getBrandSpecsText(brandItem)
                          })
                        ]
                      }),
                      createElement({
                        tagName: "div",
                        className: "brand-item-input-wrapper",
                        childs: brandItem[belong.belong].map((specItem, specIndex) => {
                          if (options.belong.onlyShowLastSpecInput && specIndex !== brandItem[belong.belong].length - 1) {
                            return;
                          }
                          return createComponent("my-input", {
                            unit: specItem.unit,
                            voidValue: "0",
                            onStatusChange(status2) {
                              let v = Number(status2.value);
                              if (isNaN(v)) {
                                v = 0;
                              }
                              specItem.num = v;
                            }
                          }, { value: specItem.num + "" });
                        })
                      }),
                      // 辅助信息
                      createElement({
                        tagName: "div",
                        className: "brand-item-input-help",
                        show: materialItem.list.filter((i) => !i.isDeprecated).length > 1,
                        childs: () => {
                          function getHelpItem(title, _BrandItem) {
                            const newBelongList = recordBelongList.filter((i) => i.belong !== options.belong.belong);
                            newBelongList.unshift(options.belong);
                            return [
                              createElement({
                                tagName: "div",
                                innerText: title,
                                style: {
                                  width: `${getFormatNum(100 / (recordBelongList.length + 1))}%`
                                }
                              }),
                              // 当前归属的字段值
                              ...newBelongList.map((i, index) => {
                                return createElement({
                                  tagName: "div",
                                  style: {
                                    width: `${getFormatNum(100 / (recordBelongList.length + 1))}%`
                                  },
                                  childs: [
                                    createElement({
                                      tagName: "span",
                                      innerText: i.shortLabel
                                    }),
                                    createElement({
                                      tagName: "span",
                                      className: `help-item-value ${index === 0 ? "current" : ""}`,
                                      innerText: _BrandItem ? _BrandItem.computed[`${i.belong}Num`] + "" : "-"
                                    })
                                  ],
                                  events: {
                                    "click"(e) {
                                      if (i.belong === options.belong.belong) return;
                                      options.updateFormStatus({
                                        date: "_inner",
                                        material: {
                                          belongField: i.belong,
                                          label: materialItem.label
                                        }
                                      });
                                    }
                                  }
                                });
                              })
                            ];
                          }
                          const lastRecordBrandItem = options.lastRecordMaterialItem?.list.find((i) => i.label === brandItem.label);
                          return [
                            // 本次
                            createUpdateElement(() => ({
                              tagName: "div",
                              className: "help-item",
                              childs: getHelpItem("\u672C\u6B21", brandItem),
                              getUpdateFun(updateFun, ele) {
                                brandItem.hooks.onPurchaseNumChange.push(updateFun);
                                brandItem.hooks.onRepoExtraNumChange.push(updateFun);
                                brandItem.hooks.onRepoNumChange.push(updateFun);
                                brandItem.hooks.onSystemNumChange.push(updateFun);
                              }
                            })),
                            // 上次
                            createElement({
                              tagName: "div",
                              className: "help-item",
                              childs: getHelpItem("\u4E0A\u6B21", lastRecordBrandItem)
                            })
                          ];
                        }
                      })
                    ]
                  });
                })
              }),
              createElement({
                tagName: "div",
                className: "material-help",
                childs: () => {
                  function getHelpItem(title, _material) {
                    const newBelongList = recordBelongList.filter((i) => i.belong !== options.belong.belong);
                    newBelongList.unshift(options.belong);
                    return [
                      createElement({
                        tagName: "div",
                        innerText: title,
                        style: {
                          width: `${getFormatNum(100 / (recordBelongList.length + 1))}%`
                        }
                      }),
                      // 当前归属的字段值
                      ...newBelongList.map((i, index) => {
                        return createElement({
                          tagName: "div",
                          style: {
                            width: `${getFormatNum(100 / (recordBelongList.length + 1))}%`
                          },
                          childs: [
                            createElement({
                              tagName: "span",
                              innerText: i.shortLabel
                            }),
                            createElement({
                              tagName: "span",
                              className: `help-item-value ${index === 0 ? "current" : ""}`,
                              innerText: _material ? _material.computed[`${i.belong}Num`] + "" : "-"
                            })
                          ],
                          events: {
                            "click"(e) {
                              if (i.belong === options.belong.belong) return;
                              options.updateFormStatus({
                                date: "_inner",
                                material: {
                                  belongField: i.belong,
                                  label: materialItem.label
                                }
                              });
                            }
                          }
                        });
                      })
                    ];
                  }
                  return [
                    // 本次
                    createUpdateElement(() => ({
                      tagName: "div",
                      className: "help-item",
                      childs: getHelpItem("\u672C\u6B21", materialItem),
                      getUpdateFun(updateFun, ele) {
                        materialItem.hooks.onPurchaseNumChange.push(updateFun);
                        materialItem.hooks.onRepoExtraNumChange.push(updateFun);
                        materialItem.hooks.onRepoNumChange.push(updateFun);
                        materialItem.hooks.onSystemNumChange.push(updateFun);
                      }
                    })),
                    // 上次
                    createElement({
                      tagName: "div",
                      className: "help-item",
                      childs: getHelpItem("\u4E0A\u6B21", options.lastRecordMaterialItem)
                    })
                  ];
                }
              }),
              createElement({
                tagName: "div",
                className: "validator-wrapper",
                childs: [
                  createElement({
                    tagName: "div",
                    className: "title",
                    innerText: "\u9A8C\u8BC1"
                  }),
                  createElement({
                    tagName: "div",
                    className: "content",
                    childs: [
                      // 预估信息
                      createUpdateElement(() => {
                        const text = getForecastValue(materialItem, options.lastRecordMaterialItem, belong, options.dayDistance) || "";
                        return {
                          tagName: "div",
                          className: "item",
                          childs: [
                            createElement({
                              tagName: "div",
                              innerHTML: text ? `\u9884\u8BA1\u672C\u6B21\u503C:<span class="help-item-value current">${text}</span>` : ""
                            })
                          ],
                          getUpdateFun(updateFun, ele) {
                            materialItem.hooks.onPurchaseNumChange.push(updateFun);
                            materialItem.hooks.onRepoExtraNumChange.push(updateFun);
                            materialItem.hooks.onRepoNumChange.push(updateFun);
                            materialItem.hooks.onSystemNumChange.push(updateFun);
                            materialItem.onChartDataChange.push(updateFun);
                          }
                        };
                      }),
                      // 日耗信息
                      createUpdateElement(() => {
                        const dayUse = materialItem.chartData.dayUse;
                        const averageDayUse = (options.lastRecordMaterialItem || materialItem).chartData.averageDayUse;
                        let errInfo = "";
                        if (typeof dayUse === "number" && typeof averageDayUse === "number") {
                          if (dayUse < 0) {
                            errInfo = "\u65E5\u8017\u4E3A\u8D1F\uFF0C\u68C0\u67E5\u6570\u636E";
                          } else if (Math.abs(dayUse / averageDayUse) > 1.5) {
                            errInfo = "\u5F53\u524D\u65E5\u8017\u8FDC\u9AD8\u4E8E\u4E4B\u524D";
                          } else if (Math.abs(averageDayUse / dayUse) > 1.5) {
                            errInfo = "\u5F53\u524D\u65E5\u8017\u8FDC\u4F4E\u4E8E\u4E4B\u524D";
                          }
                        }
                        return {
                          tagName: "div",
                          className: "item",
                          childs: [
                            createElement({
                              tagName: "span",
                              innerText: `\u5F80\u671F\u5747\u65E5\u8017${averageDayUse}\uFF0C\u5F53\u524D\u65E5\u8017${dayUse}\u3002`
                            }),
                            createElement({
                              tagName: "span",
                              style: {
                                color: "red"
                              },
                              innerText: errInfo,
                              events: {
                                click() {
                                  options.navigateTo(() => {
                                    globalRouterManager.pageForward({
                                      pageName: "\u56FE\u8868",
                                      pageStatus: {
                                        type: "\u6D88\u8017\u5BF9\u6BD4",
                                        label: materialItem.label
                                      }
                                    });
                                  });
                                }
                              }
                            })
                          ],
                          getUpdateFun(updateFun, ele) {
                            materialItem.onChartDataChange.push(updateFun);
                          }
                        };
                      })
                    ]
                  })
                ]
              })
            ]
          }, shadowRoot);
          return {
            updateStatus
          };
        },
        onDestroy(shadowRoot) {
        }
      };
    }
  };

  // components/my-others/index.ts
  var taskManager = new TaskManager();
  var myOthers = {
    componentName: "my-others",
    content() {
      return {
        onMounted(shadowRoot, options, status) {
          const updateStatus = (_status) => {
            createElement({
              tagName: "div",
              className: "wrapper",
              childs: [
                createElement({
                  tagName: "div",
                  className: "item",
                  innerText: "\u5BFC\u5165",
                  events: {
                    "click"(e) {
                      const input = createElement({
                        tagName: "input",
                        attributes: {
                          type: "file",
                          id: "inOutInput",
                          accept: ".json"
                        },
                        events: {
                          "input"(e2) {
                            const target = e2.currentTarget;
                            if (!target || !target.files) return;
                            const file = target.files[0];
                            if (file.type !== "application/json") {
                              showMessage({
                                text: "\u8BF7\u9009\u62E9json\u6587\u4EF6",
                                type: "warn",
                                duration: 2e3
                              });
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = function(e3) {
                              let jsonData;
                              if (!e3.target) {
                                return;
                              }
                              try {
                                jsonData = JSON.parse(e3.target.result);
                              } catch (error) {
                                showMessage({
                                  text: "json\u683C\u5F0F\u4E0D\u6B63\u786E",
                                  type: "warn",
                                  duration: 2e3
                                });
                                return;
                              }
                              const err = setRecordListBase(jsonData.list);
                              if (err) {
                                showMessage({
                                  text: err,
                                  type: "warn",
                                  duration: 2e3
                                });
                              } else {
                                showMessage({
                                  text: "\u5BFC\u5165\u6210\u529F",
                                  type: "success",
                                  duration: 2e3
                                });
                              }
                            };
                            reader.readAsText(file);
                          }
                        }
                      });
                      input.click();
                    }
                  }
                }),
                createElement({
                  tagName: "div",
                  className: "item",
                  innerText: "\u5BFC\u51FA",
                  events: {
                    "click"(e) {
                      async function downloadJSON() {
                        const list = await getRecordListBase();
                        const jsonString = JSON.stringify({
                          list
                        }, null, 2);
                        const blob = new Blob([jsonString], { type: "application/json" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `\u4ED3\u5E93${getCurrentDate().fullStr}`;
                        link.click();
                        URL.revokeObjectURL(link.href);
                      }
                      downloadJSON().then((res) => {
                        showMessage({
                          text: "\u5BFC\u51FA\u6210\u529F",
                          type: "success",
                          duration: 2e3
                        });
                      });
                    }
                  }
                }),
                createElement({
                  tagName: "div",
                  className: "item",
                  innerText: "\u6E05\u9664\u7F13\u5B58",
                  events: {
                    "click"(e) {
                      showDialog({
                        title: "\u8BF7\u9009\u62E9",
                        content: {
                          default: "",
                          validator: (v) => {
                            return "";
                          },
                          list: storageKeys.map((i) => ({
                            label: i,
                            value: i
                          }))
                        },
                        footer: {
                          cancel: "\u53D6\u6D88",
                          confirm: "\u786E\u8BA4"
                        }
                      }, true).then((res) => {
                        if (res) {
                          console.log(res);
                          localStorage.removeItem(res);
                          showMessage({
                            text: "\u6E05\u9664\u6210\u529F",
                            type: "success",
                            duration: 2e3
                          });
                        }
                      });
                    }
                  }
                })
              ]
            }, shadowRoot);
            return Promise.resolve(true);
          };
          updateStatus(status);
          options.returnUpdateStatusType(true);
          return {
            updateStatus
          };
        },
        onDestroy(shadowRoot) {
        }
      };
    }
  };

  // components/index.ts
  var components_default = [
    myPageWrapper,
    myPageHead,
    myPageBody,
    myCharts,
    myRecordForm,
    myDialog,
    myMessage,
    myMaterials,
    myInput,
    myOthers,
    myMaterialInput
  ];

  // main/index.ts
  function main() {
    components_default.forEach((item) => {
      initComponent(item);
    });
    const defaultHeadItem = getDefaultHeadItem();
    appendChildElements(document.body, [
      createComponent("my-page-wrapper", {}, objectPick(defaultHeadItem, ["label", "status"]))
    ]);
  }
  main();
  var taskManager2 = new TaskManager();
})();
