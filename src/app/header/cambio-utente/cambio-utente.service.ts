import { Injectable } from '@angular/core';
import { HttpAbstractService, FiltersAndSorts, FILTER_TYPES, FilterDefinition } from '@bds/nt-communicator';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ENTITIES_CONFIGURATION, getInternautaUrl, BaseUrlType, PROJECTIONS } from '../../../environments/app-constants';
import { Persona } from '@bds/ng-internauta-model';

@Injectable({
  providedIn: 'root'
})
export class CambioUtenteService extends HttpAbstractService {

  constructor(private httpClient: HttpClient, private datePipe: DatePipe) {
    super(httpClient, datePipe, ENTITIES_CONFIGURATION.persona, getInternautaUrl(BaseUrlType.Baborg));
   }
}
