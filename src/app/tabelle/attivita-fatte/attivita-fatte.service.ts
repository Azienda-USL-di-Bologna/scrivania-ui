import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { getInternautaUrl, BaseUrlType } from '../../../environments/app-constants';
import { AttivitaFatta, ENTITIES_STRUCTURE } from '@bds/ng-internauta-model';
import { NextSDREntityProvider } from '@nfa/next-sdr';
import { Observable } from 'rxjs';

@Injectable()
export class AttivitaFatteService extends NextSDREntityProvider {

  constructor(protected http: HttpClient, protected datepipe: DatePipe) {
    super(http, datepipe, ENTITIES_STRUCTURE.scrivania.attivitafatta, getInternautaUrl(BaseUrlType.Scrivania));
  }

  update(elementToUpdate: AttivitaFatta): Observable<any> {
    const functioName = "update";
    //console.log(this.classDescriptionLocal, functioName, "id", elementToUpdate.id, "elmToUpdate", elementToUpdate);
    return this.patchHttpCall(elementToUpdate, elementToUpdate.id);
  }

  insert(elementToInsert: AttivitaFatta, datepipe: DatePipe): Observable<any>{
    const functioName = "insert";
   // console.log(this.classDescriptionLocal, functioName, "elementToInsert", elementToInsert);
    return this.postHttpCall(elementToInsert);
  }

  delete(elementToDelete: AttivitaFatta): Observable<any>{
    const functioName = "delete";
    //console.log(this.classDescriptionLocal, functioName, "elementToDelete", elementToDelete);
    return this.deleteHttpCall(elementToDelete.id);
  }
}
