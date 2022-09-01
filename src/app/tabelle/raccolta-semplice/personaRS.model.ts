import { Contatto, Indirizzo } from "@bds/internauta-model";

export class PersonaRS {
    public id: number;
    public guidInterfaccia: string;
    public cap: string;
    public cf: string;
    public civico: string;
    public nome: string;
    public cognome: string;
    public comune: string;
    public descrizione: string;
    public idContattoInternauta: Contatto;
    public mail: string;
    public nazione: string;
    public partitaIva: string;
    public provincia: string;
    public ragioneSociale: string;
    public telefono: string;
    public tipologia: string;
    public via: string;
    public nomeInterfaccia: string;
}