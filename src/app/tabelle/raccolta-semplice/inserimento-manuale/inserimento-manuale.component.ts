import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Document } from '../documento.model';
import { Subscription } from 'rxjs';
import { Allegato } from './allegato';
import { DettaglioAllegato } from './dettaglio-allegato';
import { FileUpload } from 'primeng-lts/fileupload';
import { ConfirmationService, MessageService, SelectItem } from 'primeng-lts/api';
import { ExtendedAllegatoService } from './extended-allegato.service';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { UtilityFunctions } from '@bds/nt-communicator';
import { BatchOperation, BatchOperationTypes, FilterDefinition, FiltersAndSorts, FILTER_TYPES, NextSdrEntity, SortDefinition, SORT_MODES } from '@nfa/next-sdr';
import { Azienda, BaseUrls, BaseUrlType, Contatto, ContattoService, DettaglioContatto, DettaglioContattoService, ENTITIES_STRUCTURE, Struttura } from '@bds/ng-internauta-model';
import { FascicoloArgo } from '../fascicolo.model';
import { RaccoltaSempliceService } from '../raccolta-semplice.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DocumentoArgo } from '../DocumentoArgo.model';
import { PersonaRS } from '../personaRS.model';
import { Router } from '@angular/router';
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';

interface TipoDocumento {
  name: string,
  code: string
}

interface ExternalAppDataRS {
  protocollo: string;
  anno: string;
  codiceAzienda: string;
}

interface Registro {
  descrizione: string,
  tipo: string
}

@Component({
  selector: 'app-inserimento-manuale',
  templateUrl: './inserimento-manuale.component.html',
  styleUrls: ['./inserimento-manuale.component.css']
})
export class InserimentoManualeComponent implements OnInit {

  _azienda: Azienda;
  @Input() set azienda(aziendaValue: Azienda) {
    if (aziendaValue) {
      this._azienda = aziendaValue;
    }
  }

  public _callerData: ExternalAppDataRS;

  @ViewChild('fileInput') fileInput: FileUpload;
  public subscriptions: Subscription[] = [];
  public actualPrincipale: Allegato;

  public tipiDocumento: TipoDocumento[];
  public tipiCoinvolti: SelectItem[];
  public codiciRegistriAmmessi: Registro[];

  public selectedTipo: TipoDocumento;
  public selectedTipoCoinvolto: string;
  public selectedCodiceRegistro: Registro;

  public applicazione: string = 'INTERNAUTA';
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

  //public azienda: Azienda = { id: 10 } as Azienda;
  public _strutturaInternautaSelezionata: Struttura;
  public _fascicoloArgoSelezionato: FascicoloArgo;

  public formGroup: FormGroup;

  public oggetto: string;

  public cols: any[] = [
    {
      field: "codice",
      header: "Numero",
      width: "100px",
      label: "Numero Raccolta Semplice",
      textAlign: "center"
    }
  ];

  public optionFascicoli = [];
  public filteredOptions;

  public selectedFascicolo: FascicoloArgo;
  public filteredFascicoli: FascicoloArgo[];
  public selectedFascicoli: FascicoloArgo[] = [];

  public selectedDoc: DocumentoArgo;
  public filteredDocs: DocumentoArgo[];
  public selectedDocumentoBabel: DocumentoArgo;

  public titoloHeader: string;
  public prefixHeader: string;

  @ViewChild("fileUpload") fileUploadInput: FileUpload;

  @Input() set doc(value: Document) {
    this._doc = value;
  }

  public loggedUser: UtenteUtilities;

  // parte coinvolti
  public productDialog: boolean;
  public coinvolti: PersonaRS[];
  public coinvolto: PersonaRS;
  public submitted: boolean;

  public selectedContatto: Contatto;
  public selectedContatti: Contatto[] = [];
  public filteredContatti: Contatto[];
  public disabledContatto: boolean;

  public selectedDettaglioContatto: DettaglioContatto;
  public selectedDettagliContatti: DettaglioContatto[] = [];
  public filteredDettagliContatti: DettaglioContatto[];
  public disabledDettaglioContatto: boolean;

