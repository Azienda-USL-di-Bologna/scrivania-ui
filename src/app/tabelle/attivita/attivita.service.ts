import { Injectable } from "@angular/core";
import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ENTITIES_CONFIGURATION, ENTITIES, getInternautaUrl, BaseUrlType, CUSTOM_SERVER_METHODS, COMMON_PARAMETERS } from "../../../environments/app-constants";
import { Attivita, ENTITIES_STRUCTURE, Azienda, Applicazione } from "@bds/ng-internauta-model";
import { NextSDREntityProvider } from "@nfa/next-sdr";
import { Observable } from "rxjs";

@Injectable()
export class AttivitaService extends NextSDREntityProvider {

  constructor(protected http: HttpClient, protected datepipe: DatePipe) {
    super(http, datepipe, ENTITIES_STRUCTURE.scrivania.attivita, getInternautaUrl(BaseUrlType.Scrivania));
  }

  update(elementToUpdate: Attivita): Observable<any> {
    console.log("update(elementToUpdate: Attivita)", elementToUpdate);
    // elementToUpdate.idAzienda = {id: elementToUpdate.idAzienda.id} as Azienda;
    // elementToUpdate.idApplicazione = {id: elementToUpdate.idApplicazione.id} as Applicazione;
    const functioName = "update";
    const temp = new Attivita();
    Object.assign(temp, elementToUpdate);
    temp.idAzienda = {id: elementToUpdate.idAzienda.id} as Azienda;
    temp.idApplicazione = {id: elementToUpdate.idApplicazione.id} as Applicazione;
    temp.datiAggiuntivi = JSON.stringify(elementToUpdate.datiAggiuntivi);
    // console.log(this.classDescriptionLocal, functioName, "id", elementToUpdate.id, "elmToUpdate", elementToUpdate);
    return this.patchHttpCall(temp, temp.id);
  }

  insert(elementToInsert: Attivita, datepipe: DatePipe): Observable<any> {
    const functioName = "insert";
   // console.log(this.classDescriptionLocal, functioName, "elementToInsert", elementToInsert);
    return this.postHttpCall(elementToInsert);
  }

  delete(elementToDelete: Attivita): Observable<any> {
    const functioName = "delete";
    // console.log(this.classDescriptionLocal, functioName, "elementToDelete", elementToDelete);
    // elementToDelete.datiAggiuntivi = JSON.stringify(elementToDelete.datiAggiuntivi);
    return this.deleteHttpCall(elementToDelete.id);
  }

  public eliminaAttivitaDemiurgo(elementToDelete: Attivita): Observable<any> {
    const url = getInternautaUrl(BaseUrlType.Scrivania) + "/" + CUSTOM_SERVER_METHODS.cancellaattivita;
    const datiAggiuntiviJson = JSON.parse(JSON.stringify(elementToDelete.datiAggiuntivi));
    let formData: FormData = new FormData();
    formData.append("id_attivita", datiAggiuntiviJson.id_attivita_babel);
    formData.append("id_applicazione", "babel");
    formData.append("id_azienda", elementToDelete.idAzienda.id.toString());
    console.log(formData);
    return this.http.post(url, formData);
  }
}
