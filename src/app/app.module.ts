import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import {RouterModule} from "@angular/router";
import {rootRouterConfig} from "./app.routes";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { HttpModule } from "@angular/http";

/* Custom component */
import { AppComponent } from "./app.component";
import { TabellaAttivitaComponent } from "./tabelle/attivita/attivita.component";
import { ScrivaniaComponent } from "./pagine/scrivania/scrivania.component";
import { HomepageComponent } from "./pagine/homepage/homepage.component";
import { HeaderComponent } from "./header/header.component";
import { CambioUtenteComponent } from "./header/cambio-utente/cambio-utente.component";
import { AttivitaFatteComponent } from "./tabelle/attivita-fatte/attivita-fatte.component";
import { DropdownAziendeComponent } from "./components/dropdown-aziende/dropdown-aziende.component";
import { LoadingComponent } from "./pagine/loading/loading.component";

/* Custom services */
import { AttivitaService } from "./tabelle/attivita/attivita.service";
import { AttivitaFatteService } from "./tabelle/attivita-fatte/attivita-fatte.service";
import { MessageService } from "primeng/api";


/* PrimeNG component */
import { AccordionModule } from "primeng/accordion";
import { LightboxModule } from "primeng/lightbox";
import { PanelModule } from "primeng/panel";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { CalendarModule } from "primeng/calendar";
import { TooltipModule } from "primeng/tooltip";
import { InputSwitchModule } from "primeng/inputswitch";
import { MenubarModule } from "primeng/menubar";
import { SlideMenuModule } from "primeng/slidemenu";
import { DynamicDialogModule } from "primeng/dynamicdialog";
import { ContextMenuModule } from "primeng/contextmenu";
import { InputTextModule } from "primeng/inputtext";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { TieredMenuModule } from "primeng/tieredmenu";
import { DialogModule } from "primeng/dialog";
import { AutoCompleteModule } from "primeng/autocomplete";
import { DatePipe } from "@angular/common";
import { ToastModule } from "primeng/toast";

/* Login */
import { NtJwtLoginModule } from "@bds/nt-jwt-login";
import { loginModuleConfig } from "./config/module-config";
import { ImpostazioniComponent } from "./header/impostazioni/impostazioni.component";
import { AppSettingsService } from "./services/app-settings.service";


@NgModule({
  declarations: [
    AppComponent,
    TabellaAttivitaComponent,
    ScrivaniaComponent,
    HomepageComponent,
    HeaderComponent,
    CambioUtenteComponent,
    AttivitaFatteComponent,
    DropdownAziendeComponent,
    LoadingComponent,
    ImpostazioniComponent
  ],
  imports: [
    NtJwtLoginModule.forRoot(loginModuleConfig),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpModule,
    AccordionModule,
    LightboxModule,
    PanelModule,
    DropdownModule,
    TableModule,
    RouterModule.forRoot(rootRouterConfig, { useHash: false }),
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    TooltipModule,
    InputTextModule,
    OverlayPanelModule,
    TieredMenuModule,
    DialogModule,
    AutoCompleteModule,
    InputSwitchModule,
    MenubarModule,
    SlideMenuModule,
    DynamicDialogModule,
    ContextMenuModule,
    ToastModule
  ],
  providers: [AttivitaService, AttivitaFatteService, DatePipe, MessageService, AppSettingsService],
  bootstrap: [AppComponent],
  entryComponents: [ImpostazioniComponent]
})
export class AppModule { }
