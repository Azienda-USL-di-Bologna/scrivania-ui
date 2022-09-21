import { NextSdrEntity } from "@bds/next-sdr";
import { Allegato } from "./Allegato";
export declare class DettaglioAllegato implements NextSdrEntity {
    id: number;
    idRepository: string;
    idAllegato: Allegato;
    idDettaglioAllegatoPadre: DettaglioAllegato;
    dettagliAllagatoFigliList: DettaglioAllegato[];
    nome: string;
    estensione: string;
    caratteristica: TipoDettaglioAllegato;
    dimensioneByte: number;
    mimeType: string;
    hashMd5: string;
    hashSha256: string;
    dataInserimento: Date;
    dataCreazione: Date;
    version: Date;
}
export declare enum TipoDettaglioAllegato {
    ORIGINALE = "ORIGINALE",
    CONVERTITO = "CONVERTITO",
    SEGNAPOSTO = "SEGNAPOSTO",
    ORIGINALE_FIRMATO = "ORIGINALE_FIRMATO",
    ORIGINALE_FIRMATO_P7M = "ORIGINALE_FIRMATO_P7M",
    CONVERTITO_FIRMATO = "CONVERTITO_FIRMATO",
    CONVERTITO_FIRMATO_P7M = "CONVERTITO_FIRMATO_P7M"
}
