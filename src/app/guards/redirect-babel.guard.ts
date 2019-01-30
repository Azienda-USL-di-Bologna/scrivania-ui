import {Inject, Injectable, OnDestroy} from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { ImpostazioniApplicazioni, Applicazione } from "@bds/ng-internauta-model";
import { ApplicationCustiomization, ScrivaniaVersion } from "src/environments/application_customization";
import { GlobalService } from "../services/global.service";
import { COMMON_PARAMETERS } from "src/environments/app-constants";

@Injectable()
export class RedirectBabelGuard implements CanActivate, OnDestroy {

    constructor(private router: Router,
                private loginService: NtJwtLoginService,
                private globalService: GlobalService) {}

    public canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        if (this.loginService.token) {
            this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
              const impostazioniApplicazioni: ImpostazioniApplicazioni = utenteUtilities.getImpostazioniApplicazione();
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
                    window.location.assign(babelUrl);
                  });
              }
            });
        }
        return true;
    }

    ngOnDestroy() {
        console.log("RedirectBabelGuard ngOnDestroy");
    }
}


