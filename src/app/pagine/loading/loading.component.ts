import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { JwtLoginService, UtenteUtilities, UtilityFunctions } from "@bds/jwt-login";
import { GlobalService } from "src/app/services/global.service";
import { ImpostazioniApplicazioni, Applicazione, Azienda } from "@bds/internauta-model";
import { ApplicationCustiomization, ScrivaniaVersion } from "src/environments/application_customization";
import { COMMON_PARAMETERS, ATTIVITA_ROUTE } from "src/environments/app-constants";
import { CODICI_RUOLO } from "@bds/internauta-model";

@Component({
  selector: "app-loading",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.scss"],
  standalone: false,
})
export class LoadingComponent implements OnInit {
  private readonly soloPecRoleCode = (CODICI_RUOLO as any).SP || "SP";

  constructor(private router: Router, private loginService: JwtLoginService, private globalService: GlobalService) {}

  ngOnInit() {
    this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
      if (utenteUtilities) {
        if (utenteUtilities.hasRole(this.soloPecRoleCode)) {
          this.router.navigate(["/shpeck"]);
          return;
        }
        const impostazioniApplicazioni: ImpostazioniApplicazioni = utenteUtilities.getImpostazioniApplicazione();
        if (impostazioniApplicazioni) {
          const impostazioniVisualizzazione: any = JSON.parse(impostazioniApplicazioni.impostazioniVisualizzazione);
          const scrivaniaVersion: string = impostazioniVisualizzazione[ApplicationCustiomization.scrivania.version];
          if (scrivaniaVersion === ScrivaniaVersion.local) {
            this.globalService.commonParameters$.subscribe((commonParameters) => {
              const babelApplication: Applicazione = commonParameters[COMMON_PARAMETERS.BABEL_APPLICATION];
              let baseUrl: string;
              if (window.location.hostname === "localhost") {
                baseUrl = window.location.protocol + "//" + "localhost:8080";
              } else {
                // baseUrl = window.location.protocol + "//" + window.location.host;
                baseUrl = utenteUtilities.getUtente().aziendaLogin["baseUrl" as keyof Azienda];
              }

              const babelUrl =
                baseUrl +
                babelApplication.baseUrl +
                "/" +
                babelApplication.indexPage +
                "?CMD=scrivania_local" +
                "&from=INTERNAUTA" +
                "&redirect=true" +
                "&utenteImpersonato=" +
                utenteUtilities.getUtente().idPersona.codiceFiscale;
              this.loginService.buildInterAppUrl(babelUrl, false, true, true, false, false).subscribe((url: string) => {
                this.loginService.clearSession();
                window.location.assign(url);
              });
            });
          } else {
            this.router.navigate([ATTIVITA_ROUTE]);
          }
        } else {
          this.router.navigate([ATTIVITA_ROUTE]);
        }
      }
    });
  }
}
