/**
 * Generated using theia-extension-generator
 */

import { ContainerModule } from "inversify";
// tslint:disable:no-implicit-dependencies
import { CommandContribution } from "@theia/core/lib/common";
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
// tslint:enable:no-implicit-dependencies
import { bindPythonDebugPreferences } from './python-debug-preferences';
import { PythonDebugFrontendContribution } from './python-debug-frontend-contribution';

export default new ContainerModule(bind => {
    bindPythonDebugPreferences(bind);
    bind(PythonDebugFrontendContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(PythonDebugFrontendContribution);
    bind(FrontendApplicationContribution).toService(PythonDebugFrontendContribution);
});
