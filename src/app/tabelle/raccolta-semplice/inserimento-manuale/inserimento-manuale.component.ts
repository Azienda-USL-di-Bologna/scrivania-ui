import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Document } from '../documento.model';
import { Observable, Subscription } from 'rxjs';
import { Allegato } from './allegato';
import { DettaglioAllegato } from './dettaglio-allegato';
import { FileUpload } from 'primeng/fileupload';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ExtendedAllegatoService } from './extended-allegato.service';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { CustomReuseStrategy, UtilityFunctions } from '@bds/common-tools';
import { BatchOperation, BatchOperationTypes, FilterDefinition, FiltersAndSorts, FILTER_TYPES, NextSdrEntity, SortDefinition, SORT_MODES } from '@bds/next-sdr';
import { Azienda, BaseUrls, BaseUrlType, Contatto, ContattoService, DettaglioContatto, DettaglioContattoService, ENTITIES_STRUCTURE, Struttura } from '@bds/internauta-model';
import { FascicoloArgo } from '../fascicolo.model';
import { RaccoltaSempliceService } from '../raccolta-semplice.service';
import { FormBuilder, FormControl, FormGroup, SelectMultipleControlValueAccessor } from '@angular/forms';
import { DocumentoArgo } from '../DocumentoArgo.model';
import { PersonaRS } from '../personaRS.model';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';



interface TipoDocumento {
  name: string,
  code: string
}

interface ExternalAppDataRS {
  protocollo: string;
  anno: string;
  codiceAzienda: string;
  fascicoli: string;
  struttura: string;
  nome: string;
}

interface Registro {
  descrizione: string,
  tipo: string
}

@Component({
  selector: 'app-inserimento-manuale',
  templateUrl: './inserimento-manuale.component.html',
  styleUrls: ['./inserimento-manuale.component.scss']
})
export class InserimentoManualeComponent implements OnInit {

  public _callerData: ExternalAppDataRS;

  @ViewChild('fileInput') fileInput: FileUpload;
  public subscriptions: Subscription[] = [];
  public actualPrincipale: Allegato;

  public tipiCoinvolti: SelectItem[];
  public codiciRegistriAmmessi: Registro[];

  public selectedTipo: SelectItem;
  public selectedTipoCoinvolto: string;
  public selectedCodiceRegistro: Registro;

  public applicazione: string = 'ARPAL UMBRIA';
  public _doc: Document;
  public selectedAllegato: Allegato;
  public progress: number = 0;
  public refreshTable: boolean = false;
  public display: boolean = false;
  public uploadedFiles: File[] = [];
  public selectedValue: string;

  public blockedPanelDoc: boolean = false;
  public blockedPanelUpload: boolean = false;
  public blockedPanelInserimentoManuale: boolean = false;
  public azienda: Azienda;
  public _strutturaInternautaSelezionata: Struttura = new Struttura();
  public _fascicoloArgoSelezionato: FascicoloArgo;
  public modalError: boolean = false;
  public formGroup: FormGroup;
  public visualizzaCoinvolti: boolean = false;

  public oggetto: string;

  public cols: any[] = [
    {
      field: "codice",
      header: "Numero",
      width: "6.25rem",
      label: "Numero Raccolta Semplice",
      textAlign: "center"
    }
  ];

  public s : Struttura = new Struttura();
  public optionFascicoli = [];
  public filteredOptions;
  public missingData: string[] = [];
  public selectedFascicolo: FascicoloArgo;
  public filteredFascicoli: FascicoloArgo[];
  public selectedFascicoli: FascicoloArgo[] = [];
  public isOldContatto = true;
  public selectedDoc: DocumentoArgo;
  public filteredDocs: DocumentoArgo[];
  public selectedDocumentoBabel: DocumentoArgo;
  public additionalControl: boolean;
  public titoloHeader: string;
  public prefixHeader: string;

  @ViewChild("fileUpload") fileUploadInput: FileUpload;

  @Input() set doc(value: Document) {
    this._doc = value;
  }

  public loggedUser: UtenteUtilities;

  // parte coinvolti
  public coinvoltoDialog: boolean;
  public coinvolti: PersonaRS[];
  public coinvolto: PersonaRS;
  public submitted: boolean;
  public oldContatto: Contatto;
  public selectedContatto: Contatto;
  public selectedContatti: Contatto[] = [];
  public filteredContatti: Contatto[];
  public disabledContatto: boolean;
  public oldDettagliContatti: DettaglioContatto[]; 
  public selectedDettaglioContatto: DettaglioContatto;
  public selectedDettagliContatti: DettaglioContatto[] = [];
  public filteredDettagliContatti: DettaglioContatto[];
  public disabledDettaglioContatto: boolean;
  public mapEditCoinvolto: Map<string, string> = new Map;
  public panelOpenStateDati: string = "Incompleto"
  public panelOpenState: boolean = true;
  public tipologieDocumenti$: SelectItem[] = [];
  public mapNewContatto: Map<string, string>;
  public displayRubricaPopup = false;
  public progressBarEnable = false;
  public displayModal: boolean;
  public numerazioneRSCreata: string = "";
  public esitoCreazioneRS: string = "Creazione Raccolta Semplice in corso...";
  public creazioneInCorso: boolean = true;

  public username: string;

