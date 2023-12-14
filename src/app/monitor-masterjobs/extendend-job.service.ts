import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseUrlType, getInternautaUrl, JobService } from "@bds/internauta-model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ExtendedJobService extends JobService {
  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }

  public relaunchJobsInError(): Observable<any> {
    const url = getInternautaUrl(BaseUrlType.Masterjobs) + `/relaunchJobsInError`;
    return this._http.get(url);
  }

  public regenerateQueue(): Observable<any> {
    const url = getInternautaUrl(BaseUrlType.Masterjobs) + `/regenerateQueue`;
    return this._http.get(url);
  }
}
