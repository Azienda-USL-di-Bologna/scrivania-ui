import { AfterViewInit } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NtJwtLoginService, LoginType, NtJwtLoginComponent } from '@bds/nt-jwt-login';
import { getInternautaUrl, BaseUrlType, HOME_ROUTE, SCRIVANIA_ROUTE } from 'src/environments/app-constants';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Utente } from '@bds/ng-internauta-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Babel-Internauta';
  private deletedImpersonatedUserQueryParams = false;

  constructor(private loginService: NtJwtLoginService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    console.log("inizio onInit() appComponent");
    this.loginService.setloginUrl(getInternautaUrl(BaseUrlType.Login));

  //   this.route.queryParams.subscribe((params: Params) => {
  //     console.log("dentro subscribe, ", params.hasOwnProperty('impersonatedUser'));
   
         
  //       console.log(params['impersonatedUser']);
  //       if (params.hasOwnProperty('impersonatedUser')) {
  //         this.loginService.redirectTo = "/scrivania";

  //       }
  //       //this.ntJwtLoginComponent.doLogin();
  //  });
        // if (sessionStorage.getItem('impersonatedUser') && sessionStorage.getItem('impersonatedUser') != '') {
        //   this.loginService.clearSession();
        // }
    this.route.queryParams.subscribe((params: Params) => {
      console.log("dentro subscribe, ", params.hasOwnProperty('impersonatedUser'));
      console.log("chiamo login");
      console.log("impersonateUser: ", params['impersonatedUser']);

      // se nei params c'è la proprietà impersonatedUser, allora pulisci la sessione, setta nella sessionStorage l'utente impersonato
      // e cancellalo dai params
      if (params.hasOwnProperty('impersonatedUser')) {
      //if (sessionStorage.getItem('impersonatedUser') && sessionStorage.getItem('impersonatedUser') != '') {
        this.loginService.clearSession();
        this.loginService.setimpersonatedUser(params['impersonatedUser']);
        this.loginService.redirectTo = "/scrivania";
        this.router.navigate(["/login"]);

        //sessionStorage.setItem('impersonatedUser', params['impersonatedUser']);
        //delete params['impersonatedUser'];
        //window.history.replaceState("object or string", "Title", window.location.pathname.split("?")[0]);
        this.deletedImpersonatedUserQueryParams = true;
      }
      console.log("this.deletedImpersonatedUserQueryParams: ", this.deletedImpersonatedUserQueryParams);
      // if (this.deletedImpersonatedUserQueryParams) {
      //   window.history.replaceState("object or string", "Title", window.location.pathname.split("?")[0]);
      // }
      //this.ntJwtLoginComponent.doLogin();
   });
  }

  ngAfterViewInit() {
    console.log("dentro ngAfterViewInit");
    //window.history.replaceState("object or string", "Title", window.location.pathname.split("?")[0]);
  }


  // crea l'utente a partire dai dati "grezzi" UserInfo della risposta
  public buildLoggedUser(userInfo: any): Utente {
    let loggedUser: Utente = new Utente();
    for (const key in userInfo) {
      if (userInfo.hasOwnProperty(key)) {
        loggedUser[key] = userInfo[key];
      }
    }
    return loggedUser;
  }

}
