// Saves options to chrome.storage
function save_options() {
  const cards = document.getElementsByClassName("r-button");

  const savedCards = [];

  for (const card of Array.from(cards)) {
    if (card.className.includes("c-template")) {
      continue;
    }

    const name = card.getElementsByClassName("r-name")[0].value;
    const addPrefix = card.getElementsByClassName("r-prefix")[0].value;
    const ignorePrefix =
      card.getElementsByClassName("r-ignore-prefix")[0].value;
    const fileExtensions = card.getElementsByClassName("r-files")[0].value;
    const useVSCode = card.getElementsByClassName("r-use-vs")[0].checked;
    const jetbrainsPort =
      card.getElementsByClassName("r-jetbrains-port")[0].value;
    savedCards.push({
      name: name,
      addPrefix: addPrefix,
      ignorePrefix: ignorePrefix,
      fileExtensions: fileExtensions,
      useVSCode: useVSCode,
      jetbrainsPort: jetbrainsPort,
    });
  }

  var copybranchEnabled = document.getElementById("copybranch-enabled").checked;
  chrome.storage.sync.set(
    {
      options: {
        cards: savedCards,
        copyBranch: copybranchEnabled,
      },
    },
    function () {
      // Update status to let user know options were saved.
      var status = document.getElementById("save");
      console.log("Options saved");
      status.textContent = "Options saved";
      setTimeout(function () {
        status.textContent = "Save";
      }, 750);
    }
  );
}

const defaultOptions = [
  {
    name: "VSCode",
    addPrefix: "C:\\Users\\hakon\\git\\devops-extension",
    ignorePrefix: "",
    fileExtensions: "ts,js,html,json,css,scss",
    useVSCode: true,
    jetbrainsPort: "",
  },
  {
    name: "Rider",
    addPrefix: "",
    ignorePrefix: "",
    fileExtensions: "cs,vb,sql,txt,sql,csproj",
    useVSCode: false,
    jetbrainsPort: "63342",
  },
  {
    name: "Webstorm",
    addPrefix: "",
    ignorePrefix: "src/devops-extension/frontend",
    fileExtensions: "ts,js,html,json,css,scss",
    useVSCode: false,
    jetbrainsPort: "63343",
  },
];

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value
  chrome.storage.sync.get(
    {
      options: {
        cards: defaultOptions,
        copyBranch: true,
      },
    },

    function (items) {
      document.getElementById("copybranch-enabled").checked =
        items.options.copyBranch;

      for (const card of Array.from(items.options.cards)) {
        const cloned = addCustomButton();

        const name = cloned.getElementsByClassName("r-name")[0];
        const addPrefix = cloned.getElementsByClassName("r-prefix")[0];
        const ignorePrefix =
          cloned.getElementsByClassName("r-ignore-prefix")[0];
        const fileExtensions = cloned.getElementsByClassName("r-files")[0];
        const useVSCode = cloned.getElementsByClassName("r-use-vs")[0];
        const jetbrainsPort =
          cloned.getElementsByClassName("r-jetbrains-port")[0];

        name.value = card.name;
        addPrefix.value = card.addPrefix;
        ignorePrefix.value = card.ignorePrefix;
        fileExtensions.value = card.fileExtensions;
        useVSCode.checked = card.useVSCode;
        jetbrainsPort.value = card.jetbrainsPort;
      }
    }
  );
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);

function addCustomButton() {
  const refEl = document.getElementsByClassName("c-template")[0];
  const clone = refEl.cloneNode(true);
  clone.classList.remove("c-template");
  refEl.parentElement.append(clone);

  clone
    .getElementsByClassName("btn-outline-danger")[0]
    .addEventListener("click", () => remove(clone));

  return clone;
}

document.getElementById("addButton").addEventListener("click", addCustomButton);

function remove(t) {
  t.remove();
}
