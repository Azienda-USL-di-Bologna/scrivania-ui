import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import {RouterModule} from "@angular/router";
import {rootRouterConfig} from "./app.routes";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { HttpModule } from "@angular/http";
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from '@bds/nt-communicator';

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


// import {  HeaderComponent as PPHeader,
//           HeaderFeaturesComponent as PPHeaderFeaturesComponent,
//           CambioUtenteComponent as PPCambioUtenteComponent } from "@bds/primeng-plugin";
import { PrimengPluginModule, ProfiloComponent } from "@bds/primeng-plugin";

/* Custom services */
import { AttivitaService } from "./tabelle/attivita/attivita.service";
import { AttivitaFatteService } from "./tabelle/attivita-fatte/attivita-fatte.service";
import { MessageService } from "primeng-lts/api";
import { DialogService } from "primeng-lts/dynamicdialog";
import { RaccoltaSempliceService } from './tabelle/raccolta-semplice/raccolta-semplice.service';
import { ExtendedAllegatoService } from "./tabelle/raccolta-semplice/inserimento-manuale/extended-allegato.service";
import { BolloVirtualeService } from "./tabelle/dati-bollo-virtuale/bollo-virtuale.service";

/* PrimeNG component */
import { RadioButtonModule } from 'primeng-lts/radiobutton';
import { AccordionModule } from "primeng-lts/accordion";
import { LightboxModule } from "primeng-lts/lightbox";
import { PanelModule } from "primeng-lts/panel";
import { DropdownModule } from "primeng-lts/dropdown";
import { TableModule } from "primeng-lts/table";
import { CalendarModule } from "primeng-lts/calendar";
import { TooltipModule } from "primeng-lts/tooltip";
import { InputSwitchModule } from "primeng-lts/inputswitch";
import { MenubarModule } from "primeng-lts/menubar";
import { SlideMenuModule } from "primeng-lts/slidemenu";
import { DynamicDialogModule } from "primeng-lts/dynamicdialog";
import { ContextMenuModule } from "primeng-lts/contextmenu";
import { InputTextModule } from "primeng-lts/inputtext";
import { OverlayPanelModule } from "primeng-lts/overlaypanel";
import { TieredMenuModule } from "primeng-lts/tieredmenu";
import { DialogModule } from "primeng-lts/dialog";
import { AutoCompleteModule } from "primeng-lts/autocomplete";
import { DatePipe } from "@angular/common";
import { ToastModule } from "primeng-lts/toast";
import { CardModule } from "primeng-lts/card";
import { ConfirmDialogModule } from "primeng-lts/confirmdialog";
import { ConfirmationService } from "primeng-lts/api";
import { ProgressSpinnerModule } from "primeng-lts/progressspinner";
import { FileUploadModule } from 'primeng-lts/fileupload';
import {BlockUIModule} from 'primeng-lts/blockui';
import {ListboxModule} from 'primeng-lts/listbox';
import {FieldsetModule} from 'primeng-lts/fieldset';
import {ScrollPanelModule} from 'primeng-lts/scrollpanel';

/* Login */
import { NtJwtLoginModule } from "@bds/nt-jwt-login";
import { loginModuleConfig } from "./config/module-config";
import { ImpostazioniComponent } from "./impostazioni/impostazioni.component";
import { ImpostazioniService } from "./services/impostazioni.service";

import { NtCommunicatorModule } from "@bds/nt-communicator";
import { CommonComponentsModule } from "@bds/common-components";
import { DatiBolloVirtualeComponent } from './tabelle/dati-bollo-virtuale/dati-bollo-virtuale.component';
import { RaccoltaSempliceComponent } from './tabelle/raccolta-semplice/raccolta-semplice.component';
import { InserimentoManualeComponent } from './tabelle/raccolta-semplice/inserimento-manuale/inserimento-manuale.component';


/* Angular Material Module */
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';





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
    ImpostazioniComponent,
    DatiBolloVirtualeComponent,
    RaccoltaSempliceComponent,
    InserimentoManualeComponent
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
    ToastModule,
    FileUploadModule,
    CardModule,
    ConfirmDialogModule,
    PrimengPluginModule,
    NtCommunicatorModule,
    CommonComponentsModule,
    ProgressSpinnerModule,
    MatMenuModule,
    MatIconModule,
    RadioButtonModule,
    BlockUIModule,
    MatInputModule,
    MatAutocompleteModule,
    ListboxModule,
    FieldsetModule,
    MatExpansionModule,
    ScrollPanelModule
  ],
  providers: [AttivitaService, AttivitaFatteService, DatePipe, MessageService,
    ImpostazioniService, DialogService, ConfirmationService,
    BolloVirtualeService, RaccoltaSempliceService, ExtendedAllegatoService,
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ImpostazioniComponent, ProfiloComponent]
})
export class AppModule { }
