import { Component, OnInit } from '@angular/core';
import { NtJwtLoginService } from '@bds/nt-jwt-login';
import { getInternautaUrl, BaseUrlType } from 'src/environments/app-constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Babel-internauta';

  constructor(private loginService: NtJwtLoginService) {}

  ngOnInit() {
    this.loginService.setloginUrl(getInternautaUrl(BaseUrlType.Login));
  }


}
