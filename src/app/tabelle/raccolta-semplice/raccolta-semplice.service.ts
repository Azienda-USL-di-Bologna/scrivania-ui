import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { NextSDREntityProvider, FiltersAndSorts } from '@nfa/next-sdr';
import { ENTITIES_STRUCTURE, getInternautaUrl, Azienda, BaseUrlType } from '@bds/ng-internauta-model';
import { CONTROLLERS_ENDPOINT } from 'src/environments/app-constants';
import { Document } from './documento.model';
import { PersonaRS } from './personaRS.model';
import { Observable } from 'rxjs';
import { Storico } from './dettaglio-annullamento/modal/storico';
import { map } from 'rxjs/operators';
import { FascicoloArgo } from './fascicolo.model';
import { DocumentoArgo } from './DocumentoArgo.model';
import { RaccoltaSemplice } from './inserimento-manuale/rs.model';




@Injectable({
    providedIn: 'root'
  })
  export class RaccoltaSempliceService  {
  
    constructor(protected http: HttpClient, protected datepipe: DatePipe) {}

    public getRaccoltaSemplice(aziendaCodice: string, dataInizio: string, dataFine: string) : Observable<HttpResponse<Document[]>>{
        let url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.GET_DATI_RACCOLTA_SEMPLICE + "?codiceAzienda=" + aziendaCodice+"&from="+dataInizio+"&to="+dataFine;
        return this.http.get<Document[]>(url, {responseType: "json", observe: 'response'});
    }

    public getStorico(id: string, azienda: string) : Observable<HttpResponse<Storico[]>>{
      let url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.GET_STORICO + "?id=" + id +"&azienda=" + azienda;
      return this.http.get<Storico[]>(url, {responseType: "json", observe: 'response'});
    }

    public updateAnnullamento(id: string, utente: string, azione: string, annullato: string): void {
        let url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.ANNULLAMENTO_URL;
        //return this.http.post(url, )
    }

    public getFascicoliArgo(azienda: string, idUtente:string, value: string) : Observable<HttpResponse<FascicoloArgo[]>>{
      let url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.GET_FASCICOLI_ARGO + "?azienda=" + azienda+"&idusr="+idUtente+"&param="+value;
      return this.http.get<FascicoloArgo[]>(url, {responseType: "json", observe: 'response'});
    }

    public getDocumentiArgo(azienda: string, idUtente:string, registro:string, value: string) : Observable<HttpResponse<DocumentoArgo[]>>{
      let url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.GET_DOCUMENTI_ARGO + "?azienda=" + azienda+"&idusr="+idUtente+"&reg="+registro+"&param="+value;
      return this.http.get<DocumentoArgo[]>(url, {responseType: "json", observe: 'response'});
    }

   public createRs(formData: FormData): Observable<any> {
    const headers = { 'content-type': 'application/json'}  

    let url = getInternautaUrl(BaseUrlType.Scrivania) + CONTROLLERS_ENDPOINT.CREATE_RS
  
    return this.http.post(url, formData);
   }

  }
