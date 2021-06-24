import { Allegato } from "./inserimento-manuale/allegato";
import { PersonaRS } from "./personaRS.model";
import { Sottodocumento } from "./sottodocumento.model";

export class Document {
    public applicazioneChiamante: String;
    public additionalData: String;
    public codice: String;
    public createTime: Date;
    public creatore: String;
    public descrizioneStruttura: String;
    public id: number;
    public idGddoc: String;
    public idStrutturaResponsabileArgo: number;
    public idStrutturaResponsabileInternauta: number;
    public oggetto: String;
    public stato: String;
    public storico: String;
    public tipoDocumento: String;
    public attivo: boolean;
    public fascicoli: String;
    public documentoBabel: String;
    public coinvolti: PersonaRS[] = [];
    public sottodocumenti: Sottodocumento[] = [];
    public allegati: Allegato[];
}