  constructor(private messageService: MessageService,
    private allegatoService: ExtendedAllegatoService,
    private raccoltaService: RaccoltaSempliceService,
    private confirmationService: ConfirmationService,
    private contattoService: ContattoService,
    private dettaglioContattoService: DettaglioContattoService,
    private fb: FormBuilder,
    private http: HttpClient,
    private loginService: JwtLoginService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.prefixHeader = "Collega Documento Babel: ";
    this.titoloHeader = this.prefixHeader;
    this.selectedCodiceRegistro = { descrizione: 'Protocollo Generale [PG]', tipo: 'pg' };

    this.tipiCoinvolti = [
      { label: "Fisica", value: "FISICA" },
      { label: "Giuridica", value: "GIURIDICA" }
    ];

    this.disabledDettaglioContatto = true;
    this.disabledContatto = false;


  }

  onClear() {
    this.titoloHeader = this.prefixHeader;
    this.selectedDocumentoBabel = null;
  }

  strutturaSelezionata(struttura: Struttura) {
    this._strutturaInternautaSelezionata = struttura;
    console.log("Struttura 2: ", this._strutturaInternautaSelezionata)
  }

  fascicoloSelezionato(fascicolo: FascicoloArgo) {
    this._fascicoloArgoSelezionato = fascicolo;
  }

  blocca(value: string) {
    console.log(value);
    console.log(this.selectedValue);
    if (value === "doc") {
      this.blockedPanelDoc = false;
      this.blockedPanelUpload = true;
    } else {
      this.blockedPanelDoc = true;
      this.blockedPanelUpload = false;
    }
  }


  public resetFields(): void {

  }


