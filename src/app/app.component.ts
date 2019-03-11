import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, LoginType, NtJwtLoginComponent, UtenteUtilities } from "@bds/nt-jwt-login";
import { getInternautaUrl, BaseUrlType, HOME_ROUTE, SCRIVANIA_ROUTE, LOGIN_ROUTE, APPLICATION } from "src/environments/app-constants";
import { ActivatedRoute, Params, Router, RouterStateSnapshot } from "@angular/router";
import { Utente } from "@bds/ng-internauta-model";
import { GlobalService } from "./services/global.service";
import { MenuItem, DialogService } from "primeng/api";
import { ImpostazioniComponent } from "./impostazioni/impostazioni.component";
import { IntimusClientService } from "./intimus/intimus-client.service";
import { HeaderFeaturesParams } from "@bds/nt-communicator";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {

  title = "Babel-Internauta";
  private deletedImpersonatedUserQueryParams = false;
  public addToMenu: MenuItem[] = [];
  public utenteConnesso: UtenteUtilities;
  public headerFeaturesParams: HeaderFeaturesParams;

  constructor(
    private loginService: NtJwtLoginService,
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private intimusClient: IntimusClientService) {}

  ngOnInit() {
    console.log("inizio onInit() appComponent");
    this.headerFeaturesParams = {
      showCambioUtente: true,
      showLogOut: true,
      showUserFullName: true,
      showUserMenu: true,
      showManuale: true,
      showProfilo: true,
      logoutRoot: SCRIVANIA_ROUTE
    };
    this.loginService.setloginUrl(getInternautaUrl(BaseUrlType.Login));
    this.loginService.setImpostazioniApplicazioniUrl(getInternautaUrl(BaseUrlType.ConfigurazioneImpostazioniApplicazioni));

    this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      if (utente) {
        this.utenteConnesso = utente;
      }
    });

    this.route.queryParams.subscribe((params: Params) => {
      console.log("dentro subscribe, ", params.hasOwnProperty("impersonatedUser"));
      console.log("chiamo login");
      console.log("impersonateUser: ", params["impersonatedUser"]);

      // se nei params c'è la proprietà impersonatedUser, allora pulisci la sessione, setta nella sessionStorage l'utente impersonato
      // e cancellalo dai params
      if (params.hasOwnProperty("impersonatedUser")) {
        this.loginService.clearSession();
        this.loginService.setimpersonatedUser(params["impersonatedUser"].trim(), params["realUser"].trim());

        // eliminazione dai query params di impersonatedUser
        // this.loginService.redirectTo = this.router.routerState.snapshot.url.replace(/(?<=&|\?)impersonatedUser(=[^&]*)?(&|$)/, "");
        this.loginService.redirectTo = this.removeQueryParams(this.router.routerState.snapshot.url, "realUser");
        this.loginService.redirectTo = this.removeQueryParams(this.loginService.redirectTo, "impersonatedUser");
        // if (this.loginService.redirectTo.endsWith("?") || this.loginService.redirectTo.endsWith("&")) {
        //   this.loginService.redirectTo = this.loginService.redirectTo.substr(0, this.loginService.redirectTo.length - 1)
        // }
        console.log("STATE: ", this.loginService.redirectTo);
        this.router.navigate([LOGIN_ROUTE]);
        this.deletedImpersonatedUserQueryParams = true;
      }

      // console.log("this.deletedImpersonatedUserQueryParams: ", this.deletedImpersonatedUserQueryParams);
    });
    this.addToMenu.push({
      label: "Impostazioni",
      icon: "pi pi-fw pi-cog slide-icon",
      command: () => { this.showSettings(ImpostazioniComponent, "Impostazioni utente", "480px", "200px", null); }
    });
    this.addToMenu = Object.assign([], this.addToMenu);
  }

  showSettings(component, header, width, height, data) {
    const ref = this.dialogService.open(component, {
      data: data,
      header: header,
      width: width,
      styleClass: "dialog-class",
      contentStyle: {"max-height": "450px", "min-height": "250px", "overflow": "auto", "height": height, }
    });
  }

  // crea l'utente a partire dai dati "grezzi" UserInfo della risposta
  public buildLoggedUser(userInfo: any): Utente {
    const loggedUser: Utente = new Utente();
    for (const key in userInfo) {
      if (userInfo.hasOwnProperty(key)) {
        loggedUser[key] = userInfo[key];
      }
    }
    return loggedUser;
  }

  public removeQueryParams(url: string, paramToRemove: string): string {
    const splittedUrl: string[] = url.split("?");
    if (splittedUrl.length === 1) {
      return url;
    }
    let purgedQueryParams: string = "";
    const queryParams: string = splittedUrl[1];
    const splittedQueryParams: string[] = queryParams.split("&");
    for (let i = 0; i < splittedQueryParams.length; i++) {
      const splittedQueryParam: string[] = splittedQueryParams[i].split("=");
      if (splittedQueryParam[0] !== paramToRemove) {
        purgedQueryParams += splittedQueryParams[i] + "&";
      }
    }

    if (purgedQueryParams !== "") {
      return splittedUrl[0] + "?" + purgedQueryParams.substr(0, purgedQueryParams.length - 1);
    } else {
      return splittedUrl[0];
    }
  }
}
