import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, LoginType, NtJwtLoginComponent } from "@bds/nt-jwt-login";
import { getInternautaUrl, BaseUrlType, HOME_ROUTE, SCRIVANIA_ROUTE, LOGIN_ROUTE } from "src/environments/app-constants";
import { ActivatedRoute, Params, Router, RouterStateSnapshot } from "@angular/router";
import { Utente } from "@bds/ng-internauta-model";
import { GlobalService } from "./services/global.service";
import { MenuItem, DialogService } from "primeng/api";
import { ImpostazioniComponent } from "./header/impostazioni/impostazioni.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {

  title = "Babel-Internauta";
  private deletedImpersonatedUserQueryParams = false;
  public addToMenu: MenuItem[] = [];

  constructor(
    private loginService: NtJwtLoginService,
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService) {}

  ngOnInit() {
    console.log("inizio onInit() appComponent");
    this.loginService.setloginUrl(getInternautaUrl(BaseUrlType.Login));
    this.loginService.setImpostazioniApplicazioniUrl(getInternautaUrl(BaseUrlType.ConfigurazioneImpostazioniApplicazioni));

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
    command: () => { this.showSettings(); }
  });
   this.addToMenu = Object.assign([], this.addToMenu);
   console.log("addTo menu: ", this.addToMenu);
  }

  showSettings() {
    const ref = this.dialogService.open(ImpostazioniComponent, {
      header: "Impostazioni utente",
      width: "480px",
      styleClass: "dialog-class",
      contentStyle: {"max-height": "350px", "overflow": "auto", "height": "200px"}
    });
    /* ref.onClose.subscribe((form: Impostazioni) => {
      if (form) {
        console.log("FORM = ", form);
      }
    }); */
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
    for (let i = 0; i < splittedQueryParams.length; i ++) {
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
