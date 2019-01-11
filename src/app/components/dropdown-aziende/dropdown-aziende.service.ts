import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DatePipe } from "@angular/common";
import { Azienda } from "@bds/ng-internauta-model";
import { HttpAbstractService } from "@bds/nt-communicator";
import { ENTITIES_CONFIGURATION, ENTITIES, getInternautaUrl, BaseUrlType } from "../../../environments/app-constants";
import { NtJwtLoginService } from "@bds/nt-jwt-login";

@Injectable({
  providedIn: "root"
})
export class DropdownAziendeService extends HttpAbstractService {

  constructor(protected http: HttpClient, protected datepipe: DatePipe, private loginService: NtJwtLoginService) {
    super(http, datepipe, ENTITIES_CONFIGURATION[ENTITIES.menu], getInternautaUrl(BaseUrlType.Scrivania));
  }

  update(elementToUpdate: Azienda): Promise<any> {
    const functioName = "update";
    return this.patchHttpCall(elementToUpdate, elementToUpdate.id);
  }

  insert(elementToInsert: Azienda, datepipe: DatePipe): Promise<any> {
    const functioName = "insert";
    return this.postHttpCall(elementToInsert);
  }

  delete(elementToDelete: Azienda): Promise<any> {
    const functioName = "delete";
    return this.deleteHttpCall(elementToDelete.id);
  }
}
