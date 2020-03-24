import { Routes } from "@angular/router";
import { HomepageComponent } from "./pagine/homepage/homepage.component";
import { ScrivaniaComponent } from "./pagine/scrivania/scrivania.component";
import { NtJwtLoginComponent } from "@bds/nt-jwt-login";
import { NoLoginGuard, LoginGuard, RefreshLoggedUserGuard } from "@bds/nt-jwt-login";
import { LoadingComponent } from "./pagine/loading/loading.component";
import { SmartWorkingComponent } from "@bds/primeng-plugin";
/*
import { NtJwtLoginComponent } from "@bds/nt-jwt-login";
import { NoLoginGuard, LoginGuard, RefreshLoggedUserGuard } from "@bds/nt-jwt-login"
*/

export const rootRouterConfig: Routes = [
    {path: "", redirectTo: "homepage", pathMatch: "full"},
    {path: "login", component: NtJwtLoginComponent, canActivate: [NoLoginGuard], data: {}},
    {path: "scrivania", component: LoadingComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "attivita", component: ScrivaniaComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "homepage", component: HomepageComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "smart-working", component: SmartWorkingComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]}
    /*{path: "login", component: NtJwtLoginComponent, canActivate: [NoLoginGuard], data: {}},*/
];
