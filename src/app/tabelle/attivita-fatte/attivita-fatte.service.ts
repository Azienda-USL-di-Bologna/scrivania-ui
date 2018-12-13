import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpAbstractService } from "@bds/nt-communicator"
import { ENTITIES_CONFIGURATION, ENTITIES, getInternautaUrl, BaseUrlType } from '../../../environments/app-constants';
import { AttivitaFatta } from '@bds/ng-internauta-model';

@Injectable()
export class AttivitaFatteService extends HttpAbstractService {

  constructor(protected http: HttpClient, protected datepipe: DatePipe) {
    super(http, datepipe, ENTITIES_CONFIGURATION[ENTITIES.attivitaFatta], getInternautaUrl(BaseUrlType.Scrivania));
  }

  update(elementToUpdate: AttivitaFatta): Promise<any> {
    const functioName = "update";
    //console.log(this.classDescriptionLocal, functioName, "id", elementToUpdate.id, "elmToUpdate", elementToUpdate);
    return this.patchHttpCall(elementToUpdate, elementToUpdate.id);
  }

  insert(elementToInsert: AttivitaFatta, datepipe: DatePipe): Promise<any>{
    const functioName = "insert";
   // console.log(this.classDescriptionLocal, functioName, "elementToInsert", elementToInsert);
    return this.postHttpCall(elementToInsert);
  }

  delete(elementToDelete: AttivitaFatta): Promise<any>{
    const functioName = "delete";
    //console.log(this.classDescriptionLocal, functioName, "elementToDelete", elementToDelete);
    return this.deleteHttpCall(elementToDelete.id);
  }
}
