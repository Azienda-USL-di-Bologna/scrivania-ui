import { Component, OnInit, OnDestroy, Type } from "@angular/core";
import { JwtLoginService, UtenteUtilities, UtilityFunctions} from "@bds/jwt-login";
import { SCRIVANIA_ROUTE, LOGIN_ROUTE, APPLICATION } from "src/environments/app-constants";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { getInternautaUrl, BaseUrlType } from "@bds/internauta-model";
import { MenuItem, PrimeNGConfig } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { ImpostazioniComponent } from "./impostazioni/impostazioni.component";
import { IntimusClientService, PRIMENG_ITA_TRANSALATION } from "@bds/common-tools";
import { HeaderFeaturesConfig } from "@bds/common-components";
import { Subscription } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy {
  public addToMenu: MenuItem[] = []; // E' il menu che si aprirà nell'header
  public headerFeaturesConfig: HeaderFeaturesConfig; 
  public utenteConnesso: UtenteUtilities;
  private subscriptions: Subscription[] = [];

  constructor(
    private loginService: JwtLoginService,
    private config: PrimeNGConfig,
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private intimusClient: IntimusClientService
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

  /**
   * Questa funzione viene passata all'header come comando di risposta al click sulla volce impostazioni.
   * Si occupa di aprire un dialog dinamico di primeng in cui è caricato il componente passato (ImpostazioniComponent)
   * @param component 
   * @param header 
   * @param width 
   * @param height 
   * @param data 
   */
  private showSettings(component: Type<any>, header: string, width: string, height: string, data: any) {
    const ref = this.dialogService.open(component, {
      data: data,
      header: header,
      width: width,
      styleClass: "dialog-class",
      contentStyle: {"max-height": "450px", "min-height": "250px", "overflow": "auto", "height": height }
    });
  }

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }
}
