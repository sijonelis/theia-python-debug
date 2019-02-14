/********************************************************************************
 * Copyright (C) 2019 Red Hat, Inc. and others.
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

import { MaybePromise } from '@theia/core/lib/common/types';

/**
 * PythonExtensionContribution symbol for DI.
 */
export const PythonExtensionContribution = Symbol('PythonExtensionContribution');

/**
 * A contribution point for extensions to jdt.ls.
 */
export interface PythonExtensionContribution {
    /**
     * Returns an array of paths to the python files.
     * The paths should be absolute.
     */
    getExtensionBundles(): MaybePromise<string[]>;
}
