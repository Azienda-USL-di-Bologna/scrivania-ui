import { Routes } from "@angular/router";
import { HomepageComponent } from "./pagine/homepage/homepage.component";
import { ScrivaniaComponent } from './pagine/scrivania/scrivania.component';
/*
import { NtJwtLoginComponent } from "@bds/nt-jwt-login";
import { NoLoginGuard, LoginGuard, RefreshLoggedUserGuard } from "@bds/nt-jwt-login"
*/

export const rootRouterConfig: Routes = [
    {path: "", redirectTo: "homepage", pathMatch: "full"},
    {path: "scrivania", component: ScrivaniaComponent},
    {path: "homepage", component: HomepageComponent}
    /*{path: "login", component: NtJwtLoginComponent, canActivate: [NoLoginGuard], data: {}},*/
];
    