import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { Attivita } from '@bds/ng-internauta-model';
import { Dropdown } from 'primeng/dropdown';
import { ScrivaniaService } from './scrivania.service';

@Component({
  selector: 'app-scrivania',
  templateUrl: './scrivania.component.html',
  styleUrls: ['./scrivania.component.css']
})
export class ScrivaniaComponent implements OnInit {

   @ViewChild('anteprima') private anteprima:ElementRef;
   @ViewChild('allegatiDropDown') private allegatiDropDown:Dropdown;

  public attivitaSelezionata: Attivita;
  public noAnteprimaImg: string = "assets/images/no_anteprima.png";
  public noAnteprima: boolean = true;

  allegati:any[] = [];
  allegatoSelezionato:any;

  public oggetto: any = "Nessuna Attivita Selezionata";

  public mittente: string = "";
  public destinatari: string = "";
  public destinatariCC: string = "Li dobbiamo mettere?? sulla scrivania non ci sono mai stati";

  public finestreApribili: any[] = [{label:"label1",value:"Elenco documenti"},{label:"label2",value:"Elenco determine"},{label:"label3",value:"Elenco delibere"}];
  public finestraScelta: any;

  public filtriApribili: any[] = [{label:"label1",value:"105"},{label:"label2",value:"102"},{label:"label3",value:"909"}];
  public filtroScelto: any;

  constructor(private domSanitizer: DomSanitizer, private scrivaniaSrvice: ScrivaniaService) { }

  ngOnInit() {
  }

  public attivitaClicked(attivitaCliccata: Attivita) {
    this.attivitaSelezionata = attivitaCliccata;
    this.oggetto = this.attivitaSelezionata.oggetto;
    const datiAggiuntiviAttivita: any = JSON.parse(this.attivitaSelezionata.datiAggiuntivi);
    this.mittente = datiAggiuntiviAttivita.custom_app_1;
    this.destinatari = datiAggiuntiviAttivita.custom_app_2;
    // TODO: mancano i destinatariCC
    // this.destinatariCC = datiAggiuntiviAttivita.destinatariCC;

    this.allegati = [];
    this.allegatiDropDown.clear(null);
    let allegatiAttivita: any[] = JSON.parse(this.attivitaSelezionata.allegati);
    if (allegatiAttivita) {
      allegatiAttivita.sort((a: any, b: any) => { if (a.default) return -1; else if(a.default && b.default) return 0; else return 1});
      allegatiAttivita.forEach(element => {
        this.allegati.push({label: element.nome_file, value:element})
      });
      this.allegatoSelected({value: this.allegati[0].value})
    }
    //this.allegatiDropDown.updateDimensions();
    this.allegatiDropDown.show();
  }

  public allegatoSelected(event: any) {
    if (event && event.value) {
      this.allegatoSelezionato = event.value;
      this.setAnteprimaUrl();
    } else {
      this.allegatoSelezionato = null;
    }
  }

  public setAnteprimaUrl() {
    this.noAnteprima = false;
    this.scrivaniaSrvice.getAnteprima(this.attivitaSelezionata, this.allegatoSelezionato).subscribe(
          file => {
            console.log("ciao");

            this.anteprima.nativeElement.src = file;
          },
          err => {
            this.noAnteprima = true;
          });
    //return this.domSanitizer.bypassSecurityTrustResourceUrl(this.anteprimaUrl);
  }

  fullscreen(event: any) {
    let iframeElement:any = this.anteprima.nativeElement;
    let fullScreenFunction = iframeElement.requestFullscreen || iframeElement.webkitRequestFullscreen || iframeElement.mozRequestFullScreen || iframeElement.msRequestFullscreen;
    fullScreenFunction.call(iframeElement);
  }
}