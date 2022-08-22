import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DatePipe } from "@angular/common";
import { Attivita, BaseUrlType, ENTITIES_STRUCTURE, getInternautaUrl, ItemMenu } from "@bds/internauta-model";
import { CONTROLLERS_ENDPOINT } from "../../../environments/app-constants";
import { Observable, Subscriber } from "rxjs";
import { JwtLoginService } from "@bds/jwt-login";
import { NextSDREntityProvider } from "@bds/next-sdr";

@Injectable({
  providedIn: "root"
})
export class ScrivaniaService extends NextSDREntityProvider {

  private getAnteprimaServlet: string = "getAnteprima";
  // private blobEmitter: BehaviorSubject<any> = new BehaviorSubject(new URL("http:// localhost:4200/assets/images/no_anteprima.png"));

  constructor(protected http: HttpClient, protected datepipe: DatePipe, private loginService: JwtLoginService) {
    super(http, datepipe, ENTITIES_STRUCTURE.scrivania.menu, getInternautaUrl(BaseUrlType.Scrivania));
  }

  update(elementToUpdate: Attivita): Observable<any> {
    const functioName = "update";
    // console.log(this.classDescriptionLocal, functioName, "id", elementToUpdate.id, "elmToUpdate", elementToUpdate);
    return this.patchHttpCall(elementToUpdate, elementToUpdate.id);
  }

  insert(elementToInsert: Attivita, datepipe: DatePipe): Observable<any> {
    const functioName = "insert";
   //  console.log(this.classDescriptionLocal, functioName, "elementToInsert", elementToInsert);
    return this.postHttpCall(elementToInsert);
  }

  delete(elementToDelete: Attivita): Observable<any> {
    const functioName = "delete";
    // console.log(this.classDescriptionLocal, functioName, "elementToDelete", elementToDelete);
    return this.deleteHttpCall(elementToDelete.id);
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
      "fileName=" + allegatoSelezionato.nome_file;
      const url = this.restApiBaseUrl + "/" + this.getAnteprimaServlet + "?" + queryString;

  return new Observable((observer: Subscriber<any>) => {
          let objectUrl: string = null;
          this.http.get(url, { responseType: "blob" }).subscribe(m => {
            objectUrl = URL.createObjectURL(m);
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
        };
      });

       // return this.http.get<any>(url);
  }


  public getUrlsFirmone(): Observable<any> {
    const url: string = getInternautaUrl(BaseUrlType.Scrivania) + CONTROLLERS_ENDPOINT.FIRMONE_URLS;
    return this.http.get(url);
  }

  public getUrlsPrendone(): Observable<any> {
    const url: string = getInternautaUrl(BaseUrlType.Scrivania) + CONTROLLERS_ENDPOINT.PRENDONE_URLS;
    return this.http.get(url);
  }

  public cancellaNotifiche(): Observable<any> {
    const url: string = getInternautaUrl(BaseUrlType.Scrivania) + CONTROLLERS_ENDPOINT.CANCELLA_NOTIFICHE;
    return this.http.get(url);
  }

  public getMenuScrivania(): Observable<ItemMenu[]> {
    console.log("Sono qui per chiedere il menu della scrivania");
    const url: string = getInternautaUrl(BaseUrlType.Scrivania) + CONTROLLERS_ENDPOINT.GET_MENU_SCRIVANIA;
    console.log("url: " + url);
    return this.http.get(url) as Observable<ItemMenu[]>;
  }
}