  ngOnInit(): void {
    this.coinvolti = [];
    
    //this.s = this._strutturaInternautaSelezionata;
    this.s["campoDaMostrare"] = " ";
    console.log("Struttura: ", this._strutturaInternautaSelezionata)


    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      if (u) {
        this.loggedUser = u;
        this.azienda = u.getUtente().aziendaLogin;
        this.username = u.getUtente().username;
        console.log("Utente: ", this.username)
        console.log("Azienda: ", u.getUtente().aziendaLogin);
        // la funzione atob server per decodificare la stringa base64 con cui viene passato dataForRubricaInternauta per evitare problemi coi caratteri strambi
        if (!!sessionStorage.getItem("dataForInsertRaccoltaSemplice")) {
          console.log("dataForInsertRaccoltaSemplice trovati");
          this._callerData = JSON.parse(atob(sessionStorage.getItem("dataForInsertRaccoltaSemplice")));
          this.openFromRecord();
        } else {
          console.log("dataForInsertRaccoltaSemplice NON trovati");
        }
        this.raccoltaService.getTipologia(this.azienda.codice).subscribe(tipo => {
          tipo.body.forEach(elem => {
            const select = { label: elem, value: elem };
            this.tipologieDocumenti$.push(select);
          });
        });
      }
    }
    ));
  }

  public chiudiErrore() {
    this.modalError = false;
    this.missingData = [];
  }


  // apre interfaccia di inserimento con dati prepopolati perchè aperto da Pico, ecc...
  openFromRecord() {
    if (this._callerData) {
      const codice: string = "100" + this.azienda.codice;
      const docToSearch = this._callerData.protocollo + "/" + this._callerData.anno;
      
      if(this._callerData.fascicoli != null) {
        if (this._callerData.fascicoli.length > 0 && this.selectedFascicoli.length==0) {
          for (let i = 0; i < this._callerData.fascicoli.length; i++) {
            // setta, se ci sono, i fascicoli del documento
            var fasc: FascicoloArgo = new FascicoloArgo();
            fasc.numerazioneGerarchica = this._callerData.fascicoli[i];
            this.selectedFascicoli.push(fasc);
          }
        }
      }
     this._strutturaInternautaSelezionata.id = parseInt(this._callerData.struttura);
      this.s["campoDaMostrare"] = this._callerData.nome;

      this.raccoltaService.getDocumentiArgo(codice, this.username, 'PG', docToSearch).subscribe(res => {
        this.selectedDoc = res.body[0];
        this.oggetto = this.selectedDoc.oggetto;
      });

      console.log("protocollo: ", this._callerData.protocollo);
      console.log("codiceAzienda: ", this._callerData.codiceAzienda);
    }
  }


  openNew() {
    this.coinvolto = new PersonaRS();
    this.submitted = false;
    this.coinvoltoDialog = true;
  }

  /**
     * Apre popup
     */
  onOpenRubricaPopup() {
    console.log("onOpenRubricaPopup");
    this.displayRubricaPopup = true;
  }

  onCloseRubricaPopup() {
    console.log("onCloseRubricaPopup");
    this.displayRubricaPopup = false;
  }

  notEmptyText(s: string) : boolean {
    if(s != null && s.trim() != "")
      return true;
    else
      return false;
  }

  hideDialog() {
    this.coinvoltoDialog = false;
    this.submitted = false;
  }

  addNewContatto() {
    this.mapNewContatto = new Map<string, string>();
    let warning = false;
    let missingPart = "";
    this.coinvolto.tipologia = this.selectedTipoCoinvolto;
    if((this.coinvolto.tipologia != "GIURIDICA" 
    && this.coinvolto.tipologia != "FISICA") || this.coinvolto.tipologia == null 
    || this.coinvolto == undefined) {
      warning = true;
      missingPart = missingPart + "Tipologia" ;
    }
    if((this.coinvolto.tipologia == "FISICA") && this.coinvolto.nome.trim() == "" ) {
      warning = true;
      missingPart = missingPart + "Nome " ;
    }
    if((this.coinvolto.tipologia == "FISICA") && this.coinvolto.cognome.trim() == "" ) {
      warning = true;
      missingPart = missingPart + "Cognome ";
    }
    if((this.coinvolto.tipologia == "FISICA") && this.coinvolto.cf.trim() == "" ) {
      warning = true;
      missingPart = missingPart + "CF" + "\n";
    }
    if((this.coinvolto.tipologia == "GIURIDICA") && this.coinvolto.ragioneSociale.trim() == "" ) {
      warning = true;
      missingPart = missingPart + "Ragione sociale ";
    }
    if((this.coinvolto.tipologia == "GIURIDICA") && this.coinvolto.partitaIva.trim() == "" ) {
      warning = true;
      missingPart = missingPart + "P.IVA ";
    }
    if(warning) {
      this.messageService.add({ severity: 'warn', summary: 'Attenzione', detail: 'Parti necessarie: ' + missingPart, life: 3000 });
      missingPart = "";
    }
    else {
      if(this.coinvolto.tipologia == "FISICA") {
        this.mapNewContatto.set("nome", this.coinvolto.nome);
        this.mapNewContatto.set("cognome", this.coinvolto.cognome);
        this.mapNewContatto.set("codice_fiscale", this.coinvolto.cf);
        this.mapNewContatto.set("descrizione", this.coinvolto.nome + " " + this.coinvolto.cognome);
      }
      else {
        this.mapNewContatto.set("ragione_sociale", this.coinvolto.ragioneSociale);
        this.mapNewContatto.set("p_iva", this.coinvolto.partitaIva);
        this.mapNewContatto.set("descrizione", this.coinvolto.ragioneSociale);
      }
        this.mapNewContatto.set("tipologia", this.coinvolto.tipologia);
        this.mapNewContatto.set("provenienza", "Raccolta Semplice");
        
        if(this.notEmptyText(this.coinvolto.mail)) {
          this.mapNewContatto.set("email", this.coinvolto.mail);
        }
    
        if(this.notEmptyText(this.coinvolto.telefono)) {
          this.mapNewContatto.set("telefono", this.coinvolto.telefono);
        }
    
        if(this.notEmptyText(this.coinvolto.via) || this.notEmptyText(this.coinvolto.civico) ||
        this.notEmptyText(this.coinvolto.cap) ||  this.notEmptyText(this.coinvolto.comune) ||
        this.notEmptyText(this.coinvolto.provincia) || this.notEmptyText(this.coinvolto.nazione)) {
          this.mapNewContatto.set("via", this.coinvolto.via);
          this.mapNewContatto.set("civico", this.coinvolto.civico);
          this.mapNewContatto.set("cap", this.coinvolto.cap);
          this.mapNewContatto.set("comune", this.coinvolto.comune);
          this.mapNewContatto.set("provincia", this.coinvolto.provincia);
          this.mapNewContatto.set("provincia", this.coinvolto.provincia);
        }
        let count = 0;
        let stringBody = "[{ ";
        for(let key of this.mapNewContatto.keys()) {
          stringBody = stringBody + "\"" + key + "\":\"" + this.mapNewContatto.get(key) + "\"";
          if(count < (this.mapNewContatto.size - 1)) 
            stringBody = stringBody + ","
            count++;
        }
        
        stringBody = stringBody + " }]";
        let body: JSON = JSON.parse(stringBody);
        this.subscriptions.push(
          this.raccoltaService.addContatto(this.azienda.codice, body)
            .subscribe((res: string) => {
              console.log("RES: ", res);
              this.coinvolto.id = Number(res);
            }
            )
          );
          console.log("Coinvolto:", this.coinvolto.id);
          if (this.selectedTipoCoinvolto === "GIURIDICA" && this.coinvolto.ragioneSociale !== undefined && this.coinvolto.ragioneSociale !== "") {
            this.coinvolto.nomeInterfaccia = this.coinvolto.ragioneSociale;
          } else if (this.coinvolto.nome && this.coinvolto.cognome) {
            this.coinvolto.nomeInterfaccia = this.coinvolto.nome + " " + this.coinvolto.cognome;
          } else if (this.coinvolto.nome) {
            this.coinvolto.nomeInterfaccia = this.coinvolto.nome;
          } else {
            this.coinvolto.nomeInterfaccia = "";
          }
      
          if (this.coinvolto.guidInterfaccia) {
            this.coinvolto.tipologia = this.selectedTipoCoinvolto;
            this.coinvolti[this.findIndexByGuid(this.coinvolto.guidInterfaccia)] = this.coinvolto;
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Coinvolto aggiornato', life: 3000 });
          }
          else {
            this.coinvolto.guidInterfaccia = this.createGuid();
            this.coinvolto.tipologia = this.selectedTipoCoinvolto;
      
            this.coinvolti.push(this.coinvolto);
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Coinvolto aggiunto', life: 3000 });
          }
          

        console.log("Body:", body);
        this.coinvoltoDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Coinvolto inserito in rubrica', life: 3000 });       
    } 

  }

  saveCoinvoltoCreato() {
    this.submitted = true;
    console.log("tipo: " + this.selectedTipoCoinvolto);

    console.log("Coinvolto:", this.coinvolto);
    console.log("Dettaglio:", this.selectedDettaglioContatto.id);
    if (this.selectedTipoCoinvolto === "GIURIDICA" && this.coinvolto.ragioneSociale !== undefined && this.coinvolto.ragioneSociale !== "") {
      this.coinvolto.nomeInterfaccia = this.coinvolto.ragioneSociale;
    } else if (this.coinvolto.nome && this.coinvolto.cognome) {
      this.coinvolto.nomeInterfaccia = this.coinvolto.nome + " " + this.coinvolto.cognome;
    } else if (this.coinvolto.nome) {
      this.coinvolto.nomeInterfaccia = this.coinvolto.nome;
    } else {
      this.coinvolto.nomeInterfaccia = "";
    }

    if (this.coinvolto.guidInterfaccia) {
      this.coinvolto.tipologia = this.selectedTipoCoinvolto;
      this.coinvolti[this.findIndexByGuid(this.coinvolto.guidInterfaccia)] = this.coinvolto;
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Coinvolto aggiornato', life: 3000 });
    }
    else {
      this.coinvolto.guidInterfaccia = this.createGuid();
      this.coinvolto.tipologia = this.selectedTipoCoinvolto;

      this.coinvolti.push(this.coinvolto);
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Coinvolto aggiunto', life: 3000 });
    }
    console.log("OldDettagliContatto: ", this.oldDettagliContatti);
    // let listaMezzi : string = "";
    
    switch(this.selectedDettaglioContatto.tipo) {
      case "EMAIL" :{
        if(this.selectedDettaglioContatto.descrizione != this.coinvolto.mail && (this.notEmptyText(this.coinvolto.mail))) {
          this.mapEditCoinvolto.set("idMail", this.selectedDettaglioContatto.id.toString());
          this.mapEditCoinvolto.set("mail", this.coinvolto.mail);
          console.log("Aggiornato mail :", this.coinvolto.mail)
         }
         break;
      }
      case "TELEFONO": {
        if(this.selectedDettaglioContatto.descrizione != this.coinvolto.telefono && (this.notEmptyText(this.coinvolto.telefono))) {
          console.log("Dentro al case telefono")
          this.mapEditCoinvolto.set("telefono", this.coinvolto.telefono);
          this.mapEditCoinvolto.set("idTelefono", this.selectedDettaglioContatto.id.toString());
          console.log("Aggiornato telefono: ", this.coinvolto.telefono)
         }
         break;
      }
      case "INDIRIZZO_FISICO" : {
        if(this.notEmptyText(this.coinvolto.via) || this.notEmptyText(this.coinvolto.civico) ||
        this.notEmptyText(this.coinvolto.cap) ||  this.notEmptyText(this.coinvolto.comune) ||
        this.notEmptyText(this.coinvolto.provincia) || this.notEmptyText(this.coinvolto.nazione)){
         if(this.selectedDettaglioContatto.descrizione.replace(",", " ").trim() != (this.coinvolto.via + this.coinvolto.civico + 
         this.coinvolto.cap +  this.coinvolto.comune + this.coinvolto.provincia + this.coinvolto.nazione).trim()) {
           if(this.notEmptyText(this.coinvolto.via)) {
             this.mapEditCoinvolto.set("via", this.coinvolto.via)
           }
           else{
             this.coinvolto.via = ""
             this.mapEditCoinvolto.set("via", this.coinvolto.via)
           }

           if(this.notEmptyText(this.coinvolto.civico)) {
             this.mapEditCoinvolto.set("civico", this.coinvolto.civico)
           }
           else{
             this.coinvolto.civico = ""
             this.mapEditCoinvolto.set("civico", this.coinvolto.civico)
           }

           if(this.notEmptyText(this.coinvolto.cap)) {
             this.mapEditCoinvolto.set("cap", this.coinvolto.cap)
           }
           else{
             this.coinvolto.cap = ""
             this.mapEditCoinvolto.set("cap", this.coinvolto.cap)
           }
           
           if(this.notEmptyText(this.coinvolto.comune)) {
             this.mapEditCoinvolto.set("comune", this.coinvolto.comune)
           }
           else{
             this.coinvolto.comune = ""
             this.mapEditCoinvolto.set("comune", this.coinvolto.comune)
           }

           if(this.notEmptyText(this.coinvolto.provincia)) {
             this.mapEditCoinvolto.set("provincia", this.coinvolto.provincia)
           }
           else{
             this.coinvolto.provincia = ""
             this.mapEditCoinvolto.set("provincia", this.coinvolto.provincia)
           }

           if(this.notEmptyText(this.coinvolto.nazione)) {
             this.mapEditCoinvolto.set("nazione", this.coinvolto.nazione)
           }
           else{
             this.coinvolto.nazione = ""
             this.mapEditCoinvolto.set("nazione", this.coinvolto.nazione)
           }
           this.mapEditCoinvolto.set("idIndirizzo", this.selectedDettaglioContatto.id.toString());
           console.log("Indirizzo editato: ", this.coinvolto.via)
           break;
         }   
        }
      }
    }


    this.oldDettagliContatti.forEach((dettaglio: DettaglioContatto) => {
    //  switch(dettaglio.tipo){
    //    case "EMAIL" :{
    //      if(dettaglio.descrizione != this.coinvolto.mail && (this.notEmptyText(this.coinvolto.mail))) {
    //       this.mapEditCoinvolto.set("idMail", dettaglio.id.toString());
    //       this.mapEditCoinvolto.set("mail", this.coinvolto.mail);
    //       console.log("Aggiornato mail :", this.coinvolto.mail)
    //      }
    //      break;
    //    }
    //    case "TELEFONO":{
    //      if(dettaglio.descrizione != this.coinvolto.telefono && (this.notEmptyText(this.coinvolto.telefono))) {
    //       console.log("Dentro al case telefono")
    //       this.mapEditCoinvolto.set("telefono", this.coinvolto.telefono);
    //       this.mapEditCoinvolto.set("idTelefono", dettaglio.id.toString());
    //       console.log("Aggiornato telefono: ", this.coinvolto.telefono)
    //      }
    //      break;
    //    }
    //    case "INDIRIZZO_FISICO" : {
    //      if(this.notEmptyText(this.coinvolto.via) || this.notEmptyText(this.coinvolto.civico) ||
    //      this.notEmptyText(this.coinvolto.cap) ||  this.notEmptyText(this.coinvolto.comune) ||
    //      this.notEmptyText(this.coinvolto.provincia) || this.notEmptyText(this.coinvolto.nazione)){
    //       if(dettaglio.descrizione.replace(",", " ").trim() != (this.coinvolto.via + this.coinvolto.civico + 
    //       this.coinvolto.cap +  this.coinvolto.comune + this.coinvolto.provincia + this.coinvolto.nazione).trim()) {
    //         if(this.notEmptyText(this.coinvolto.via)) {
    //           this.mapEditCoinvolto.set("via", this.coinvolto.via)
    //         }
    //         else{
    //           this.coinvolto.via = ""
    //           this.mapEditCoinvolto.set("via", this.coinvolto.via)
    //         }

    //         if(this.notEmptyText(this.coinvolto.civico)) {
    //           this.mapEditCoinvolto.set("civico", this.coinvolto.civico)
    //         }
    //         else{
    //           this.coinvolto.civico = ""
    //           this.mapEditCoinvolto.set("civico", this.coinvolto.civico)
    //         }

    //         if(this.notEmptyText(this.coinvolto.cap)) {
    //           this.mapEditCoinvolto.set("cap", this.coinvolto.cap)
    //         }
    //         else{
    //           this.coinvolto.cap = ""
    //           this.mapEditCoinvolto.set("cap", this.coinvolto.cap)
    //         }
            
    //         if(this.notEmptyText(this.coinvolto.comune)) {
    //           this.mapEditCoinvolto.set("comune", this.coinvolto.comune)
    //         }
    //         else{
    //           this.coinvolto.comune = ""
    //           this.mapEditCoinvolto.set("comune", this.coinvolto.comune)
    //         }

    //         if(this.notEmptyText(this.coinvolto.provincia)) {
    //           this.mapEditCoinvolto.set("provincia", this.coinvolto.provincia)
    //         }
    //         else{
    //           this.coinvolto.provincia = ""
    //           this.mapEditCoinvolto.set("provincia", this.coinvolto.provincia)
    //         }

    //         if(this.notEmptyText(this.coinvolto.nazione)) {
    //           this.mapEditCoinvolto.set("nazione", this.coinvolto.nazione)
    //         }
    //         else{
    //           this.coinvolto.nazione = ""
    //           this.mapEditCoinvolto.set("nazione", this.coinvolto.nazione)
    //         }
    //         this.mapEditCoinvolto.set("idIndirizzo", dettaglio.id.toString());
    //         console.log("Indirizzo editato: ", this.coinvolto.via)
    //         break;
    //       }   
    //      }
    //    }
    //  }
    //  console.log("Dettaglio: ", dettaglio.descrizione, "ID: ", dettaglio.id, "Mezzo: ", dettaglio.tipo);
    //  listaMezzi = listaMezzi + dettaglio.tipo + ",";
    });

    if(this.notEmptyText(this.coinvolto.mail)) {
      this.mapEditCoinvolto.set("mail", this.coinvolto.mail);
    }

    if(this.notEmptyText(this.coinvolto.telefono)) {
      this.mapEditCoinvolto.set("telefono", this.coinvolto.telefono);
    }

    if(this.notEmptyText(this.coinvolto.via) || this.notEmptyText(this.coinvolto.civico) ||
    this.notEmptyText(this.coinvolto.cap) ||  this.notEmptyText(this.coinvolto.comune) ||
    this.notEmptyText(this.coinvolto.provincia) || this.notEmptyText(this.coinvolto.nazione)) {
      this.mapEditCoinvolto.set("via", this.coinvolto.via);
      this.mapEditCoinvolto.set("civico", this.coinvolto.civico);
      this.mapEditCoinvolto.set("cap", this.coinvolto.cap);
      this.mapEditCoinvolto.set("comune", this.coinvolto.comune);
      this.mapEditCoinvolto.set("provincia", this.coinvolto.provincia);
      this.mapEditCoinvolto.set("provincia", this.coinvolto.provincia);
    }

    console.log("Map prima dell'edit: ", this.mapEditCoinvolto)
    this.subscriptions.push(
      this.raccoltaService.editRubrica(this.azienda.codice, this.coinvolto, this.mapEditCoinvolto)
        .subscribe((res: string) => {
          console.log("RES: ", res);

        }
        )
      )
    this.mapEditCoinvolto = new Map;
    console.log("Map post edit", this.mapEditCoinvolto);
    this.coinvolti = [...this.coinvolti];
    this.coinvoltoDialog = false;
    this.coinvolto = new PersonaRS();
  }

  editCoinvolto(coinvolto: PersonaRS) {
    this.coinvolto = { ...coinvolto };
    this.isOldContatto = true;
    console.log("Conivolto dentro editCoinvolto: ", coinvolto);
    this.coinvoltoDialog = true;
  }

  newContatto() {
    this.isOldContatto = false;
    this.coinvolto = new PersonaRS();
    this.coinvolto.nome = "";
    this.coinvolto.cognome = "";
    this.coinvolto.ragioneSociale = "";
    this.coinvolto.partitaIva = "";
    this.coinvolto.cf = "";
    this.coinvoltoDialog = true;
  }



  findIndexByGuid(guid: string): number {
    let index = -1;
    for (let i = 0; i < this.coinvolti.length; i++) {
      if (this.coinvolti[i].guidInterfaccia === guid) {
        index = i;
        break;
      }
    }
    return index;
  }

  createGuid(): string {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  deleteCoinvolto(persona: PersonaRS) {
    this.confirmationService.confirm({
      message: 'Confermare la cancellazione del seguente coinvolto? <b>' + persona.nomeInterfaccia + '</b>',
      header: 'Elimina coinvolto',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: "Si",
      rejectLabel: "Annulla",
      accept: () => {
        this.coinvolti = this.coinvolti.filter(val => val.id !== persona.id);
        this.coinvolto = new PersonaRS();
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Coinvolto eliminato', life: 3000 });
      }
    });
  }

  initForm() {

  }

  /**
 * Chiamato dal frontend per salvare il destinatario passato
 * @param contatto 
 * @param modalita 
 */
  public saveFascicolo(fascicolo: FascicoloArgo) {
    console.log("inserito", fascicolo.nomeFascicoloInterfaccia);
    this.selectedFascicoli.push(fascicolo);
    this.selectedFascicolo = null;
  }

  public searchFascicolo(event: any) {
    console.log("Utente:", this.loggedUser.getUtente());
    this.raccoltaService.getFascicoliArgo('100999', this.loggedUser.getUtente().username, event.query).subscribe(res => {
      this.filteredFascicoli = res.body;
    });
  }

  deleteFascicolo(i: number) {
    this.selectedFascicoli.splice(i, 1);
  }

  public saveContatto(contatto: Contatto) {
    //this.selectedContatti.push(contatto);
    this.selectedContatto = contatto;
    this.oldContatto = this.selectedContatto;
    this.disabledDettaglioContatto = false;
    this.disabledContatto = true;
    this.searchDettaglioContatto(contatto.id);
  }

  public searchContatto(event: any) {
    const fd: FilterDefinition = new FilterDefinition("descrizione", FILTER_TYPES.string.containsIgnoreCase, event.query);
    const filter: FiltersAndSorts = new FiltersAndSorts();
    filter.addFilter(fd);
    this.contattoService.getData(null, filter).subscribe(res => {
      if (res) {
        this.filteredContatti = res.results;
      }
    });
  }

  public searchDettaglioContatto(idContatto: any) {
    const fd: FilterDefinition = new FilterDefinition("idContatto", FILTER_TYPES.not_string.equals, idContatto);
    const filter: FiltersAndSorts = new FiltersAndSorts();
    filter.addFilter(fd);
    this.dettaglioContattoService.getData(null, filter).subscribe(res => {
      if (res) {
        this.filteredDettagliContatti = res.results;
        this.oldDettagliContatti = this.filteredDettagliContatti;
      }
    });
  }

  public saveDettaglioContatto(dettaglio: DettaglioContatto) {
    console.log("DETTAGLIO: " + dettaglio.tipo)
    this.selectedDettaglioContatto = dettaglio;
  }

  public removeContatto() {
    this.disabledContatto = false;
    this.disabledDettaglioContatto = true;
    this.selectedContatto = null;
    this.filteredDettagliContatti = [];
  }

  public alreadyInserted(idContattoDaInserire): boolean {
    var i: number;
    for (i = 0; i < this.coinvolti.length; i++) {
      if (this.coinvolti[i].id === idContattoDaInserire) {
        return true;
      }
    }
    return false;
  }

  public insertContatto(dettaglio: DettaglioContatto) {
    console.log(dettaglio);
    this.selectedDettaglioContatto = dettaglio;
    if (!this.alreadyInserted(this.selectedContatto.id)) {
      const nuovoCoinvolto: PersonaRS = new PersonaRS();
      nuovoCoinvolto.id = this.selectedContatto.id;
      nuovoCoinvolto.guidInterfaccia = this.createGuid();
      nuovoCoinvolto.cf = this.selectedContatto.codiceFiscale;
      nuovoCoinvolto.nome = this.selectedContatto.nome;
      nuovoCoinvolto.cognome = this.selectedContatto.cognome;
      nuovoCoinvolto.partitaIva = this.selectedContatto.partitaIva;

      if (this.selectedContatto.ragioneSociale) {
        nuovoCoinvolto.ragioneSociale = this.selectedContatto.ragioneSociale;
        nuovoCoinvolto.tipologia = "GIURIDICA";
      } else {
        nuovoCoinvolto.tipologia = "FISICA";
      }


      nuovoCoinvolto.nomeInterfaccia = this.selectedContatto.descrizione;


      if (dettaglio.tipo === "EMAIL") {
        nuovoCoinvolto.mail = dettaglio.descrizione;
      } else if (dettaglio.tipo === "TELEFONO") {
        nuovoCoinvolto.telefono = dettaglio.descrizione;

      } else if (dettaglio.tipo === "INDIRIZZO_FISICO") {
        if (dettaglio.indirizzo) {
          nuovoCoinvolto.via = (dettaglio.indirizzo.via ? dettaglio.indirizzo.via : null);
          nuovoCoinvolto.cap = (dettaglio.indirizzo.cap ? dettaglio.indirizzo.cap : null);
          nuovoCoinvolto.provincia = (dettaglio.indirizzo.provincia ? dettaglio.indirizzo.provincia : null);
          nuovoCoinvolto.comune = (dettaglio.indirizzo.comune ? dettaglio.indirizzo.comune : null);
          nuovoCoinvolto.civico = (dettaglio.indirizzo.civico ? dettaglio.indirizzo.civico : null);
        } else {
          nuovoCoinvolto.via = dettaglio.descrizione;
        }

      }
      this.coinvolti.push(nuovoCoinvolto);
      this.coinvolti = [...this.coinvolti];
      this.coinvoltoDialog = false;
      this.displayRubricaPopup = false;
      this.coinvolto = new PersonaRS();
    } else {
      this.messageService.add({ severity: 'error', summary: 'Operazione non consentita', detail: 'Contatto già presente nei coinvolti', life: 3000 });
    }
  }


  searchDocBabel(event: any) {
    this.raccoltaService.getDocumentiArgo('100999', 'andrea.marcomini', 'PG', event.query).subscribe(res => {
      this.filteredDocs = res.body;
      console.log(this.filteredDocs);
    });
  }

  public saveDocBabel(doc: DocumentoArgo) {
    this.selectedDocumentoBabel = doc;
    this.titoloHeader = this.prefixHeader + ": " + doc.codiceRegistro + doc.numero + "/" + doc.anno
  }

  public tornaIndietro() {
    CustomReuseStrategy.componentsReuseList.push("*");
    this.router.navigate(['../raccoltasemplice'], { relativeTo: this.activatedRoute });
  }

  /**
   * @param event 
   */
  public onUpload(event: any): void {
    console.log("formDataformDataformData", event);
    let formData: FormData = this.buildFormData(event);
    this.subscriptions.push(this.allegatoService.uploadAllegato(formData).subscribe((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.Sent:
          this.progress = 5;
          this.setProgressBarWidth(this.progress);
          break;
        case HttpEventType.ResponseHeader:
          this.progress = this.progress + 5;
          this.setProgressBarWidth(this.progress);
          if (!event.ok && !(event.status === 200)) {
            this.messageService.add({
              severity: "error",
              summary: `Error code ${event.status}`,
              detail: "Backend Error, I dati passati per l'importazione sono assenti o non corretti."
            });
          }
          break;
        case HttpEventType.UploadProgress:
          this.progress = this.progress + Math.round((event.loaded / event.total * 100) - 20);
          this.setProgressBarWidth(this.progress);
          break;
        case HttpEventType.Response:
          const res: Allegato[] = event.body;
          this._doc.allegati = res;
          if (this._doc.allegati.length > 0) {
            this.actualPrincipale = this._doc.allegati.find(a => a.principale);
          }
          this.progress = this.progress + 10;
          this.setProgressBarWidth(this.progress);
          this.refreshTable = true;
          setTimeout(() => {
            this.progress = 0;
            this.setProgressBarWidth(this.progress);
            this.onCloseFileUploadDialog();
            this.refreshTable = false;
          }, 7000);
      }
    }));

    this.messageService.add({ severity: 'info', summary: 'File caricato', detail: '' });
  }

  public loadTipologie(azienda: string): string[] {
    let tipologie: string[];

    this.subscriptions.push(this.raccoltaService.getTipologia(this.azienda.codice)
      .subscribe((res: HttpResponse<string[]>) => {
        tipologie = res.body;
        console.log("loadTipo: ", tipologie);
      })
    )

    return tipologie;
  }

  private buildFormData(event: any): FormData {
    this.uploadedFiles = event.files;
    const formData: FormData = new FormData();
    formData.append("idDoc", this._doc.id.toString());
    formData.append("numeroProposta", "6");
    this.uploadedFiles.forEach((file: File) => {
      formData.append("files", file);
    });
    return formData;
  }

  private setProgressBarWidth(progress: number): void {
    const progressBar = document.querySelector("div.p-progressbar-value.p-progressbar-value-animate");
    progressBar.setAttribute("style", `width: ${progress}%; display: block;`);
  }

  public onCloseFileUploadDialog(): void {
    this.display = false;
    this.selectedTipo = null;
    this.fileUploadInput.clear();
  }

  public onDownloadAttachment(allegato: Allegato): void {
    let dettaglioAllegato: DettaglioAllegato = this.getDettaglioByTipoDettaglioAllegato(allegato, "ORIGINALE");
    this.allegatoService.downloadAttachment(dettaglioAllegato).subscribe(
      response =>
        UtilityFunctions.downLoadFile(response, dettaglioAllegato.mimeType, dettaglioAllegato.nome + "." + dettaglioAllegato.estensione, false)
    );
  }

  public downloadAllAttachments(): void {
    this.allegatoService.downloadAllAttachments(this._doc).subscribe(
      response =>
        UtilityFunctions.downLoadFile(response, "application/zip", "allegati.zip")

    );
  }

  private loadAllegati() {
    const filters: FiltersAndSorts = new FiltersAndSorts();
    filters.addFilter(new FilterDefinition("idDoc", FILTER_TYPES.not_string.equals, this._doc.id));
    filters.addSort(new SortDefinition("numeroAllegato", SORT_MODES.asc));
    this.allegatoService.getData(null, filters, null, null).subscribe(
      (res: any) => {
        this._doc.allegati = [...res.results];
        // this.setInitialData();
      }
    );
  }

  public onDeleteAttachment(allegato: Allegato, rowIndex: number): void {
    this.allegatoService.deleteHttpCall(allegato.id).subscribe(
      res => {
        this.messageService.add({
          severity: 'success',
          summary: 'Allegato',
          detail: 'Allegato eliminato con successo'
        });
        this.loadAllegati();
      }
    );
  }

  /**
   * @param event 
   */
  public onRowSelect(event: any): void {
    const batchOperations: BatchOperation[] = [];
    if (this.selectedAllegato) {
      batchOperations.push({
        operation: BatchOperationTypes.UPDATE,
        entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.allegato.path,
        id: this.selectedAllegato.id,
        entityBody: {
          version: this.selectedAllegato.version,
          principale: true
        } as NextSdrEntity,
      } as BatchOperation);
      if (this.actualPrincipale) {
        batchOperations.push({
          operation: BatchOperationTypes.UPDATE,
          entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.allegato.path,
          id: this.actualPrincipale.id,
          entityBody: {
            version: this.actualPrincipale.version,
            principale: false
          } as NextSdrEntity,
        } as BatchOperation);
      }
      this.subscriptions.push(
        this.allegatoService.batchHttpCall(batchOperations).subscribe(
          (res: BatchOperation[]) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Allegato',
              detail: 'Allegato principale impostato con successo'
            });
            if (this.actualPrincipale) {
              this.actualPrincipale.principale = false;
              this.actualPrincipale.version = (res.find(b =>
                (b.entityBody as Allegato).id === this.actualPrincipale.id
              ).entityBody as Allegato).version;
            }
            this.selectedAllegato.principale = true;
            this.selectedAllegato.version = (res.find(b =>
              (b.entityBody as Allegato).id === this.selectedAllegato.id
            ).entityBody as Allegato).version;
            this.actualPrincipale = this.selectedAllegato;
          })
      );
    }
  }

  onSelect(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    for (let file of this.uploadedFiles) {
      console.log("file: " + file.name);
    }
  }

  onRemove(event: any) {
    this.uploadedFiles.forEach((element, index) => {
      if (element.name == event.file.name) this.uploadedFiles.splice(index, 1);
    });
    for (let file of this.uploadedFiles) {
      console.log("file rimanenti: " + file.name);
    }
  }

  public onRowUnselect(): void {
    if (this.actualPrincipale) {
      this.subscriptions.push(
        this.allegatoService.patchHttpCall({
          version: this.actualPrincipale.version,
          principale: false
        } as NextSdrEntity, this.actualPrincipale.id, null, null).subscribe(
          (allegato: Allegato) => {
            this.actualPrincipale.version = allegato.version;
            this.actualPrincipale.principale = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Allegato',
              detail: 'Allegato principale deselezionato'
            });
            this.actualPrincipale = null;
          }
        )
      );
    }
  }

  public showModalError() {
    this.modalError = true;
    this.displayModal = false;
  }

  public closeConfirm() {
    this.displayModal = false;

    // ricarica la pagina
    window.location.reload();
  }


  public delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public onSubmit() {

    if (!this.check()) {
      this.modalError = true;
      console.log("Sono entrato nell'if");
      return this.showModalError();
    }

    console.log("Check passato");
    this.creazioneInCorso = true;
    this.showModalDialog();

    var formData: FormData = this.createFormData();

    this.raccoltaService.createRs(formData).subscribe(
      response => {
        console.log("Inizio resp);")
        this.creazioneInCorso = false;
        this.progressBarEnable = false;
        this.esitoCreazioneRS = "Raccolta Semplice creata con successo";
        console.log("Pre response");
        this.numerazioneRSCreata = response;
        console.log("Finito tutto");
      },
      error => {
        console.log("Sono nell'errore");
        this.progressBarEnable = false;
        this.creazioneInCorso = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Creazione Raccolta Semplice',
          detail: error
        });
      });

    console.log("Tutto ok");
  }

  public showModalDialog() {
    this.progressBarEnable = true;
    this.displayModal = true;
  }

  private stringifyFascicoli(): string {
    let a = [];

    for (let i = 0; i < this.selectedFascicoli.length; i++) {
      a.push(this.selectedFascicoli[i].numerazioneGerarchica);
    }

    // Converting the object to JSON...
    let json = JSON.stringify(a);

    return json;
  }

  private check(): boolean {
    this.additionalControl = true;

    if (this.oggetto == "" || this.oggetto == undefined) {
      console.log("Oggetto vuoto");
      this.missingData.push("Oggetto vuoto")
      this.additionalControl = false;
    }

    if (!this.blockedPanelDoc) {
      if (this.selectedDoc == undefined) {
        console.log("Nessun documento selezionato");
        this.missingData.push("Nessun documento selezionato")
        this.additionalControl = false;
      }
    }

    if (this.selectedFascicoli.length == 0) {
      console.log("Fascicoli vuoti");
      this.missingData.push("Nessun documento fascicolo")
      this.additionalControl = false;
    }

    if (this.selectedTipo == undefined) {
      console.log("Tipo documento non selezionato");
      this.missingData.push("Tipologia documento non selezionata")
      this.additionalControl = false;
    }

    if (this._strutturaInternautaSelezionata == undefined) {
      console.log("Struttura non selezionata");
      this.missingData.push("Nessuna struttura selezionato")
      this.additionalControl = false;
    }

    if (!this.blockedPanelUpload) {
      if (this.uploadedFiles.length == 0) {
        console.log("Nessun file caricato");
        this.missingData.push("Nessun file caricato")
        this.additionalControl = false;
      }
    }

    if (this.coinvolti.length == 0) {
      console.log("Nessuna persona selezionata");
      this.missingData.push("Nessua persona selezionata")
      this.additionalControl = false;
    }

    return this.additionalControl;
  }

  private createFormData(): FormData {

    let tipologia = String(this.selectedTipo);
    let formData: FormData = new FormData();

    formData.append("applicazione_chiamante", this.azienda.descrizione);
    formData.append("azienda", "100" + this.azienda.codice);
    formData.append("oggetto", this.oggetto);

    if (!this.blockedPanelDoc) {
      formData.append("numero_documento_origine", this.selectedDoc.numero);
      formData.append("anno_documento_origine", this.selectedDoc.anno.toString());
      formData.append("codice_registro_origine", "PG");
    }

    var fascicoliStr = this.stringifyFascicoli();
    formData.append("fascicoli_babel", fascicoliStr);
    formData.append("tipo_documento", tipologia);
    formData.append("struttura_responsabile", this._strutturaInternautaSelezionata.id.toString());

    if (!this.blockedPanelUpload) {
      for (var file of this.uploadedFiles) {
        formData.append('allegati', file);
      }
    }

    formData.append("persone", JSON.stringify(this.coinvolti));

    return formData;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
    this.subscriptions = [];
  }

  public getDettaglioByTipoDettaglioAllegato(allegato: Allegato, tipo: string): DettaglioAllegato {
    return allegato.dettagliAllegatiList.find(dettaglioAllegato => (dettaglioAllegato.caratteristica == tipo));
  }

}
