import { Utente, Persona } from "@bds/ng-internauta-model";
import { Component, OnInit, ViewChild } from "@angular/core";
import {Router} from "@angular/router";
import {getInternautaUrl, BaseUrlType, HOME_ROUTE} from "../../environments/app-constants";
import { NtJwtLoginService, LoginType } from "@bds/nt-jwt-login";
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

    window.open(this.router.serializeUrl(this.router.createUrlTree(['.'], { queryParams: { 'impersonatedUser': persona.codiceFiscale } })));
  }
}
