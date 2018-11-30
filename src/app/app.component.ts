import { Component, OnInit } from '@angular/core';
import { NtJwtLoginService, LoginType } from '@bds/nt-jwt-login';
import { getInternautaUrl, BaseUrlType } from 'src/environments/app-constants';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Babel-Internauta';

  constructor(private loginService: NtJwtLoginService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.loginService.setloginUrl(getInternautaUrl(BaseUrlType.Login));

    this.route.queryParams.subscribe((params: Params) => {
      this.loginService.loggedUser.subscribe(user => {
        if(params.hasOwnProperty('impersonatedUser'))
        {
          this.loginService.login(LoginType.Local, params['impersonatedUser']).then(result => {
            if(result)
              window.location.reload(true);
            else
              window.close();
          });
        }
      });
    });


  }


}
