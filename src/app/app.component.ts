import { Component, OnInit } from '@angular/core';
import { NtJwtLoginService, LoginType } from '@bds/nt-jwt-login';
import { getInternautaUrl, BaseUrlType, HOME_ROUTE, SCRIVANIA_ROUTE } from 'src/environments/app-constants';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Utente } from '@bds/ng-internauta-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Babel-Internauta';

  constructor(private loginService: NtJwtLoginService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    console.log("inizio onInit()");
    this.loginService.setloginUrl(getInternautaUrl(BaseUrlType.Login));

    this.route.queryParams.subscribe((params: Params) => {
      console.log("dentro subscribe, ", params.hasOwnProperty('impersonatedUser'));
      if(params.hasOwnProperty('impersonatedUser'))
        {
          console.log("chiamo login");
          console.log(params['impersonatedUser']);
          this.loginService.login(LoginType.Sso, params['impersonatedUser']).then(result => {
            console.log("result login: ", result)
            if(result)
            {
              console.log("sto qui");
              
              // const u: Utente = this.buildLoggedUser(sessionStorage.getItem("loggedUser"));
              // this.loginService.setLoggedUser(u);
              this.router.navigate([SCRIVANIA_ROUTE]);
            }
            // else
            //   window.close();
          });
        }
      
    });


  }

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
