import { Injectable } from "@angular/core";
import { DatePipe } from "@angular/common";
import { HttpBackend, HttpClient, HttpResponse } from "@angular/common/http";
import { CUSTOM_SERVER_METHODS } from "../../../environments/app-constants";
import { Attivita, ENTITIES_STRUCTURE, Azienda, Applicazione, getInternautaUrl, BaseUrlType } from "@bds/internauta-model";
import { NextSDREntityProvider } from "@bds/next-sdr";
import { Observable } from "rxjs";

@Injectable()
export class AttivitaService extends NextSDREntityProvider {

  constructor(
    protected http: HttpClient,
    private handler: HttpBackend, 
    protected datepipe: DatePipe) {
    super(http, datepipe, ENTITIES_STRUCTURE.scrivania.attivita, getInternautaUrl(BaseUrlType.Scrivania));
  }

  update(elementToUpdate: Attivita): Observable<any> {
    const temp = new Attivita();
    Object.assign(temp, elementToUpdate);
    temp.idAzienda = {id: elementToUpdate.idAzienda.id} as Azienda;
    temp.idApplicazione = {id: elementToUpdate.idApplicazione.id} as Applicazione;
    temp.datiAggiuntivi = elementToUpdate.datiAggiuntivi;
    return this.patchHttpCall(temp, temp.id);
  }

  insert(elementToInsert: Attivita): Observable<any> {
    return this.postHttpCall(elementToInsert);
  }

  delete(elementToDelete: Attivita): Observable<any> {
    return this.deleteHttpCall(elementToDelete.id);
  }

  public eliminaAttivitaDemiurgo(elementToDelete: Attivita): Observable<any> {
    const url = getInternautaUrl(BaseUrlType.Scrivania) + "/" + CUSTOM_SERVER_METHODS.cancellaattivita;
    const datiAggiuntiviJson = elementToDelete.datiAggiuntivi;
    let formData: FormData = new FormData();
    formData.append("id_attivita", datiAggiuntiviJson.id_attivita_babel.toString());
    formData.append("id_applicazione", "babel");
    formData.append("id_azienda", elementToDelete.idAzienda.id.toString());
    console.log(formData);
    return this.http.post(url, formData);
  }

  /**
   * Effettua il download di un fascicolo chiamando l'URL pre-autenticato.
   * Istanzia un oggetto httpClient per bypassare l'interceptor.
   * @param url L'url da chiamare.
   * @returns Il fascicolo in formato zip.
   */
  public downloadArchivioZip(url: string): Observable<HttpResponse<Blob>> {
    const httpClient: HttpClient = new HttpClient(this.handler);
    return httpClient.get(url, {observe: 'response', responseType: "blob"});
  }
}
