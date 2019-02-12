import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { getInternautaUrl, BaseUrlType } from "src/environments/app-constants";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class GlobalService {

  private _commonParameters$: Observable<any>;

  constructor(protected http: HttpClient) {
  }

  public get commonParameters$(): Observable<any> {
    return this.http.get(getInternautaUrl(BaseUrlType.ScrivaniaCommonParameters));
  }


}
