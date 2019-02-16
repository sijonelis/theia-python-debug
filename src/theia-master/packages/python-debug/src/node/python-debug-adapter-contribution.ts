/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

// https://github.com/Microsoft/vscode-java-debug/blob/master/src/configurationProvider.ts adjusted to Theia APIs

// tslint:disable:no-any

import * as path from 'path';
import * as _ from 'lodash';
import { injectable, inject } from 'inversify';
import { DebugConfiguration } from '@theia/debug/lib/common/debug-configuration';
// tslint:disable-next-line:no-implicit-dependencies
import { MessageService, CommandService } from '@theia/core/lib/common';
// tslint:disable-next-line:no-implicit-dependencies
import { QuickPickService, QuickPickItem } from '@theia/core/lib/common/quick-pick-service';
import { AbstractVSCodeDebugAdapterContribution } from '@theia/debug/lib/node/vscode/vscode-debug-adapter-contribution';

export namespace VSCodePythonDebugCommands {
    export const VALIDATE_LAUNCH_CONFIG = 'vscode.python.validateLaunchConfig';
    export const START_DEBUG_SESSION = 'vscode.debug.startDebugging';
}

export interface MainClassOption {
    readonly mainClass: string;
    readonly projectName?: string;
    readonly filePath?: string;
}

interface ValidationResult {
    readonly isValid: boolean;
    readonly message?: string;
}

interface LaunchValidationResponse {
    readonly mainClass: ValidationResult;
    readonly projectName: ValidationResult;
    readonly proposals?: MainClassOption[];
}

@injectable()
export class PythonDebugExtensionContribution extends AbstractVSCodeDebugAdapterContribution {

    constructor() {
        super(
            'python',
            path.join(__dirname, '../../download/python-debug/extension')
        );
    }
}

@injectable()
export class PythonDebugAdapterContribution extends PythonDebugExtensionContribution {

    @inject(CommandService)
    protected readonly commands: CommandService;

    @inject(MessageService)
    protected readonly messages: MessageService;

    @inject(QuickPickService)
    protected readonly quickPickService: QuickPickService;

    async provideDebugConfigurations(workspaceFolderUri?: string): Promise<DebugConfiguration[]> {
        const defaultLaunchConfig = {
            type: 'python',
            name: 'Python: Terminal (integrated)',
            request: 'launch',
            program: '${file}',
            console: 'integratedTerminal'
        };
        const defaultAttachConfig = {
            type: 'python',
            name: 'Attach (Remote Debug)',
            request: 'attach',
            host: 'localhost',
            port: '5678',
            'pathMappings': [
                {
                    'localRoot': '',
                    'remoteRoot': '.'
                }
            ]
        };
        return [defaultLaunchConfig, defaultAttachConfig];
    }
    protected constructLaunchConfigName(mainClass: string, projectName: string | undefined, cache: {
        [name: string]: number
    }): string {
        const prefix = 'Debug (Launch)-';
        let name = prefix + mainClass.substr(mainClass.lastIndexOf('.') + 1);
        if (projectName !== undefined) {
            name += `<${projectName}>`;
        }
        if (cache[name] === undefined) {
            cache[name] = 0;
            return name;
        }
        cache[name] += 1;
        return `${name}(${cache[name]})`;
    }

    async resolveDebugConfiguration(config: DebugConfiguration, workspaceFolderUri?: string): Promise<DebugConfiguration | undefined> {
        try {
            if (config.request === 'launch') {
                const mainClassOption = await this.resolveLaunchConfig(config, workspaceFolderUri);
                if (!mainClassOption || !mainClassOption.mainClass) { // Exit silently if the user cancels the prompt fix by ESC.
                    // Exit the debug session.
                    return;
                }

                config.mainClass = mainClassOption.mainClass;
                config.projectName = mainClassOption.projectName;

            } else if (config.request === 'attach') {
                if (!config.hostName || !config.port) {
                    throw new Error('Please specify the host name and the port of the remote debuggee in the launch.json.');
                }
            } else {
                throw new Error(`Request type "${config.request}" is not supported. Only "launch" and "attach" are supported.`);
            }

            if (Array.isArray(config.args)) {
                config.args = this.concatArgs(config.args);
            }

            if (Array.isArray(config.vmArgs)) {
                config.vmArgs = this.concatArgs(config.vmArgs);
            }

            const debugServerPort = await this.startDebugSession();
            if (debugServerPort) {
                config.debugServer = debugServerPort;
                return config;
            } else {
                throw new Error('Failed to start debug server.');
            }
        } catch (ex) {
            const errorMessage = (ex && ex.message) || ex;
            this.messages.error(String(errorMessage));
            return undefined;
        }
    }

    protected async resolveLaunchConfig(config: DebugConfiguration, workspaceFolderUri?: string): Promise<MainClassOption | undefined> {
        return {
            mainClass: config.mainClass,
            projectName: config.projectName,
        };
    }

    protected async fixMainClass(config: DebugConfiguration, validationResponse: LaunchValidationResponse, workspaceFolderUri?: string): Promise<MainClassOption | undefined> {
        const errors: string[] = [];
        if (!validationResponse.mainClass.isValid) {
            errors.push(String(validationResponse.mainClass.message));
        }
        if (!validationResponse.projectName.isValid) {
            errors.push(String(validationResponse.projectName.message));
        }

        const message = errors.join('\n');
        const proposals = validationResponse.proposals || [];
        if (validationResponse.proposals && validationResponse.proposals.length) {
            const answer = await this.messages.error(message, 'Fix');
            return answer === 'Fix' ? this.selectMainClass(proposals) : undefined;
        }
        throw new Error(message);
    }

    protected async selectMainClass(options: MainClassOption[]): Promise<MainClassOption | undefined> {
        return this.quickPickService.show(this.formatMainClassOptions(options), { placeholder: 'Select main class<project name>' });
    }
    protected formatMainClassOptions(options: MainClassOption[]): QuickPickItem<MainClassOption>[] {
        return options.map(option => {
            let label = option.mainClass;
            let description = `main class: ${option.mainClass}`;
            if (option.projectName) {
                label += `<${option.projectName}>`;
                description += ` | project name: ${option.projectName}`;
            }
            return {
                label,
                description,
                value: option
            };
        });
    }

    protected startDebugSession(): Promise<any> {
        return this.commands.executeCommand<any>(VSCodePythonDebugCommands.START_DEBUG_SESSION);
    }

    /**
     * Converts an array of arguments to a string as the args and vmArgs.
     */
    protected concatArgs(args: any[]): string {
        return _.join(_.map(args, (arg: any): string => {
            const str = String(arg);
            // if it has quotes or spaces, use double quotes to wrap it
            if (/['"\s]/.test(str)) {
                return '"' + str.replace(/(['"\\])/g, '\\$1') + '"';
            }
            return str;

            // if it has only single quotes
        }), ' ');
    }

}
