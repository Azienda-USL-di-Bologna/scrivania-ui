import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DatePipe } from "@angular/common";
import { Azienda, BaseUrlType, ENTITIES_STRUCTURE, getInternautaUrl } from "@bds/internauta-model";
import { NextSDREntityProvider } from "@bds/next-sdr";

@Injectable({
  providedIn: "root"
})
export class DropdownAziendeService extends NextSDREntityProvider {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe, ENTITIES_STRUCTURE.scrivania.menu, getInternautaUrl(BaseUrlType.Scrivania));
  }

  /* update(elementToUpdate: Azienda): Promise<any> {
    return this.patchHttpCall(elementToUpdate, elementToUpdate.id);
  }

  insert(elementToInsert: Azienda, datepipe: DatePipe): Promise<any> {
    return this.postHttpCall(elementToInsert);
  }

  delete(elementToDelete: Azienda): Promise<any> {
    return this.deleteHttpCall(elementToDelete.id);
  } */
}
