import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {LOGOUT_URL} from "../../environments/app-constants";
import { NtJwtLoginService } from '@bds/nt-jwt-login';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(public router: Router, private loginService: NtJwtLoginService) {}

  ngOnInit() {
  }

  onLogout() {

    const loginMethod = sessionStorage.getItem("loginMethod");

     this.loginService.clearSession();

    if (loginMethod !== "sso") {
      console.log(loginMethod);
      this.router.navigate(["/login"]);
    }
    else {
      // window.location.href = "https://gdml.internal.ausl.bologna.it/Shibboleth.sso/Logout";
      window.location.href = LOGOUT_URL;
    }
  }
}
