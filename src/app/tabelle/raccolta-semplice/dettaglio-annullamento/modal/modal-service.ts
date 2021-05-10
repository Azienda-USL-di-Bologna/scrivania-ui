import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ENTITIES_STRUCTURE, getInternautaUrl, Azienda, BaseUrlType } from '@bds/ng-internauta-model';
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Observable } from "rxjs";
import { CONTROLLERS_ENDPOINT } from 'src/environments/app-constants';
import { Storico } from "./storico";

@Injectable()
export class ModalService {

    constructor(protected http: HttpClient) {}


    private modals: any[] = [];

    add(modal:any) {
        this.modals.push(modal);
    }



    remove(id: string) {
        // remove modal from array of active modals
        this.modals = this.modals.filter(x => x.id !== id);
    }

    open(id: string) {
        console.log("Dentro open Service");
        // open modal specified by id
        const modal = this.modals.find(x => x.id === id);
        modal.open();
    }

    close(id: string) {
        // close modal specified by id
        const modal = this.modals.find(x => x.id === id);
        modal.close();
    }
}