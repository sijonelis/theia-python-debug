# Theia python debug implementation (vscode-python extension)

Usage is similar to other theia debug extensions. Detailed guide can be found at: https://github.com/theia-ide/theia

# Versions
* "python-debug": "next" For theia next builds 
* "python-debug": "1.0.0" for versions below 0.6.1
* "python-debug": "1.0.6" for >=0.6.1

# Known issues:
* Python debugger creates a new terminal window for each debug session and later terminates the same window when terminating the session (either successfully or due to an error). To preserve the debug log after the debug session, console setting in the debug configuration has to be set to "none":

```json
 {
      "type": "python",
      "name": "Python: Terminal (integrated)",
      "request": "launch",
      "program": "${file}",
      "console": "none"
},
```

# Python-specific debug configuration attributes: 
```json
{
  "configurationAttributes": {
    "launch": {
        "properties": {
            "module": {
                "type": "string",
                "description": "Name of the module to be debugged.",
                "default": ""
            },
            "program": {
                "type": "string",
                "description": "Absolute path to the program.",
                "default": "${file}"
            },
            "pythonPath": {
                "type": "string",
                "description": "Path (fully qualified) to python executable. Defaults to the value in settings.json",
                "default": "${config:python.pythonPath}"
            },
            "args": {
                "type": "array",
                "description": "Command line arguments passed to the program",
                "default": [],
                "items": {
                    "type": "string"
                }
            },
            "stopOnEntry": {
                "type": "boolean",
                "description": "Automatically stop after launch.",
                "default": false
            },
            "showReturnValue": {
                "type": "boolean",
                "description": "Show return value of functions when stepping.",
                "default": false
            },
            "console": {
                "enum": [
                    "none",
                    "integratedTerminal",
                    "externalTerminal"
                ],
                "description": "Where to launch the debug target: internal console, integrated terminal, or external terminal.",
                "default": "integratedTerminal"
            },
            "cwd": {
                "type": "string",
                "description": "Absolute path to the working directory of the program being debugged. Default is the root directory of the file (leave empty).",
                "default": "${workspaceFolder}"
            },
            "env": {
                "type": "object",
                "description": "Environment variables defined as a key value pair. Property ends up being the Environment Variable and the value of the property ends up being the value of the Env Variable.",
                "default": {}
            },
            "envFile": {
                "type": "string",
                "description": "Absolute path to a file containing environment variable definitions.",
                "default": "${workspaceFolder}/.env"
            },
            "port": {
                "type": "number",
                "description": "Debug port (default is 0, resulting in the use of a dynamic port).",
                "default": 0
            },
            "host": {
                "type": "string",
                "description": "IP address of the of the local debug server (default is localhost).",
                "default": "localhost"
            },
            "logToFile": {
                "type": "boolean",
                "description": "Enable logging of debugger events to a log file.",
                "default": false
            },
            "redirectOutput": {
                "type": "boolean",
                "description": "Redirect output.",
                "default": true
            },
            "debugStdLib": {
                "type": "boolean",
                "description": "Debug standard library code.",
                "default": false
            },
            "gevent": {
                "type": "boolean",
                "description": "Enable debugging of gevent monkey-patched code.",
                "default": false
            },
            "django": {
                "type": "boolean",
                "description": "Django debugging.",
                "default": false
            },
            "jinja": {
                "enum": [
                    true,
                    false,
                    null
                ],
                "description": "Jinja template debugging (e.g. Flask).",
                "default": null
            },
            "sudo": {
                "type": "boolean",
                "description": "Running debug program under elevated permissions (on Unix).",
                "default": false
            },
            "pyramid": {
                "type": "boolean",
                "description": "Whether debugging Pyramid applications",
                "default": false
            },
            "subProcess": {
                "type": "boolean",
                "description": "Whether to enable Sub Process debugging",
                "default": false
            }
        }
    },
    "attach": {
        "required": [
            "port"
        ],
        "properties": {
            "port": {
                "type": "number",
                "description": "Debug port to attach",
                "default": 0
            },
            "host": {
                "type": "string",
                "description": "IP Address of the of remote server (default is localhost or use 127.0.0.1).",
                "default": "localhost"
            },
            "pathMappings": {
                "type": "array",
                "label": "Path mappings.",
                "items": {
                    "type": "object",
                    "label": "Path mapping",
                    "required": [
                        "localRoot",
                        "remoteRoot"
                    ],
                    "properties": {
                        "localRoot": {
                            "type": "string",
                            "label": "Local source root.",
                            "default": "${workspaceFolder}"
                        },
                        "remoteRoot": {
                            "type": "string",
                            "label": "Remote source root.",
                            "default": ""
                        }
                    }
                },
                "default": []
            },
            "logToFile": {
                "type": "boolean",
                "description": "Enable logging of debugger events to a log file.",
                "default": false
            },
            "redirectOutput": {
                "type": "boolean",
                "description": "Redirect output.",
                "default": true
            },
            "debugStdLib": {
                "type": "boolean",
                "description": "Debug standard library code.",
                "default": false
            },
            "django": {
                "type": "boolean",
                "description": "Django debugging.",
                "default": false
            },
            "jinja": {
                "enum": [
                    true,
                    false,
                    null
                ],
                "description": "Jinja template debugging (e.g. Flask).",
                "default": null
            },
            "subProcess": {
                "type": "boolean",
                "description": "Whether to enable Sub Process debugging",
                "default": false
            }
        }
    }
  }
}
```