  public panelOpenStateDati: string = "Incompleto"
  public panelOpenState: boolean = true;

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
    private loginService: NtJwtLoginService,
    private router: Router) {
    this.prefixHeader = "Collega Documento Babel: ";
    this.titoloHeader = this.prefixHeader;
    this.selectedCodiceRegistro = { descrizione: 'Protocollo Generale [PG]', tipo: 'pg' };

    this.tipiDocumento = [
      { name: 'Raccoglitore', code: 'raccoglitore' },
      { name: 'Contatto', code: 'contatto' },
      { name: 'CV', code: 'cv' },
      { name: 'Documento', code: 'documento' }
    ];

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
  }

  fascicoloSelezionato(fascicolo: FascicoloArgo) {
    this._fascicoloArgoSelezionato = fascicolo;
  }

  blocca(value: string) {
    console.log(value)
    if (value === "doc") {
      this.blockedPanelDoc = false;
      this.blockedPanelUpload = true;
    } else {
      this.blockedPanelDoc = true;
      this.blockedPanelUpload = false;
    }

  }

  ngOnInit(): void {
    this.coinvolti = [];

    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      this.loggedUser = u;
      this.azienda = u.getUtente().aziendaLogin;
      this.username = u.getUtente().username;
      console.log("Azienda: ",u.getUtente().aziendaLogin.descrizione);
      // la funzione atob server per decodificare la stringa base64 con cui viene passato dataForRubricaInternauta per evitare problemi coi caratteri strambi
      if (!!sessionStorage.getItem("dataForInsertRaccoltaSemplice")) {
        console.log("dataForInsertRaccoltaSemplice trovati");
        this._callerData = JSON.parse(atob(sessionStorage.getItem("dataForInsertRaccoltaSemplice")));
        this.openFromRecord();
      } else {
        console.log("dataForInsertRaccoltaSemplice NON trovati");
      }
    }));

  }


  // apre interfaccia di inserimento con dati prepopolati perchè aperto da Pico, ecc...
  openFromRecord() {
    if (this._callerData) {
      const codice: string = "100" + this.azienda.codice;
      const docToSearch = this._callerData.protocollo + "/" + this._callerData.anno;
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
    this.productDialog = true;
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

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveCoinvoltoCreato() {
    this.submitted = true;
    console.log("tipo: " + this.selectedTipoCoinvolto);

    if (this.selectedTipoCoinvolto === "GIURIDICA" && this.coinvolto.ragioneSociale !== undefined && this.coinvolto.ragioneSociale !== "") {
      this.coinvolto.nomeInterfaccia = this.coinvolto.ragioneSociale;
    } else if (this.coinvolto.nome && this.coinvolto.cognome) {
      this.coinvolto.nomeInterfaccia = this.coinvolto.nome + " " + this.coinvolto.cognome;
    } else {
      this.coinvolto.nomeInterfaccia = "";
    }

    if (this.coinvolto.guidInterfaccia) {
      this.coinvolto.tipologia = this.selectedTipoCoinvolto;
      this.coinvolti[this.findIndexByGuid(this.coinvolto.guidInterfaccia)] = this.coinvolto;
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
    }
    else {
      this.coinvolto.guidInterfaccia = this.createGuid();
      this.coinvolto.tipologia = this.selectedTipoCoinvolto;

      this.coinvolti.push(this.coinvolto);
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
    }


    this.coinvolti = [...this.coinvolti];
    this.productDialog = false;
    this.coinvolto = new PersonaRS();
  }

  editProduct(coinvolto: PersonaRS) {
    this.coinvolto = { ...coinvolto };
    this.productDialog = true;
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

  deleteProduct(persona: PersonaRS) {
    this.confirmationService.confirm({
      message: 'Comfermare la cancellazione del seguente coinvolto? ' + persona.nomeInterfaccia,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.coinvolti = this.coinvolti.filter(val => val.id !== persona.id);
        this.coinvolto = new PersonaRS();
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Coinvolto eliminato', life: 3000 });
      }
    });
  }

  private checkData() {

    // this.oggetto
    // this._strutturaInternautaSelezionata
    // this.selectedTipo
    // this.selectedFascicoli
    // this.blockedPanelDoc 
    //   this.selectedDoc
    // this.blockedPanelUpload 
    //   this.uploadedFiles

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
    this.raccoltaService.getFascicoliArgo('100999', 'andrea.marcomini', event.query).subscribe(res => {
      this.filteredFascicoli = res.body;
    });
  }

  deleteFascicolo(i: number) {
    this.selectedFascicoli.splice(i, 1);
  }

  public saveContatto(contatto: Contatto) {
    //this.selectedContatti.push(contatto);
    this.selectedContatto = contatto;
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
      this.productDialog = false;
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

  public delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public onSubmit() {
    this.creazioneInCorso = true;
    this.showModalDialog();

    // setTimeout(() => {
    //   this.progressBarEnable = true;
    //   this.creazioneInCorso = false;
    //   this.progressBarEnable = false;
    //   this.esitoCreazioneRS = "Raccolta Semplice creata con successo";
    //   this.numerazioneRSCreata = "0007/2021";
    // }, 1000);
    
     var formData:FormData = this.createFormData();
     this.raccoltaService.createRs(formData).subscribe(
     response => {
      this.creazioneInCorso = false;
      this.progressBarEnable = false;
      this.esitoCreazioneRS = "Raccolta Semplice creata con successo";
      this. numerazioneRSCreata = response; },
     error => {
       this.progressBarEnable = false;
       this.creazioneInCorso = false;
       this.messageService.add({
         severity:'error', 
         summary:'Creazione Raccolta Semplice', 
         detail:error
       });
     });
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

  private createFormData(): FormData {

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
    formData.append("tipo_documento", this.selectedTipo.code);
    formData.append("struttura_responsabile", this._strutturaInternautaSelezionata.id.toString());

    if (!this.blockedPanelUpload) {
      for (var file of this.uploadedFiles) {
        formData.append('allegati', file);
      }
    }

    // for (var coinvolto of this.coinvolti) {
    //   formData.append('allegati', file);
    // }
    formData.append("persone", JSON.stringify(this.coinvolti));

    // var personeStr: string = JSON.stringify([ 	
    //   {"descrizione": "persona Test", 
    //   "nome": "Stanis La Rochelle", 
    //   "cognome": "Cert",
    //   "email": "slr@mail.it",
    //   "tipologia": "FISICA"
    //   }, 		
    //   {"descrizione": "azienda Test",
    //   "ragione_sociale": "Azienda Fa Cose",
    //   "cognome": "Bologna",
    //   "email": "azfc@mail.it",
    //   "tipologia": "GIURIDICA"
    //   }
    // ])

    // formData.append("persone", personeStr);

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
