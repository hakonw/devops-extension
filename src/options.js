// Saves options to chrome.storage
function save_options() {
  var webstormEnabled = document.getElementById("webstorm-enabled").checked;
  var webstormIgnorePrefix = document.getElementById(
    "webstorm-ignore-prefix"
  ).value;

  var riderEnabled = document.getElementById("rider-enabled").checked;
  var riderIgnorePrefix = document.getElementById("rider-ignore-prefix").value;

  var vscodeEnabled = document.getElementById("vscode-enabled").checked;
  var vscodeAddPrefix = document.getElementById("vscode-add-prefix").value;

  var copybranchEnabled = document.getElementById("copybranch-enabled").checked;

  chrome.storage.sync.set(
    {
      options: {
        webstorm: {
          enabled: webstormEnabled,
          ignorePrefix: webstormIgnorePrefix,
        },
        rider: {
          enabled: riderEnabled,
          ignorePrefix: riderIgnorePrefix,
        },
        vscode: {
          enabled: vscodeEnabled,
          addPrefix: vscodeAddPrefix,
        },
        copybranch: {
          enabled: copybranchEnabled,
        },
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

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value
  chrome.storage.sync.get(
    {
      options: {
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
      },
    },

    function (items) {
      console.log(items);

      document.getElementById("webstorm-enabled").checked =
        items.options.webstorm.enabled;
      document.getElementById("rider-enabled").checked =
        items.options.rider.enabled;
      document.getElementById("vscode-enabled").checked =
        items.options.vscode.enabled;
      document.getElementById("copybranch-enabled").checked =
        items.options.copybranch.enabled;

      document.getElementById("webstorm-ignore-prefix").value =
        items.options.webstorm.ignorePrefix;
      document.getElementById("rider-ignore-prefix").value =
        items.options.rider.ignorePrefix;
      document.getElementById("vscode-add-prefix").value =
        items.options.vscode.addPrefix;

      console.log(document.getElementById("rider-enabled").checked);
    }
  );
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
