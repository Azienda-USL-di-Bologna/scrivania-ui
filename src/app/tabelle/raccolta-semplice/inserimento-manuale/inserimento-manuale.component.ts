import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Document } from '../documento.model';
import { Subscription } from 'rxjs';
import { Allegato } from './allegato';
import { FileUpload } from 'primeng-lts/fileupload';
import { MessageService } from 'primeng-lts/api';
//import { ExtendedAllegatoService } from './extended-allegato.service';

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
  public refreshTavle: boolean = false;
  public display: boolean = false;
  public selectedTipo: string;
  public uploadedFiles: File[] = [];

  @ViewChild("fileUpload") fileUploadInput: FileUpload;

  @Input() set doc(value: Document) {
    this._doc = value;
    this.setInitialData();
  }

  constructor(
    // private messageService: MessageService,
    // private allegatoService: ExtendedAllegatoService
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

  public onUpload(event: any): void {

  }

}
