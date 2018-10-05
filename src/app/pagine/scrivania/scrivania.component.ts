import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-scrivania',
  templateUrl: './scrivania.component.html',
  styleUrls: ['./scrivania.component.css']
})
export class ScrivaniaComponent implements OnInit {

   @ViewChild('anteprima') private anteprima:ElementRef;
  
  allegati:any[] = [
    {label: 'Allegato1', value:'Allegato 1'},
    {label: 'Allegato2', value:'Allegato 2'},
    {label: 'Allegato3', value:'Allegato 3'},
    {label: 'Allegato4', value:'Allegato 4'}
  ];
  allegatoSelezionato:any;

  public documento: any = {tipo:'PG', numero:'002458', oggetto:'Prova di protocollo molto lungo che ruba molto spazio inutilmente', protocollatoIl:'10/09/2018'};

  public mittente: string = 'Affari generali legali';
  public destinatari: string = 'Giuseppe Frangiamone, NEXT srl, UO Sistema informativo metropolitano';
  public destinatariCC: string = 'Willy, Anna e Barbera, Pixar, Regione Emilia Romagna, Carlotta Petrone'; 

  public finestreApribili: any[] = [{label:"label1",value:"Elenco documenti"},{label:"label2",value:"Elenco determine"},{label:"label3",value:"Elenco delibere"}];
  public finestraScelta: any;

  public filtriApribili: any[] = [{label:"label1",value:"105"},{label:"label2",value:"102"},{label:"label3",value:"909"}];
  public filtroScelto: any;

  constructor() { }

  ngOnInit() {
  }

  fullscreen(event: any) {
    let iframeElement:any = this.anteprima.nativeElement;
    let fullScreenFunction = iframeElement.requestFullscreen || iframeElement.webkitRequestFullscreen || iframeElement.mozRequestFullScreen || iframeElement.msRequestFullscreen;
    fullScreenFunction.call(iframeElement);
  }
}
