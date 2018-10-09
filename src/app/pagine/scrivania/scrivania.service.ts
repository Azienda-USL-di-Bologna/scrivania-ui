import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseContentType, Http, RequestOptions, Headers } from '@angular/http';
import { DatePipe } from '@angular/common';
import { Attivita } from '@bds/ng-internauta-model';
import { HttpAbstractService } from '@bds/nt-communicator';
import { ENTITIES_CONFIGURATION, ENTITIES, BASE_URL } from '../../../environments/app-constants';
import { Observable, Subscriber, Subject, throwError, BehaviorSubject } from 'rxjs';
import { NtJwtLoginService } from '@bds/nt-jwt-login';

@Injectable({
  providedIn: 'root'
})
export class ScrivaniaService extends HttpAbstractService {

  private getAnteprimaServlet: string = "getAnteprima";
  //private blobEmitter: BehaviorSubject<any> = new BehaviorSubject(new URL("http://localhost:4200/assets/images/no_anteprima.png"));

  constructor(protected http: HttpClient, protected datepipe: DatePipe, private loginService: NtJwtLoginService) {
    super(http, datepipe, ENTITIES_CONFIGURATION[ENTITIES.attivita], BASE_URL);
  }

  // public getBlobEmitterObsevable(): Observable<any> {
  //   return this.blobEmitter.asObservable();
  // }


  // public getBlobEmitter(): BehaviorSubject<any> {
  //   return this.blobEmitter;
  // }
  public getAnteprima(attivita: Attivita, allegatoSelezionato: any): Observable<URL> {
    const queryString: string = 
      "guid=" + allegatoSelezionato.guid + "&" +
      "tipologia=" + allegatoSelezionato.tipologia + "&" +
      "idAzienda=" + attivita.fk_idAzienda.id + "&" +
      "idApplicazione=" + attivita.fk_idApplicazione.id + "&" +
      "fileName=" + allegatoSelezionato.nome_file
      const url = this.restApiBaseUrl + "/" + this.getAnteprimaServlet + "?" + queryString;

  return new Observable((observer: Subscriber<any>) => {
          let objectUrl: string = null;
          this.http.get(url, { responseType: 'blob' }).subscribe(m => {
            objectUrl = URL.createObjectURL(m)
            observer.next(objectUrl);
        },
        err => {
          observer.error(err);
        });
        return () => {
          if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
              objectUrl = null;
          }
        }
      });

       // return this.http.get<any>(url);
  }
}
