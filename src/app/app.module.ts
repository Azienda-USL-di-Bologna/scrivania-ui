import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { rootRouterConfig } from "./app.routes";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { RouteReuseStrategy } from "@angular/router";
import { CommonToolsModule, CustomReuseStrategy } from "@bds/common-tools";

/* Custom component */
import { AppComponent } from "./app.component";
import { TabellaAttivitaComponent } from "./tabelle/attivita/attivita.component";
import { ScrivaniaComponent } from "./pagine/scrivania/scrivania.component";
import { AttivitaFatteComponent } from "./tabelle/attivita-fatte/attivita-fatte.component";
import { DropdownAziendeComponent } from "./components/dropdown-aziende/dropdown-aziende.component";
import { LoadingComponent } from "./pagine/loading/loading.component";
import { PrimengPluginModule } from "@bds/primeng-plugin";
import { LoginAdminComponent } from "./components/login-admin/login-admin.component";

/* Custom services */
import { AttivitaService } from "./tabelle/attivita/attivita.service";
import { AttivitaFatteService } from "./tabelle/attivita-fatte/attivita-fatte.service";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { RaccoltaSempliceService } from "./tabelle/raccolta-semplice/raccolta-semplice.service";
import { ExtendedAllegatoService } from "./tabelle/raccolta-semplice/inserimento-manuale/extended-allegato.service";
import { BolloVirtualeService } from "./tabelle/dati-bollo-virtuale/bollo-virtuale.service";

/* PrimeNG component */
import { RadioButtonModule } from "primeng/radiobutton";
import { ButtonModule } from "primeng/button";
import { AccordionModule } from "primeng/accordion";
import { PanelModule } from "primeng/panel";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { DatePickerModule } from "primeng/datepicker";
import { InputSwitchModule } from "primeng/inputswitch";
import { MenubarModule } from "primeng/menubar";
import { DynamicDialogModule } from "primeng/dynamicdialog";
import { ContextMenuModule } from "primeng/contextmenu";
import { InputTextModule } from "primeng/inputtext";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { TieredMenuModule } from "primeng/tieredmenu";
import { DialogModule } from "primeng/dialog";
import { AutoCompleteModule } from "primeng/autocomplete";
import { DatePipe } from "@angular/common";
import { ToastModule } from "primeng/toast";
import { CardModule } from "primeng/card";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { FileUploadModule } from "primeng/fileupload";
import { BlockUIModule } from "primeng/blockui";
import { ListboxModule } from "primeng/listbox";
import { FieldsetModule } from "primeng/fieldset";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { InplaceModule } from "primeng/inplace";
import { ConfirmPopupModule } from "primeng/confirmpopup";
import { DividerModule } from "primeng/divider";
import { CheckboxModule } from "primeng/checkbox";

/* Login */
import { JwtLoginModule } from "@bds/jwt-login";
import { loginModuleConfig } from "./config/module-config";
import { ImpostazioniComponent } from "./impostazioni/impostazioni.component";
import { ImpostazioniService } from "./services/impostazioni.service";

import { CommonComponentsModule, HeaderModule, HeaderFeaturesModule } from "@bds/common-components";
import { DatiBolloVirtualeComponent } from "./tabelle/dati-bollo-virtuale/dati-bollo-virtuale.component";
import { RaccoltaSempliceComponent } from "./tabelle/raccolta-semplice/raccolta-semplice.component";
import { InserimentoManualeComponent } from "./tabelle/raccolta-semplice/inserimento-manuale/inserimento-manuale.component";

/* Angular Material Module */
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { MonitorMasterjobsComponent } from "./monitor-masterjobs/monitor-masterjobs.component";
import { NgIdleKeepaliveModule } from "@ng-idle/keepalive";
import { SplitterModule } from "primeng/splitter";

import { appConfig } from "./app.config";
@NgModule({
  declarations: [
    AppComponent,
    TabellaAttivitaComponent,
    ScrivaniaComponent,
    AttivitaFatteComponent,
    DropdownAziendeComponent,
    LoadingComponent,
    ImpostazioniComponent,
    DatiBolloVirtualeComponent,
    RaccoltaSempliceComponent,
    InserimentoManualeComponent,
    MonitorMasterjobsComponent,
    LoginAdminComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    JwtLoginModule.forRoot(loginModuleConfig),
    BrowserModule,
    BrowserAnimationsModule,
    AccordionModule,
    PanelModule,
    DropdownModule,
    TableModule,
    RouterModule.forRoot(rootRouterConfig, { useHash: false }),
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    TooltipModule,
    InputTextModule,
    OverlayPanelModule,
    TieredMenuModule,
    DialogModule,
    AutoCompleteModule,
    InputSwitchModule,
    MenubarModule,
    DynamicDialogModule,
    ContextMenuModule,
    ToastModule,
    FileUploadModule,
    CardModule,
    ConfirmDialogModule,
    PrimengPluginModule,
    CommonToolsModule,
    CommonComponentsModule,
    HeaderModule,
    HeaderFeaturesModule,
    ProgressSpinnerModule,
    MatIconModule,
    ButtonModule,
    RadioButtonModule,
    BlockUIModule,
    ListboxModule,
    ConfirmPopupModule,
    FieldsetModule,
    MatExpansionModule,
    ScrollPanelModule,
    InplaceModule,
    DividerModule,
    SplitterModule,
    CheckboxModule,
    NgIdleKeepaliveModule.forRoot(),
  ],
  providers: [
    AttivitaService,
    AttivitaFatteService,
    DatePipe,
    MessageService,
    ImpostazioniService,
    DialogService,
    ConfirmationService,
    BolloVirtualeService,
    RaccoltaSempliceService,
    ExtendedAllegatoService,
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    provideHttpClient(withInterceptorsFromDi()),
    ...appConfig.providers,
  ],
})
export class AppModule {}
