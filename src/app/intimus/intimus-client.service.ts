import { Injectable, OnInit } from "@angular/core";
import { getInternautaUrl, BaseUrlType, APPLICATION } from "src/environments/app-constants";
import { Utente } from "@bds/ng-internauta-model";
import * as Primus from "../../assets/primus.js";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Subject, Observable } from "rxjs";
import { IntimusCommands, IntimusCommand } from "./intimus-command.js";
import * as Bowser from "bowser";

@Injectable({
  providedIn: "root"
})
export class IntimusClientService  {

  private _command$: Subject<IntimusCommand> = new Subject();

  constructor(private loginService: NtJwtLoginService) {
    this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
      if (utenteUtilities) {
        this.initializeIntimus(utenteUtilities.getUtente());
      }
    });
  }

  private initializeIntimus(utente: Utente) {
    const primusUrl = getInternautaUrl(BaseUrlType.Intimus);
    const primus = Primus.connect(primusUrl, {
      reconnect: {
        maxDelay: 10000 // Number: The max delay for a reconnect retry.
        , minDelay: 500 // Number: The minimum delay before we reconnect.
        , retries: Infinity // Number: How many times should we attempt to reconnect.
      }
    });

    primus.on("data", data => {
      console.log("**********Received a new message from the server*************", data);
      if (data.command === "registerClient") {
        // console.log("Received a new message from the server", data);
        this.registerClient(primus, utente);
      } else if (data && data.command) {
        const cmd = data.command + "&params=" + JSON.stringify(data.params);
        const intimusCommand: IntimusCommand = new IntimusCommand(data.command, data.params);
        this.pushCommand(intimusCommand);
         // console.log("Received command from the server", cmd);
      } else {
        // console.log(JSON.stringify(data));
      }
    });

    primus.on("open", () => {
      this.registerClient(primus, utente);
    });
  }

  private registerClient(primus: Primus, utente: Utente) {
    const clientInfo = {
      command: "registerClient",
      params: {
        user: utente.idPersona.id,
        id_azienda: utente.idAzienda.id,
        application: APPLICATION,
        browserinfo: Bowser.getParser(window.navigator.userAgent),
        ip: null,
        resolution: this.getScreenResolution()
      }
    };
    primus.write(clientInfo);
  }

  private getScreenResolution() {
    if (Math.abs(window.orientation as number) - 90 === 0) {
      return screen.height + "x" + screen.width;
    } else {
      return screen.width + "x" + screen.height;
    }
  }

  private pushCommand(intimusCommand: IntimusCommand) {
    this._command$.next(intimusCommand);
  }

  public get command$(): Observable<IntimusCommand> {
    return this._command$.asObservable();
  }
}
