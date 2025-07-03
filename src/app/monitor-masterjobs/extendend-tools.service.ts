import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseUrlType, getInternautaUrl, ToolsService } from "@bds/internauta-model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ExtendedToolsService extends ToolsService {
  constructor(
    protected _http: HttpClient,
    protected _datepipe: DatePipe
  ) {
    super(_http);
  }

  public flushCache(): Observable<any> {
    const url = getInternautaUrl(BaseUrlType.Tools) + `/flushCache`;
    return this._http.get(url);
  }
}
