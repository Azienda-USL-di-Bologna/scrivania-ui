import { HttpClient } from "@angular/common/http";
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { JWTModuleConfig, JwtLoginService, LoginType } from "@bds/jwt-login";
import { Subscription } from "rxjs";

@Component({
    selector: "login-admin",
    templateUrl: "./login-admin.component.html",
    styleUrls: ["./login-admin.component.scss"],
    standalone: false
})
  export class LoginAdminComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[] = [];

    public errorMessage: string;
  
    constructor(
        public httpClient: HttpClient,
        private router: Router,
        private loginService: JwtLoginService,
        @Inject("loginConfig") private loginConfig: JWTModuleConfig
      ) {
        console.log("constructor() JwtLoginComponent");
      }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        
    }

    public loginPost(form: NgForm) {
        this.errorMessage = "";

        // tslint:disable-next-line:max-line-length
        this.loginService
          .login(
            LoginType.Local,
            form.value.username,
            form.value.password,
            form.value.realUser,
            null,
            null,
            null
          )
          .subscribe(
            (utente) => {
              this.execRedirect();
              this.loginService.setLoggedUser$(utente);
            },
            (err) => {
              this.errorMessage =
                "Errore: credenziali errate o utente non abilitato";
            }
          );
      }
    
      // esegui il redirect
      private execRedirect() {
        const redirectTo: string = "/attivita"
        if (redirectTo) {
          //sessionStorage.removeItem("redirectTo");
          this.router.navigateByUrl(redirectTo);
        } else {
          this.router.navigate([this.loginConfig.homeComponentRoute], {
            queryParams: { reset: true },
          });
        }
      }
  }  