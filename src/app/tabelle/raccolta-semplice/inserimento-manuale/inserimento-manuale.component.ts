import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Document } from '../documento.model';
import { Subscription } from 'rxjs';
import { Allegato } from './allegato';
import { DettaglioAllegato } from './dettaglio-allegato';
import { FileUpload } from 'primeng-lts/fileupload';
import { MessageService } from 'primeng-lts/api';
import { ExtendedAllegatoService } from './extended-allegato.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { UtilityFunctions } from '@bds/nt-communicator';
import { BatchOperation, BatchOperationTypes, FilterDefinition, FiltersAndSorts, FILTER_TYPES, NextSdrEntity, SortDefinition, SORT_MODES } from '@nfa/next-sdr';
import { BaseUrls, BaseUrlType, ENTITIES_STRUCTURE } from '@bds/ng-internauta-model';


@Component({
  selector: 'app-inserimento-manuale',
  templateUrl: './inserimento-manuale.component.html',
  styleUrls: ['./inserimento-manuale.component.css']
})
export class InserimentoManualeComponent implements OnInit {

  private subscriptions: Subscription[] = [];
  private actualPrincipale: Allegato;

  public _doc: Document;
  public selectedAllegato: Allegato;
  public progress: number = 0;
  public refreshTable: boolean = false;
  public display: boolean = false;
  public selectedTipo: string;
  public uploadedFiles: File[] = [];

  @ViewChild("fileUpload") fileUploadInput: FileUpload;

  @Input() set doc(value: Document) {
    this._doc = value;
    this.setInitialData();
  }

  constructor(
    private messageService: MessageService,
    private allegatoService: ExtendedAllegatoService
    )
   { }

  ngOnInit(): void {
  }

  getNumerazioneGerarchica() {
    
  }

  private setInitialData(): void {
    if (this._doc.allegati.length > 0) {
      this.actualPrincipale = this._doc.allegati.find(a => a.principale);
      this.selectedAllegato = this.actualPrincipale;
    }
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
    }}));

    this.messageService.add({ severity: 'info', summary: 'File caricato', detail: '' });
  }

  private buildFormData(event :any ): FormData {
    this.uploadedFiles = event.files;
    const formData: FormData = new FormData();
    formData.append("idDoc",this._doc.id.toString());
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
    let dettaglioAllegato : DettaglioAllegato = this.getDettaglioByTipoDettaglioAllegato(allegato, "ORIGINALE");
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
        this.setInitialData();
      }
    );
  }

  public onDeleteAttachment(allegato: Allegato, rowIndex: number): void {
    this.allegatoService.deleteHttpCall(allegato.id).subscribe(
      res => {
        this.messageService.add({
          severity:'success', 
          summary:'Allegato', 
          detail:'Allegato eliminato con successo'
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
              severity:'success', 
              summary:'Allegato', 
              detail:'Allegato principale impostato con successo'
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


  public onRowUnselect(): void {
    if (this.actualPrincipale) {
      this.subscriptions.push(
        this.allegatoService.patchHttpCall({
          version: this.actualPrincipale.version,
          principale: false
        }, this.actualPrincipale.id, null, null).subscribe(
          (allegato: Allegato) => {
            this.actualPrincipale.version = allegato.version;
            this.actualPrincipale.principale = false;
            this.messageService.add({
              severity:'success', 
              summary:'Allegato', 
              detail:'Allegato principale deselezionato'
            });
            this.actualPrincipale = null;
          }
        )
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
    this.subscriptions = [];
  }

  public getDettaglioByTipoDettaglioAllegato(allegato:Allegato, tipo : string ): DettaglioAllegato {
       return allegato.dettagliAllegatiList.find(dettaglioAllegato => (dettaglioAllegato.caratteristica == tipo));
     }

}
