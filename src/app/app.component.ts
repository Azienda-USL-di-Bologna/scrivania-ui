import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, UtenteUtilities, UtilityFunctions} from "@bds/nt-jwt-login";
import { getInternautaUrl, BaseUrlType, SCRIVANIA_ROUTE, LOGIN_ROUTE, APPLICATION } from "src/environments/app-constants";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Utente } from "@bds/ng-internauta-model";
import { MenuItem, DialogService } from "primeng/api";
import { ImpostazioniComponent } from "./impostazioni/impostazioni.component";
import { IntimusClientService } from "./intimus/intimus-client.service";
import { HeaderFeaturesConfig } from "@bds/primeng-plugin";
import { SessionManager } from "./services/session-manager.service";

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
  public headerFeaturesConfig: HeaderFeaturesConfig;

  constructor(
    private loginService: NtJwtLoginService,
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private intimusClient: IntimusClientService,
    private sessionManager: SessionManager) {}

  ngOnInit() {
    console.log("inizio onInit() appComponent");

    this.headerFeaturesConfig = new HeaderFeaturesConfig();
    this.headerFeaturesConfig.showCambioUtente = true;
    this.headerFeaturesConfig.showLogOut = true;
    this.headerFeaturesConfig.showUserFullName = true;
    this.headerFeaturesConfig.showUserMenu = true;
    this.headerFeaturesConfig.showManuale = true;
    this.headerFeaturesConfig.showProfilo = true;
    this.headerFeaturesConfig.logoutRedirectRoute = SCRIVANIA_ROUTE;
    this.headerFeaturesConfig.logoutIconPath = "assets/images/signout.svg";

    this.loginService.setloginUrl(getInternautaUrl(BaseUrlType.Login));
    this.loginService.setImpostazioniApplicazioniUrl(getInternautaUrl(BaseUrlType.ConfigurazioneImpostazioniApplicazioni));

    this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      if (utente) {
        this.utenteConnesso = utente;
      }
    });

    this.route.queryParams.subscribe((params: Params) => UtilityFunctions.manageChangeUserLogin(params, this.loginService, this.router, LOGIN_ROUTE));
    this.addToMenu.push({
      label: "Impostazioni",
      icon: "pi pi-fw pi-cog slide-icon",
      command: () => { this.showSettings(ImpostazioniComponent, "Impostazioni utente", "480px", "200px", null); }
    });
    this.addToMenu = Object.assign([], this.addToMenu);

    // this.sessionManager.setExpireTokenOnIdle(10);
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
}
