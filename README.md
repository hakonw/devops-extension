# Vise ting i devops!

## Manual Install

- Open extensions. Like: chrome://extensions/
- Turn on developer mode in the top right corner
- Chose "Load unpacked"
- Chose this folder

## Manual Update

Fetch latest version of the repo and restart the browser

## Usage

By clicking the extension, you can turn on or off features. Buttons should appear in your PR.

## Setup for VSCode.

To work with VSCode, the extension needs the full path. Example: `C:\Users\hakonw\git\devops-extension`

## Setup i Jetbrains platform (Intellij, Rider, Pycharm, ...)

**TO MAKE THIS WORK** you have to install `IDE Remote Control` https://plugins.jetbrains.com/plugin/19991-ide-remote-control (for version 2022.3.1 and up)

Currently, the ports are hardcoded.
Rider is set to port 63342 and Webstorm to 63343.
This can be changed under `File | Settings | Build, Execution, Deployment | Debugger - Built-in Server | Port` - or search after "Built-in server" in all actions.
