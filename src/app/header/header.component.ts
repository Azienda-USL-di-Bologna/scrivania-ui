import { Utente } from "@bds/internauta-model";
import { Component, OnInit, Type } from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import { SCRIVANIA_ROUTE, BABELMAN_URL} from "../../environments/app-constants";
import { JwtLoginService, LoginType, UtenteUtilities } from "@bds/jwt-login";
import { MenuItem } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { HttpClient } from "@angular/common/http";
import { ImpostazioniComponent } from "../impostazioni/impostazioni.component";
// import { ProfiloComponent } from "./profilo/profilo.component";


@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {

  public utenteConnesso: UtenteUtilities;
  cambioUtentePopupVisibile: boolean = false;
  private logoutUrlTemplate: string;
  public itemsMenu: MenuItem[];

  constructor(public router: Router, private loginService: JwtLoginService, public dialogService: DialogService) { }


  onCambioUtenteClick() {
    console.log("header onCambioUtenteClick()");

    this.cambioUtentePopupVisibile = true;
  }

  ngOnInit() {
    console.log("header ngOnInit()");
    this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      if (utente) {
        this.utenteConnesso = utente;
        const jsonParametri = JSON.parse(utente.getUtente().idAzienda.parametri);
        this.logoutUrlTemplate = jsonParametri.logoutUrl as string;
        this.buildMenu();
      }
    });
  }

  onLogout() {

    if (!this.loginService.isUserImpersonated) {
      if (this.loginService.loginMethod !== LoginType.SSO) {
        console.log(this.loginService.loginMethod);
        this.loginService.clearSession();
        window.location.reload();
      } else {
        // prende l'url di logout dall'azienda dell'utente loggato
        this.loginService.clearSession();
        const lastSlash: number = window.location.href.lastIndexOf("/");
        const returnUrl: string = window.location.href.substring(0, lastSlash) + SCRIVANIA_ROUTE;
        window.location.href = this.logoutUrlTemplate.replace("[return-url]", returnUrl);
      }
    } else {
      this.loginService.clearSession();
      window.close();
    }
  }

  onCambioUtente(utente: Utente) {
    console.log("header onCambioUtente");
    this.cambioUtentePopupVisibile = false;

    if (utente) {
      let url: string = "''";

      let user: string;
      let realUser: string;
      if (this.loginService.loginMethod === LoginType.SSO) {
        user = utente.idPersona.codiceFiscale;
        realUser = this.utenteConnesso.getUtente().idPersona.codiceFiscale;
      } else {
        user = utente.username;
        realUser = this.utenteConnesso.getUtente().username;
      }

      if (window.location.href.indexOf("?") >= 0) {
        url = window.location.href.toString() + "&impersonatedUser=" + user + "&realUser=" + realUser;
      } else {
        url = window.location.href.toString() + "?impersonatedUser=" + user + "&realUser=" + realUser;
      }
      window.open(url, "_blank");
    }
  }

  buildMenu() {
    this.itemsMenu = [];
    // this.itemsMenu.push({
    //   label: "Profilo utente",
    //   icon: "pi pi-fw pi-user-plus",
    //   command: () => { this.showSettings(ProfiloComponent, "Profilo utente", "1000px", null, this.utenteConnesso.getUtente()); }
    // });
    this.itemsMenu.push({
      label: "Manuale",
      icon: "pi pi-fw pi-info-circle",
      command: () => { window.open(BABELMAN_URL); }
    });
    this.itemsMenu.push({
      label: "Impostazioni",
      icon: "pi pi-fw pi-cog",
      command: () => { this.showSettings(ImpostazioniComponent, "Impostazioni utente", "480px", "200px", null); }
    });
    if (this.utenteConnesso.isSD() || this.utenteConnesso.getUtente().hasPermessoAvatar) {
      this.itemsMenu.push({
        label: "Cambia utente",
        icon: "pi pi-fw pi-sign-in",
        command: () => { this.onCambioUtenteClick(); }
      });
    }
  }

  showSettings(component: Type<any>, header: string, width: string, height: string, data: any) {
    const ref = this.dialogService.open(component, {
      data: data,
      header: header,
      width: width,
      styleClass: "dialog-class",
      contentStyle: {"max-height": "450px", "min-height": "250px", "overflow": "auto", "height": height, }
    });
    /* ref.onClose.subscribe((form: Impostazioni) => {
      if (form) {
        console.log("FORM = ", form);
      }
    }); */
  }
}
