import { Utente, Persona } from "@bds/ng-internauta-model";
import { Component, OnInit, ViewChild } from "@angular/core";
import {Router} from "@angular/router";
import {getInternautaUrl, BaseUrlType} from "../../environments/app-constants";
import { NtJwtLoginService, LoginType } from "@bds/nt-jwt-login";
import { Observable } from "rxjs";
import { FunctionExpr, TransitiveCompileNgModuleMetadata } from "@angular/compiler";
import { Dialog, DialogModule } from "primeng/dialog";
import { Header } from "primeng/components/common/shared";
import { HttpClient, HttpParams } from "@angular/common/http";


@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {

  public utenteConnesso: Utente;
  public $utenteConnesso: Observable<Utente>;
  cambioUtentePopupVisibile: boolean = false;

  constructor(public router: Router, private loginService: NtJwtLoginService, private http: HttpClient) { }


  onCambioUtenteClick() {
    
    this.cambioUtentePopupVisibile = true;
  }

  ngOnInit() {
    this.$utenteConnesso = this.loginService.loggedUser;
    this.$utenteConnesso.subscribe((utente: Utente) => {
      this.utenteConnesso = utente;
    });
  }

  onLogout() {

    const loginMethod = sessionStorage.getItem("loginMethod");

     this.loginService.clearSession();

    if (loginMethod !== "sso") {
      console.log(loginMethod);
      this.router.navigate(["/login"]);
    } else {
      // window.location.href = "https://gdml.internal.ausl.bologna.it/Shibboleth.sso/Logout";
      window.location.href = getInternautaUrl(BaseUrlType.Logout);
    }
  }

  onCambioUtente(persona: Persona) {
    this.cambioUtentePopupVisibile = false;

    console.log(persona.codiceFiscale);
    this.loginService.clearSession();
    this.loginService.login(LoginType.Sso, persona.codiceFiscale).then(result => {
      window.location.reload(true);
    });
  }
}
