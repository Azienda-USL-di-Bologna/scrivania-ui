import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { NextSDREntityProvider, FiltersAndSorts } from '@nfa/next-sdr';
import { ENTITIES_STRUCTURE, getInternautaUrl, Azienda, BaseUrlType } from '@bds/ng-internauta-model';
import { CONTROLLERS_ENDPOINT } from 'src/environments/app-constants';
import { BolloVirtuale } from './bollo.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BolloVirtualeService  {


  constructor(protected http: HttpClient, protected datepipe: DatePipe) {}

  public getDatiBolliVirtuali(aziendaCodice: string, dataInizio: string, dataFine: string): Observable<HttpResponse<BolloVirtuale[]>> {
    // const options= {
    //   headers?: HttpHeaders | {[header: string]: string | string[]},
    //   observe?: 'body' | 'events' | 'response',
    //   params?: HttpParams|{[param: string]: string | string[]},
    //   reportProgress?: boolean,
    //   responseType?: 'arraybuffer'|'blob'|'json'|'text',
    //   withCredentials?: boolean,
    // }
    const url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.GET_DATI_BOLLO_AZIENDA + "?codiceAzienda=" + aziendaCodice+"&from="+dataInizio+"&to="+dataFine;
    return this.http.get<BolloVirtuale[]>(url, {responseType: "json", observe: 'response'});
  }

  // public csvDownloadFile(idAzienda: number, tipo: string): Observable<any> {
  //   const url = getInternautaUrl(BaseUrlType.Baborg) + "/" + CUSTOM_SERVER_METHODS.downloadCSVFileFromIdAzienda + "?idAzienda=" + idAzienda + "&tipo=" + tipo;
  //    return this.http.get(url, {responseType: "blob"}/* {responseType: "arraybuffer"} */);
  // }

}
