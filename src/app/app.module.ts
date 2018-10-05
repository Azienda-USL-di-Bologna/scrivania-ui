import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {RouterModule} from "@angular/router";
import {rootRouterConfig} from "./app.routes";
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/* Custom component */
import { AppComponent } from './app.component';
import { TabellaAttivitaComponent } from './tabella-attivita/tabella-attivita.component';
import { ScrivaniaComponent } from './pagine/scrivania/scrivania.component';
import { HomepageComponent } from './pagine/homepage/homepage.component';
import { HeaderComponent } from './header/header.component';


/* PrimeNG component */
import { AccordionModule } from 'primeng/accordion';
import {LightboxModule} from 'primeng/lightbox';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { AttivitaService } from './tabella-attivita/attivita.service';
import { DatePipe } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';



@NgModule({
  declarations: [
    AppComponent,
    TabellaAttivitaComponent,
    ScrivaniaComponent,
    HomepageComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AccordionModule,
    LightboxModule,
    PanelModule,
    DropdownModule,
    TableModule,
    RouterModule.forRoot(rootRouterConfig, { useHash: false }),
    FormsModule,
    CalendarModule,
    TooltipModule,
    InputTextModule
  ],
  providers: [AttivitaService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
