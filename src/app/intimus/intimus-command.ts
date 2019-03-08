export class IntimusCommand {
    private _command: IntimusCommands;
    private _params; any;

    constructor(command: string, params: any) {
        this._command = IntimusCommands[command];
        this._params = params;
    }

    public get command(): IntimusCommands {
        return this._command;
    }

    public set command(command: IntimusCommands) {
        this._command = command;
    }

    public get params(): any {
        return this._params;
    }

    public set params(params: any) {
        this._params = params;
    }
}

export enum IntimusCommands {
    RefreshAttivita,
    ShowMessage
}
