import { Component, OnInit, OnDestroy, Type } from "@angular/core";
import { NtJwtLoginService, UtenteUtilities, UtilityFunctions} from "@bds/nt-jwt-login";
import { SCRIVANIA_ROUTE, LOGIN_ROUTE, APPLICATION } from "src/environments/app-constants";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { getInternautaUrl, BaseUrlType } from "@bds/ng-internauta-model";
import { MenuItem, PrimeNGConfig } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { ImpostazioniComponent } from "./impostazioni/impostazioni.component";
import { IntimusClientService, PRIMENG_ITA_TRANSALATION } from "@bds/nt-communicator";
import { PopupMessaggiService, HeaderFeaturesConfig } from "@bds/common-components";
import { Subscription } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit, OnDestroy {

  title = "Babel-Internauta";
  private deletedImpersonatedUserQueryParams = false;
  public addToMenu: MenuItem[] = [];
  public utenteConnesso: UtenteUtilities;
  public headerFeaturesConfig: HeaderFeaturesConfig;
  private subscriptions: Subscription[] = [];

  constructor(
    private loginService: NtJwtLoginService,
    private config: PrimeNGConfig,
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private intimusClient: IntimusClientService,
    private popupMessaggiService: PopupMessaggiService
    ) {}

  ngOnInit() {
    this.config.setTranslation(PRIMENG_ITA_TRANSALATION);
    this.headerFeaturesConfig = new HeaderFeaturesConfig();
    this.headerFeaturesConfig.showCambioUtente = true;
    this.headerFeaturesConfig.showLogOut = true;
    this.headerFeaturesConfig.showUserFullName = true;
    this.headerFeaturesConfig.showUserMenu = true;
    this.headerFeaturesConfig.showManuale = true;
    this.headerFeaturesConfig.showDownloadFirmaJR = true;
    this.headerFeaturesConfig.showProfilo = true;
    this.headerFeaturesConfig.logoutRedirectRoute = SCRIVANIA_ROUTE;
    this.headerFeaturesConfig.logoutIconPath = "assets/images/signout.svg";
    this.headerFeaturesConfig.logoutWarning = true;

    this.loginService.setLoginUrl(getInternautaUrl(BaseUrlType.Login));
    this.loginService.setPassTokenGeneratorURL(getInternautaUrl(BaseUrlType.PassTokenGenerator));
    this.loginService.setImpostazioniApplicazioniUrl(getInternautaUrl(BaseUrlType.ConfigurazioneImpostazioniApplicazioni));
    this.loginService.setRefreshSessionInternautaUrl(getInternautaUrl(BaseUrlType.RefreshSessionInternauta));

    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      if (utente) {
        this.utenteConnesso = utente;
        const intimusUrl = getInternautaUrl(BaseUrlType.Intimus);
        this.intimusClient.start(
          intimusUrl,
          APPLICATION,
          this.utenteConnesso.getUtente().idPersona.id,
          this.utenteConnesso.getUtente().aziendaLogin.id,
          this.utenteConnesso.getUtente().aziende.map(a => a.id));
        // if (!this.onTimeOutWarningSubscribbed) {
        // this.subscriptions.push(this.sessionManager.onTimeOutWarning.subscribe(
        //   (countdown: number) => {
        //     this.logoutCountdown = countdown;
        //     this.messageService.clear("logoutWarning");
        //     this.messageService.add({
        //       severity: "warn",
        //       summary: "Attenzione",
        //       detail: `Uscita tra ${this.logoutCountdown} secondi...`,
        //       key: "logoutWarning",
        //       sticky: true,
        //       closable: true
        //     });
        //   }));
        //   this.subscriptions.push(this.sessionManager.onIdleEnd.subscribe(
        //     () => {
        //       this.messageService.clear("logoutWarning");
        //   }));
        //   this.onTimeOutWarningSubscribbed = true;
        // }
      }
    }));

    this.route.queryParams.subscribe((params: Params) => UtilityFunctions.manageChangeUserLogin(params, this.loginService, this.router, LOGIN_ROUTE));
    this.addToMenu.push({
      label: "Impostazioni",
      icon: "pi pi-fw pi-cog slide-icon",
      command: () => { this.showSettings(ImpostazioniComponent, "Impostazioni utente", "480px", "200px", null); }
    });
    this.addToMenu = Object.assign([], this.addToMenu);

  }

  showSettings(component: Type<any>, header: string, width: string, height: string, data: any) {
    const ref = this.dialogService.open(component, {
      data: data,
      header: header,
      width: width,
      styleClass: "dialog-class",
      contentStyle: {"max-height": "450px", "min-height": "250px", "overflow": "auto", "height": height }
    });
  }

  // crea l'utente a partire dai dati "grezzi" UserInfo della risposta
  /* public buildLoggedUser(userInfo: any): Utente {
    const loggedUser: Utente = new Utente();
    for (const key in userInfo) {
      if (userInfo.hasOwnProperty(key)) {
        loggedUser[key] = userInfo[key];
      }
    }
    return loggedUser;
  } */

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }
}
