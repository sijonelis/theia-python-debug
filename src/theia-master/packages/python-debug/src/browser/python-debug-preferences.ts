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

// https://github.com/Microsoft/vscode-python/blob/master/package.json

import { interfaces } from 'inversify';
import {
    createPreferenceProxy,
    PreferenceProxy,
    PreferenceService,
    PreferenceContribution,
    PreferenceSchema,
    PreferenceChangeEvent
    // tslint:disable-next-line:no-implicit-dependencies
} from '@theia/core/lib/browser/preferences';

export const pythonDebugPreferenceSchema: PreferenceSchema = {
    'type': 'object',
    'properties': {
        'python.diagnostics.sourceMapsEnabled': {
            'type': 'boolean',
            'default': false,
            'description': 'Enable source map support for meaningful stack traces in error logs.',
            'scope': 'application'
        },
        'python.disableInstallationCheck': {
            'type': 'boolean',
            'default': false,
            'description': 'Whether to check if Python is installed (also warn when using the macOS-installed Python).',
            'scope': 'resource'
        },
        'python.envFile': {
            'type': 'string',
            'description': 'Absolute path to a file containing environment variable definitions.',
            'default': '${workspaceFolder}/.env',
            'scope': 'resource'
        },
        'python.analysis.logLevel': {
            'type': 'string',
            'enum': [
                'Error',
                'Warning',
                'Information',
                'Trace'
            ],
            'default': 'Error',
            'description': 'Defines type of log messages language server writes into the output window.',
            'scope': 'resource'
        },
        'python.pythonPath': {
            'type': 'string',
            'default': 'python',
            'description': 'Path to Python, you can use a custom version of Python by modifying this setting to include the full path.',
            'scope': 'resource'
        },
        'python.terminal.executeInFileDir': {
            'type': 'boolean',
            'default': false,
            'description': 'When executing a file in the terminal, whether to use execute in the file\'s directory, instead of the current open folder.',
            'scope': 'resource'
        },
        'python.terminal.launchArgs': {
            'type': 'array',
            'default': [],
            'description': 'Python launch arguments to use when executing a file in the terminal.',
            'scope': 'resource'
        }
    }
};

export interface PythonDebugConfiguration {
    'python.diagnostics.sourceMapsEnabled': boolean,
    'python.disableInstallationCheck': boolean,
    'python.envFile': string,
    'python.analysis.logLevel'?: 'Error' | 'Warning' | 'Information' | 'Trace'
    'python.pythonPath': string,
    'python.terminal.executeInFileDir': boolean,
    'python.terminal.launchArgs': Array<String>
}

export type PythonDebugPreferenceChange = PreferenceChangeEvent<PythonDebugConfiguration>;

export const PythonDebugPreferences = Symbol('PythonDebugPreferences');
export type PythonDebugPreferences = PreferenceProxy<PythonDebugConfiguration>;

export function createPythonDebugPreferences(preferences: PreferenceService): PythonDebugPreferences {
    return createPreferenceProxy(preferences, pythonDebugPreferenceSchema);
}

export function bindPythonDebugPreferences(bind: interfaces.Bind): void {
    bind(PythonDebugPreferences).toDynamicValue(ctx => {
        const preferences = ctx.container.get<PreferenceService>(PreferenceService);
        return createPythonDebugPreferences(preferences);
    }).inSingletonScope();

    bind(PreferenceContribution).toConstantValue({ schema: pythonDebugPreferenceSchema });
}
