import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { GlobalService } from "src/app/services/global.service";
import { ImpostazioniApplicazioni, Applicazione } from "@bds/ng-internauta-model";
import { ApplicationCustiomization, ScrivaniaVersion } from "src/environments/application_customization";
import { COMMON_PARAMETERS, ATTIVITA_ROUTE } from "src/environments/app-constants";

@Component({
  selector: "app-loading",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.css"]
})
export class LoadingComponent implements OnInit {

  constructor(
    private router: Router,
    private loginService: NtJwtLoginService,
    private globalService: GlobalService) { }

  ngOnInit() {
      this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
        const impostazioniApplicazioni: ImpostazioniApplicazioni = utenteUtilities.getImpostazioniApplicazione();
        if (impostazioniApplicazioni) {
          const impostazioniVisualizzazione: any = JSON.parse(impostazioniApplicazioni.impostazioniVisualizzazione);
          const scrivaniaVersion: string = impostazioniVisualizzazione[ApplicationCustiomization.scrivania.version];
          if (scrivaniaVersion === ScrivaniaVersion.local) {
                this.globalService.commonParameters$.subscribe(commonParameters => {
                const babelApplication: Applicazione = commonParameters[COMMON_PARAMETERS.BABEL_APPLICATION];
                let baseUrl: string;
                if (window.location.hostname === "localhost") {
                    baseUrl = window.location.protocol + "//" + "localhost:8080";
                } else {
                    baseUrl = window.location.protocol + "//" + window.location.host;
                }
                const babelUrl = baseUrl + babelApplication.baseUrl + "/" + babelApplication.indexPage;
                this.loginService.clearSession();
                window.location.assign(babelUrl);
              });
          } else {
            this.router.navigate([ATTIVITA_ROUTE]);
          }
        } else {
          this.router.navigate([ATTIVITA_ROUTE]);
        }
      });
    }

}
