import { Utente, Persona } from "@bds/ng-internauta-model";
import { Component, OnInit, ViewChild } from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {getInternautaUrl, BaseUrlType, HOME_ROUTE, SCRIVANIA_ROUTE} from "../../environments/app-constants";
import { NtJwtLoginService, LoginType, UtenteUtilities } from "@bds/nt-jwt-login";
import { Observable } from "rxjs";
import { FunctionExpr, TransitiveCompileNgModuleMetadata } from "@angular/compiler";
import { Dialog, DialogModule } from "primeng/dialog";
import { Header } from "primeng/components/common/shared";
import { HttpClient, HttpParams } from "@angular/common/http";
import { HomepageComponent } from "../pagine/homepage/homepage.component";


@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {

  public utenteConnesso: UtenteUtilities;
  cambioUtentePopupVisibile: boolean = false;
  private logoutUrlTemplate: string;

  constructor(public router: Router, private loginService: NtJwtLoginService, private http: HttpClient, private route: ActivatedRoute) { }


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
}
