import * as _ from 'lodash';
import { injectable, inject } from "inversify";
// tslint:disable:no-implicit-dependencies
import URI from '@theia/core/lib/common/uri';
import { CommandContribution, CommandRegistry, Command, MenuContribution, MenuModelRegistry, MessageService } from "@theia/core/lib/common";
import { FrontendApplicationContribution, CommonMenus } from "@theia/core/lib/browser";
import { Workspace, Languages } from '@theia/languages/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser';
// tslint:enable:no-implicit-dependencies
import { DebugConfiguration } from '@theia/debug/lib/common/debug-common';
import { DebugSession } from '@theia/debug/lib/browser/debug-session';
import { DebugSessionManager } from '@theia/debug/lib/browser/debug-session-manager';
import { DebugConfigurationManager } from '@theia/debug/lib/browser/debug-configuration-manager';


import { PythonDebugPreferences } from './python-debug-preferences';

export const PythonDebugCommand = {
    id: 'PythonDebug.command',
    label: "Shows a message"
};

export namespace PythonDebugCommands {
    export const RUN: Command = {
        id: 'python.runTestNode' // VS Python debugger commands @ 156
    };
    export const DEBUG: Command = {
        id: 'python.runTestNode'
    };
}

export namespace PythonDebugSession {
    export function is(session: DebugSession): boolean {
        return session.configuration.type === 'python';
    }
}

@injectable()
export class PythonDebugFrontendContribution implements FrontendApplicationContribution, CommandContribution {

    @inject(Workspace)
    protected readonly workspace: Workspace;

    @inject(Languages)
    protected readonly languages: Languages;

    @inject(CommandRegistry)
    protected readonly commands: CommandRegistry;

    // @inject(MessageService)
    // private readonly messageService: MessageService;

    @inject(MessageService)
    protected readonly messages: MessageService;

    @inject(DebugSessionManager)
    protected readonly sessions: DebugSessionManager;

    @inject(PythonDebugPreferences)
    protected readonly preferences: PythonDebugPreferences;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(DebugConfigurationManager)
    protected readonly configurations: DebugConfigurationManager;

    protected readonly suppressedReasons = new Set<string>();

    initialize(): void {
        this.sessions.onDidCreateDebugSession(session => {
            if (PythonDebugSession.is(session) && this.sessions.sessions.filter(PythonDebugSession.is).length === 1) {
                this.updateDebugSettings();
            }
        });
        this.sessions.onDidReceiveDebugSessionCustomEvent(({ session, event, body }) => {
            if (session.configuration.type !== 'python') {
                return;
            }
            if (event === 'usernotification' && body) {
                return this.handleUserNotification(body);
            }
        });
        this.sessions.onDidDestroyDebugSession(session => {
            if (session.configuration.type === 'python') {
                this.suppressedReasons.clear();
            }
        });
        const { configurations } = this.workspace;
        if (configurations) {
            configurations.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('python.debug')) {
                    this.dirtyDebugSettings = true;
                    if (this.sessions.sessions.some(PythonDebugSession.is)) {
                        this.updateDebugSettings();
                    }
                }
            });
        }
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(PythonDebugCommands.RUN, {
            execute: (mainClass, projectName, uri) => this.runProgram(mainClass, projectName, uri)
        });
        commands.registerCommand(PythonDebugCommands.DEBUG, {
            execute: (mainClass, projectName, uri) => this.runProgram(mainClass, projectName, uri, false)
        });
        commands.registerCommand(PythonDebugCommand, {
            execute: () => this.messages.info('Hello World!')
        });
    }

    protected async runProgram(mainClass: string, projectName: string, uri: string, noDebug: boolean = true): Promise<void> {
        const workspaceFolder = this.workspaceService.getWorkspaceRootUri(new URI(uri));
        const workspaceFolderUri = workspaceFolder && workspaceFolder.toString();
        const configuration = this.constructDebugConfig(mainClass, projectName, workspaceFolderUri);
        configuration.projectName = projectName;
        configuration.noDebug = noDebug;
        await this.sessions.start({
            configuration,
            workspaceFolderUri
        });
    }

    // todo fix codelens implementation
    protected constructDebugConfig(mainClass: string, projectName: string, workspaceFolderUri?: string): DebugConfiguration {
        return _.cloneDeep(this.findConfiguration(mainClass, projectName).next().value || {
            type: 'python',
            name: `CodeLens (Launch) - ${mainClass.substr(mainClass.lastIndexOf('.') + 1)}`,
            request: 'launch',
            cwd: workspaceFolderUri ? '${workspaceFolder}' : undefined,
            console: 'internalConsole',
            stopOnEntry: false,
            mainClass,
            args: '',
            projectName,
        });
    }

    protected * findConfiguration(mainClass: string, projectName: string): IterableIterator<DebugConfiguration> {
        for (const option of this.configurations.all) {
            const { configuration } = option;
            if (configuration.mainClass === mainClass && _.toString(configuration.projectName) === _.toString(projectName)) {
                yield configuration;
            }
        }
        for (const option of this.configurations.all) {
            const { configuration } = option;
            if (configuration.mainClass === mainClass && !configuration.projectName) {
                yield configuration;
            }
        }
    }

    protected dirtyDebugSettings = true;
    protected async updateDebugSettings(): Promise<void> {
        if (!this.dirtyDebugSettings) {
            return;
        }
        this.dirtyDebugSettings = false;
        const { configurations } = this.workspace;
        if (configurations) {
            const configuration = configurations.getConfiguration('python.debug');
            const logLevel = this.convertLogLevel(configuration.logLevel || '');
            if (configuration.settings && Object.keys(configuration.settings).length) {
                await this.commands.executeCommand('vscode.python.updateDebugSettings', JSON.stringify({
                    ...configuration.settings, logLevel
                }));
            }
        }
    }

    protected convertLogLevel(commonLogLevel: string) {
        // convert common log level to python log level
        switch (commonLogLevel.toLowerCase()) {
            case 'verbose':
                return 'Trace';
            case 'warn':
                return 'Warning';
            case 'error':
                return 'Error';
            case 'info':
                return 'Information';
            default:
                return 'Trace';
        }
    }

    protected async handleUserNotification({ notificationType, message }: { notificationType?: string, message: string }): Promise<void> {
        if (notificationType === 'Error') {
            await this.messages.error(message);
        } else if (notificationType === 'Warning') {
            await this.messages.warn(message);
        } else {
            await this.messages.info(message);
        }
    }
}


@injectable()
export class PythonDebugMenuContribution implements MenuContribution {
    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: PythonDebugCommand.id,
            label: 'Say Hello!!'
        });
    }
}
