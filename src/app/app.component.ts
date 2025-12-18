import { ApplicationConfig, Component, OnInit, OnDestroy, Type } from "@angular/core";
import { JwtLoginService, UtenteUtilities, UtilityFunctions } from "@bds/jwt-login";
import { SCRIVANIA_ROUTE, LOGIN_ROUTE, APPLICATION, ATTIVITA_ROUTE } from "src/environments/app-constants";
import { ActivatedRoute, NavigationEnd, Params, Router } from "@angular/router";
import { getInternautaUrl, BaseUrlType, CODICI_RUOLO } from "@bds/internauta-model";
import { MenuItem } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { ImpostazioniComponent } from "./impostazioni/impostazioni.component";
import { IntimusClientService, PRIMENG_ITA_TRANSALATION } from "@bds/common-tools";
import { HeaderFeaturesConfig, PopupMessaggiService } from "@bds/common-components";
import { filter, Subscription } from "rxjs";
import { PrimeNG } from "primeng/config";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  public addToMenu: MenuItem[] = []; // E' il menu che si aprirà nell'header
  public headerFeaturesConfig: HeaderFeaturesConfig;
  public utenteConnesso: UtenteUtilities;
  public isSoloPec = false;
  public drawerVisible = false;
  private subscriptions: Subscription[] = [];
  private readonly soloPecRoleCode = (CODICI_RUOLO as any).SP || "SP";

  private pendingSoloPecRedirect = false;

  constructor(
    private loginService: JwtLoginService,
    private config: PrimeNG,
    private route: ActivatedRoute,
    private router: Router,
    private popupMessaggiService: PopupMessaggiService,
    public dialogService: DialogService,
    private intimusClient: IntimusClientService
  ) {}

  ngOnInit() {

    this.subscriptions.push(
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e) => {
          const url = (e as NavigationEnd).urlAfterRedirects || "";
          if (this.pendingSoloPecRedirect && url.startsWith("/attivita")) {
            this.pendingSoloPecRedirect = false;
            this.router.navigateByUrl("/shpeck", { replaceUrl: true });
          }
        })
    );
    

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

    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
        if (utente) {
          this.utenteConnesso = utente;
          this.isSoloPec = this.utenteConnesso.hasRole(this.soloPecRoleCode);
          this.pendingSoloPecRedirect = this.isSoloPec;

          const intimusUrl = getInternautaUrl(BaseUrlType.Intimus);
          this.intimusClient.start(
            intimusUrl,
            APPLICATION,
            this.utenteConnesso.getUtente().idPersona.id,
            this.utenteConnesso.getUtente().aziendaLogin.id,
            this.utenteConnesso.getUtente().aziende.map((a) => a.id)
          );
        }
      })
    );

    this.route.queryParams.subscribe((params: Params) =>
      UtilityFunctions.manageChangeUserLogin(params, this.loginService, this.router, LOGIN_ROUTE)
    );
    this.addToMenu.push({
      label: "Impostazioni",
      icon: "pi pi-fw pi-cog slide-icon",
      command: () => {
        this.showSettings(ImpostazioniComponent, "Impostazioni utente", "30rem", "21.875rem", null);
      },
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
      contentStyle: { "max-height": "28.125rem", "min-height": "15.625rem", overflow: "auto", height: height },
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
