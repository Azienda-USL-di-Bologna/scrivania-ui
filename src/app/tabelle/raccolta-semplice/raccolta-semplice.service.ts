import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { getInternautaUrl, BaseUrlType } from '@bds/ng-internauta-model';
import { CONTROLLERS_ENDPOINT } from 'src/environments/app-constants';
import { Document } from './documento.model';
import { Observable } from 'rxjs';
import { Storico } from './dettaglio-annullamento/modal/storico';
import { FascicoloArgo } from './fascicolo.model';
import { DocumentoArgo } from './DocumentoArgo.model';
import { PersonaRS } from './personaRS.model';





@Injectable({
    providedIn: 'root'
  })
  export class RaccoltaSempliceService  {
  
    notEmptyText(s: string) : boolean {
      if(s != null && s.trim() != "")
        return true;
      else
        return false;
    }

    constructor(protected http: HttpClient, protected datepipe: DatePipe) {}

    public getRaccoltaSemplice(aziendaCodice: string, dataInizio: string, dataFine: string, cf:string, piva:string, limit: number, offeset:number) : Observable<HttpResponse<Document[]>>{
        if (cf==undefined) {cf=null;}
        if (piva==undefined) {piva=null;}
        let url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.GET_DATI_RACCOLTA_SEMPLICE + "?codiceAzienda=" + aziendaCodice+"&from="+dataInizio+"&to="+dataFine+"&cf="+cf+"&piva="+piva+"&limit="+limit+"&offset="+offeset;
        return this.http.get<Document[]>(url, {responseType: "json", observe: 'response'});
    }

    public getStorico(id: string, azienda: string) : Observable<HttpResponse<Storico[]>>{
      let url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.GET_STORICO + "?id=" + id +"&azienda=" + azienda;
      return this.http.get<Storico[]>(url, {responseType: "json", observe: 'response'});
    }

    public ricercaRaccolta(campi: Map<string, string>, limit: number, offeset:number) : Observable<HttpResponse<Document[]>> {
      let url = getInternautaUrl(BaseUrlType.Scrivania) + CONTROLLERS_ENDPOINT.RICERCA_RACCOLTA + "?";
      let i = 0;
      for(let key of campi.keys()) {
        url = url + key + "=" + campi.get(key);
        if(i < campi.size - 1)
          url = url + "&";
      }
      url  = url + "&offset="+ offeset;
      url = url + "&limit=" + limit;
      return this.http.get<Document[]>(url, {responseType: "json", observe: 'response'});
    }

    public updateAnnullamento(body: JSON): Observable<any> {
        let url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.ANNULLAMENTO_URL;
        return this.http.post(url, body,{ responseType: 'text'});
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
    const options = { 'response-type': 'text'}  
    console.log("Form Data: ", formData);
    let url = getInternautaUrl(BaseUrlType.Scrivania) + CONTROLLERS_ENDPOINT.CREATE_RS
    return this.http.post(url, formData, { responseType: 'text'});
   }

   public getTipologia(azienda: string) : Observable<HttpResponse<string[]>> {
    let url = getInternautaUrl(BaseUrlType.Scrivania) +CONTROLLERS_ENDPOINT.TIPOLOGIE + "?azienda=" + azienda;
    console.log("Url tipologie: ", url);
    return this.http.get<string[]>(url, {responseType: "json", observe: 'response'});
   }

   public downloadAllegato(azienda: String, idSottodocumento: String) : Observable<any> {
     let url = getInternautaUrl(BaseUrlType.Scrivania) + CONTROLLERS_ENDPOINT.DOWNLOAD + "?azienda=" + azienda + "&id=" + idSottodocumento;
     return this.http.get(url, {responseType: "blob"});
   }

   public addContatto(azienda: string, body: JSON) : Observable<any> {
    let url = getInternautaUrl(BaseUrlType.Scrivania) + CONTROLLERS_ENDPOINT.ADD_CONTATTO;
    console.log("Url addRubrica ", url);
    return this.http.post(url, body);
   }

   public editRubrica(azienda: string, persona: PersonaRS, map: Map<string, string>) : Observable<any> {
    let url = getInternautaUrl(BaseUrlType.Scrivania) + CONTROLLERS_ENDPOINT.EDIT_RUBRICA;
    let json : string = "{ ";
    if(this.notEmptyText(map.get("telefono"))) {
      json = json + " \"telefono\": \"" + map.get("telefono") + "\",";
      if(this.notEmptyText(map.get("idTelefono")))
        json = json + " \"idTelefono\": \"" + map.get("idTelefono") + "\","
    }

    if(this.notEmptyText(map.get("mail"))) {
      json = json + " \"mail\": \"" + map.get("mail") + "\" ,";
      if(this.notEmptyText(map.get("idMail")))
        json = json + " \"idMail\": \"" + map.get("idMail") + "\",";
    }

    if(this.notEmptyText(map.get("via")) || this.notEmptyText(map.get("civico")) ||
    this.notEmptyText(map.get("cap")) || this.notEmptyText(map.get("comune")) || 
    this.notEmptyText(map.get("provincia")) || this.notEmptyText(map.get("nazione"))) {
      json = json + " \"via\": \"" + map.get("via") + "\",";
      json = json + " \"civico\": \"" + map.get("civico") + "\",";
      json = json + " \"cap\": \"" + map.get("cap") + "\",";
      json = json + " \"comune\": \"" + map.get("comune") + "\",";
      json = json + " \"provincia\": \"" + map.get("provincia") + "\",";
      json = json + " \"nazione\": \"" + map.get("nazione") + "\",";
      if(this.notEmptyText(map.get("idIndirizzo")))
      json = json + " \"idIndirizzo\": \"" + map.get("idIndirizzo") + "\","
      
    }
    json = json + " \"idContatto\": \"" + persona.id + "\""
    json = json + ", \"azienda\": \"" + azienda + "\"}"
    console.log("Body: ", json);
    let body: JSON = JSON.parse(json);
    console.log("Url edit Rubrica ", url);
    return this.http.post(url, body, {responseType: 'text'});
   }

  }
