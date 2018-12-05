import { Component, OnInit } from '@angular/core';
import { NtJwtLoginService, LoginType } from '@bds/nt-jwt-login';
import { getInternautaUrl, BaseUrlType, HOME_ROUTE, SCRIVANIA_ROUTE } from 'src/environments/app-constants';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Babel-Internauta';

  constructor(private loginService: NtJwtLoginService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.loginService.setloginUrl(getInternautaUrl(BaseUrlType.Login));

    this.route.queryParams.subscribe((params: Params) => {
      this.loginService.loggedUser.subscribe(user => {
        if(params.hasOwnProperty('impersonatedUser'))
        {
          this.loginService.login(LoginType.Sso, params['impersonatedUser']).then(result => {
            if(result)
            {
              this.router.navigate([SCRIVANIA_ROUTE]);
            }
            else
              window.close();
          });
        }
      });
    });


  }


}
