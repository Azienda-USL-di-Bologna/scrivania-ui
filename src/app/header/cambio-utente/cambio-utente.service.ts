import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DatePipe } from "@angular/common";
import { NextSDREntityProvider } from "@bds/next-sdr";
import { BaseUrlType, ENTITIES_STRUCTURE, getInternautaUrl } from "@bds/internauta-model";

@Injectable({
  providedIn: "root"
})
export class CambioUtenteService extends NextSDREntityProvider {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe, ENTITIES_STRUCTURE.baborg.utente, getInternautaUrl(BaseUrlType.Baborg));
   }
}
