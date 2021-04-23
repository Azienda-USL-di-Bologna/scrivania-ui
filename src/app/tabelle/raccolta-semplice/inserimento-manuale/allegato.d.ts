import { NextSdrEntity } from "@nfa/next-sdr";
import { DettaglioAllegato } from "./DettaglioAllegato";
import { Doc } from "./Doc";
export declare class Allegato implements NextSdrEntity {
    id: number;
    idDoc: Doc;
    idAllegatoPadre: Allegato;
    allegatiFigliList: Allegato[];
    dettagliAllegatiList: DettaglioAllegato[];
    nome: string;
    tipo: TipoAllegato;
    principale: boolean;
    ordinale: number;
    firmato: boolean;
    dataInserimento: Date;
    dataCreazione: Date;
    version: Date;
    pasticcio: boolean;
}
export declare enum TipoAllegato {
    ALLEGATO = "ALLEGATO",
    LETTERA = "LETTERA",
    FRONTESPIZIO = "FRONTESPIZIO",
    STAMPA_UNICA = "STAMPA_UNICA",
    FASCICOLATO = "FASCICOLATO"
}
