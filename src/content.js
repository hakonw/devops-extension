// https://github.com/JetBrains/intellij-community/blob/a77365debaadcf00b888a977d89512f3f0f3cf9e/platform/built-in-server/src/org/jetbrains/ide/OpenFileHttpService.kt

//////////////////////
// Options Handling //
//////////////////////
const fallbackOptions = {
  webstorm: {
    enabled: true,
    ignorePrefix: "",
  },
  rider: {
    enabled: true,
    ignorePrefix: "",
  },
  vscode: {
    enabled: false,
    addPrefix: "Users/Person/git/repo/",
  },
  copybranch: {
    enabled: true,
  },
};
const options = {};

getOptionsStorageSyncData()
  .then((data) => {
    Object.assign(options, data.options);
  })
  .catch((e) => console.warn("Storage messed up", e));

function getOptionsStorageSyncData() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("options", (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items);
    });
  });
}

// Watch for changes to the user's options & apply them
chrome.storage.onChanged.addListener((changes, area) => {
  console.log("storage change detection", changes);
  if (area === "sync" && changes.options?.newValue) {
    console.log("New settings:", changes.options.newValue);
    Object.assign(options, changes.options.newValue);
    observerCallback();
  }
});
/////////////////////

///////////////////////
// Button Generation //
///////////////////////
// TODO replace isFrontend & isBackend with options?
function isFrontend(path) {
  const re = new RegExp(".*\\.(ts|js|html|json|css|scss)$");
  return re.test(path);
}

function isBackend(path) {
  const re = new RegExp(".*\\.(cs|vb|sql|txt)$");
  return re.test(path);
}

function addButton(buttonText, url, parentElement, useFetch) {
  const btn = document.createElement("button");
  btn.innerHTML = buttonText;
  btn.style.marginLeft = "1rem";
  btn.className = "injected-button";

  btn.style.backgroundColor = window.getComputedStyle(document.body)[
    "background-color"
  ];
  btn.style.border =
    "1px solid " + window.getComputedStyle(document.body)["color"];
  btn.style.borderRadius = "3px";
  btn.style.color = window.getComputedStyle(document.body)["color"];
  btn.style.padding = "2px 8px";

  btn.addEventListener("click", function () {
    if (useFetch) {
      fetch(url).then((data) => console.log(data));
    } else {
      window.open(url);
    }
  });
  parentElement.appendChild(btn);
}

const removePrefix = (value, prefix) =>
  value.startsWith(prefix) ? value.slice(prefix.length) : value;

function addWebstormButton(path, lineNumber, root) {
  if (isFrontend(path)) {
    if (options.webstorm?.enabled ?? fallbackOptions.webstorm.enabled) {
      let newPath = removePrefix(
        path,
        options.webstorm?.ignorePrefix ?? fallbackOptions.webstorm.ignorePrefix
      );
      const linePart = lineNumber ? "&line=" + lineNumber : "";
      addButton(
        "Webstorm",
        "http://localhost:63343/api/file?file=" + newPath + linePart,
        root,
        true
      );
    }
  }
}

function addRiderButton(path, lineNumber, root) {
  if (isBackend(path)) {
    if (options.rider?.enabled ?? fallbackOptions.rider.enabled) {
      let newPath = removePrefix(
        path,
        options.rider?.ignorePrefix ?? fallbackOptions.rider.ignorePrefix
      );
      const linePart = lineNumber ? "&line=" + lineNumber : "";
      addButton(
        "Rider",
        "http://localhost:63342/api/file?file=" + newPath + linePart,
        root,
        true
      );
    }
  }
}

function addVSCodeButton(path, lineNumber, root) {
  if (isFrontend(path)) {
    // vscode://file/[path/to/file]:[line]
    if (options.vscode?.enabled ?? fallbackOptions.vscode.enabled) {
      const linePart = lineNumber ? ":" + lineNumber : "";
      addButton(
        "VSCode",
        "vscode://file/" + options.vscode?.addPrefix + path + linePart,
        root
      );
    }
  }
}

function addButtons(path, lineNumber, root) {
  removeInjectedButtons(root);
  addWebstormButton(path, lineNumber, root);
  addRiderButton(path, lineNumber, root);
  addVSCodeButton(path, lineNumber, root);
  // TODO add jetbrains:  jetbrains://php-storm/navigate/reference?project=${projectName}&path=${path}:${line}  (and like that)
}

///////////////////////

////////////////////////////////////////////////
// Utils for cleanup, and finding information //
////////////////////////////////////////////////
function removeInjectedButtons(element) {
  // Remove old buttons as if incorrectly loaded, the line number is wrong
  const possiblyInjectedButton =
    element.getElementsByClassName("injected-button");
  for (let i = possiblyInjectedButton.length - 1; i >= 0; i--) {
    // Go the inverse way to remove ghost buttons
    possiblyInjectedButton[i].remove();
    console.log("RemovedButton");
  }
}

function getFilePath(pathPart) {
  // TODO a nicer approach
  return pathPart.childNodes[0].textContent; // innerText will have buttons text which we dont want
}

function getLineNumber(element) {
  let lineNumber = undefined;
  const lineNumbers = element.getElementsByClassName("repos-line-number");
  for (const lineNum of lineNumbers) {
    const parsedNumber = parseInt(lineNum.getAttribute("data-line"));
    // console.log(parsedNumber);
    if (!Number.isNaN(parsedNumber)) {
      lineNumber = parsedNumber;
      break;
    }
  }

  return lineNumber;
}
////////////////////////////////////////////////

