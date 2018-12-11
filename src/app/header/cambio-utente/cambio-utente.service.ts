import { Injectable } from "@angular/core";
import { HttpAbstractService } from "@bds/nt-communicator";
import { HttpClient } from "@angular/common/http";
import { DatePipe } from "@angular/common";
import { ENTITIES_CONFIGURATION, getInternautaUrl, BaseUrlType } from "../../../environments/app-constants";

@Injectable({
  providedIn: "root"
})
export class CambioUtenteService extends HttpAbstractService {

  constructor(private httpClient: HttpClient, private datePipe: DatePipe) {
    super(httpClient, datePipe, ENTITIES_CONFIGURATION.utente, getInternautaUrl(BaseUrlType.Baborg));
   }
}
