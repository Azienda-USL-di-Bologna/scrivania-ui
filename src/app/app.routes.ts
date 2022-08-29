import { Routes } from "@angular/router";
import { ScrivaniaComponent } from "./pagine/scrivania/scrivania.component";
import { JwtLoginComponent } from "@bds/jwt-login";
import { NoLoginGuard, LoginGuard, RefreshLoggedUserGuard } from "@bds/jwt-login";
import { LoadingComponent } from "./pagine/loading/loading.component";
import { SmartWorkingComponent } from "@bds/common-components";
import { DatiBolloVirtualeComponent } from "./tabelle/dati-bollo-virtuale/dati-bollo-virtuale.component";
import { CODICI_RUOLO } from "@bds/internauta-model";
import { RaccoltaSempliceComponent } from "./tabelle/raccolta-semplice/raccolta-semplice.component";
import { InserimentoManualeComponent } from "./tabelle/raccolta-semplice/inserimento-manuale/inserimento-manuale.component";
/*
import { JwtLoginComponent } from "@bds/jwt-login";
import { NoLoginGuard, LoginGuard, RefreshLoggedUserGuard } from "@bds/jwt-login"
*/

export const rootRouterConfig: Routes = [
    {path: "", redirectTo: "attivita", pathMatch: "full"},
    {path: "login", component: JwtLoginComponent, canActivate: [NoLoginGuard], data: {}},
    {path: "scrivania", component: LoadingComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "attivita", component: ScrivaniaComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "bollo", component: DatiBolloVirtualeComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard], data: { roles: [CODICI_RUOLO.CA] }},
    {path: "homepage", redirectTo: "attivita"},
    {path: "smart-working", component: SmartWorkingComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "raccoltasemplice", component: RaccoltaSempliceComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "inserimento", component: InserimentoManualeComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]}
    /*{path: "login", component: JwtLoginComponent, canActivate: [NoLoginGuard], data: {}},*/
];
