import { Utente } from "@bds/ng-internauta-model";
import { Component, OnInit } from "@angular/core";
import {Router} from "@angular/router";
import {LOGOUT_URL} from "../../environments/app-constants";
import { NtJwtLoginService } from "@bds/nt-jwt-login";
import { Observable } from "rxjs";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {

  public utenteConnesso: Utente;
  public $utenteConnesso: Observable<Utente>;

  constructor(public router: Router, private loginService: NtJwtLoginService) {}

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
      window.location.href = LOGOUT_URL;
    }
  }
}
