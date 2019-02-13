import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService } from "@theia/core/lib/common";
import { CommonMenus } from "@theia/core/lib/browser";

export const PythonDebugCommand = {
    id: 'PythonDebug.command',
    label: "Shows a message"
};

@injectable()
export class PythonDebugCommandContribution implements CommandContribution {

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(PythonDebugCommand, {
            execute: () => this.messageService.info('Hello World!')
        });
    }
}

@injectable()
export class PythonDebugMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: PythonDebugCommand.id,
            label: 'Say Hello!'
        });
    }
}
