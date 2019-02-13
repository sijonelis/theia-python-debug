/**
 * Generated using theia-extension-generator
 */

import { PythonDebugCommandContribution, PythonDebugMenuContribution } from './python-debug-frontend-contribution';
import {
    CommandContribution,
    MenuContribution
} from "@theia/core/lib/common";
import { bindPythonDebugPreferences } from './python-debug-preferences';

import { ContainerModule } from "inversify";

export default new ContainerModule(bind => {
    // add your contribution bindings here
    bindPythonDebugPreferences(bind);
    bind(CommandContribution).to(PythonDebugCommandContribution);
    bind(MenuContribution).to(PythonDebugMenuContribution);
    
});
