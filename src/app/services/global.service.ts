import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BaseUrlType, getInternautaUrl } from "@bds/internauta-model";

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