function generateButtonsMainPagePullRequest() {
  const comments = document.getElementsByClassName("comment-file-header");

  for (let comment of comments) {
    const pathElements = comment.getElementsByClassName(
      "body-s secondary-text text-ellipsis flex-self-stretch"
    );

    if (pathElements.length != 1) {
      console.error("Bad element at main page. CSS may been changed");
      continue;
    }

    const pathElement = pathElements[0];

    let path = getFilePath(pathElement);
    if (path === undefined) {
      continue;
    }

    let lineNumber = getLineNumber(comment);

    addButtons(path, lineNumber, pathElement);
  }
}

function generateButtonsChangedFileHeader() {
  const repoToolbars = document.getElementsByClassName("repos-compare-toolbar");
  if (repoToolbars.length != 1) {
    console.error("Multiple toolbars. pls fix, amount: " + repoToolbars.length);
    // Or crash, whatever
  }
  const repoToolbar = repoToolbars[0];
  // removeInjectedButtons(repoToolbar);

  const textElements = repoToolbar.getElementsByClassName(
    "secondary-text body-s text-ellipsis"
  );

  if (textElements.length != 1) {
    console.error("Bad toolbar. CSS may have been changed");
    return;
  }
  const textElement = textElements[0];
  const path = getFilePath(textElement);

  addButtons(path, null, textElement);
}

function generateButtonsFileSummary() {
  const summaries = document.getElementsByClassName("repos-summary-header");

  for (let summary of summaries) {
    // removeInjectedButtons(summary);

    let pathElements = summary.getElementsByClassName(
      "body-s secondary-text text-ellipsis"
    );

    if (pathElements.length != 1) {
      console.error("Bad element at main page. CSS may been changed");
      continue;
    }

    const pathElement = pathElements[0];

    let path = getFilePath(pathElement);
    if (path === undefined) {
      continue;
    }

    let lineNumber = getLineNumber(summary);

    // Add button
    addButtons(path, lineNumber, pathElement);
  }
}

///////////
// Extra //
///////////

function addCopyBranchButton() {
  const element = Array.from(document.links).filter((l) =>
    l.href.includes("version")
  );
  element.forEach((e) => {
    removeInjectedButtons(e);

    if (!(options.copybranch?.enabled ?? fallbackOptions.copybranch.enabled)) {
      return;
    }

    const url = new URL(e);
    if (url.searchParams.has("version")) {
      let v = url.searchParams.get("version");
      if (v.startsWith("GB")) {
        // GB means Git branch
        v = v.slice(2);
      } else if (v.startsWith("GC")) {
        // GC means Git commit (hash)
        v = v.slice(2);
      } else {
        // I know there are more, they can be added later
      }

      const btn = document.createElement("button");
      btn.textContent = "Copy";
      btn.style.marginRight = "0.25rem";
      btn.style.marginLeft = "0.25rem";

      btn.className = "injected-button";

      btn.style.backgroundColor = window.getComputedStyle(document.body)[
        "background-color"
      ];
      btn.style.border =
        "1px solid " + window.getComputedStyle(document.body)["color"];
      btn.style.borderRadius = "3px";
      btn.style.color = window.getComputedStyle(document.body)["color"];
      btn.style.padding = "2px 8px";

      btn.addEventListener("click", function (event) {
        navigator.clipboard.writeText(v);
        event.preventDefault();
        event.stopPropagation();
        btn.textContent = "Done";
        setTimeout(function () {
          btn.textContent = "Copy";
        }, 1500);
      });

      e.appendChild(btn);
    }
  });
}

///////////

function observerCallback() {
  const urlParams = new URLSearchParams(window.location.search);

  const re = new RegExp("\\/pullrequest\\/[0-9]+");
  const isPullRequest = re.test(window.location.href);

  // "https://example.visualstudio.com/cat/_git/cat/pullrequest/*",
  // "https://example.visualstudio.com/_git/cat/pullrequest/*",
  // "https://dev.azure.com/example/cat/_git/cat/pullrequest/*",
  if (isPullRequest) {
    generateButtonsMainPagePullRequest();
  }

  // https://example.visualstudio.com/CAT/_git/CAT/pullrequest/74514?_a=files
  // https://dev.azure.com/example/CAT/_git/CAT/pullrequest/74609?path=/src&_a=files
  if (isPullRequest && urlParams.get("_a") === "files") {
    console.log("Got update for summary");
    generateButtonsFileSummary();
  }

  // https://dev.azure.com/example/CAT/_git/CAT/pullrequest/75815?path=/src/Cat/Cat.Shared.Configuration
  if (
    isPullRequest &&
    urlParams.get("_a") === "files" && // Inside Files tab
    urlParams.has("path") // opened a file
  ) {
    console.log("Got update with heading at files");
    generateButtonsChangedFileHeader();
  }

  addCopyBranchButton();
}

function addLocationObserver(callback) {
  // Options for the observer (which mutations to observe)
  const config = { attributes: false, childList: true, subtree: false };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(document.body, config);
}

addLocationObserver(observerCallback);
document.addEventListener("DOMContentLoaded", observerCallback);

// Allow update of page, when something changes, redraw the buttons after some sec
// As there are many updates, have a delay on this function
let timeout = undefined;
let observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    for (let addedNode of mutation.addedNodes) {
      if (addedNode.nodeName != "BUTTON") {
        clearTimeout(timeout);
        timeout = setTimeout(observerCallback, 500);
      }
    }
  }
});
observer.observe(document, { childList: true, subtree: true });
