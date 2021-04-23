import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { NextSDREntityProvider, FiltersAndSorts } from '@nfa/next-sdr';
import { ENTITIES_STRUCTURE, getInternautaUrl, Azienda, BaseUrlType } from '@bds/ng-internauta-model';
import { CONTROLLERS_ENDPOINT } from 'src/environments/app-constants';
import { Document } from './documento.model';
import { PersonaRS } from './personaRS.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class RaccoltaSempliceService  {
  
    constructor(protected http: HttpClient, protected datepipe: DatePipe) {}

    public getRaccoltaSemplice(aziendaCodice: string, dataInizio: string, dataFine: string) : Observable<HttpResponse<Document[]>>{
        let url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.GET_DATI_RACCOLTA_SEMPLICE + "?codiceAzienda=" + aziendaCodice+"&from="+dataInizio+"&to="+dataFine;
        return this.http.get<Document[]>(url, {responseType: "json", observe: 'response'});
    }

  }