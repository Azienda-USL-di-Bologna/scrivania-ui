import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Attivita, Utente } from '@bds/ng-internauta-model';
import { Dropdown } from 'primeng/dropdown';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem, LazyLoadEvent } from 'primeng/api';
import { ScrivaniaService } from './scrivania.service';
import { NtJwtLoginService } from '@bds/nt-jwt-login';
import { FiltersAndSorts, NO_LIMIT } from '@bds/nt-communicator';
import { PROJECTIONS } from '../../../environments/app-constants';
import { forEach } from '@angular/router/src/utils/collection';
import { bind } from '@angular/core/src/render3/instructions';

@Component({
  selector: "app-scrivania",
  templateUrl: "./scrivania.component.html",
  styleUrls: ["./scrivania.component.css"]
})
export class ScrivaniaComponent implements OnInit {

   @ViewChild("anteprima") private anteprima: ElementRef;
   @ViewChild("allegatiDropDown") private allegatiDropDown: Dropdown;

   @ViewChild("leftSide") private leftSide: ElementRef;
   @ViewChild("rightSide") private rightSide: ElementRef;
   @ViewChild("slider") private slider: ElementRef;
   private posX: number;

  public attivitaSelezionata: Attivita;
  public noAnteprimaImg: string = "assets/images/no_anteprima.png";
  public noAnteprima: boolean = true;
  allegati: any[] = [];
  allegatoSelezionato: any;

  public oggetto: any = "Nessuna attivita selezionata.";

  public mittente: string = null; // "Nessun mittente";
  public destinatari: string = null; // "Nessun destinatario";
  public destinatariCC: string = null; // "Li dobbiamo mettere?? sulla scrivania non ci sono mai stati";

  public finestreApribili: any[] = [{label:"Elenco documenti", items:[{label:"AOSPBO", command: (onclick)=> {this.handleItemClick("ciao")}},{label:"AUSLBO"}]},{label:"Elenco determine"},{label:"Elenco delibere"}];
  public finestraScelta: any;

  public filtriApribili: any[] = [{label: "label0", value: "Tutte"}, {label: "label1", value: "105"}, {label: "label2", value: "102"}, {label: "label3", value: "909"}];
  public filtroScelto: any;
  public loggedUser: Utente;
  public alberoMenu : any[];

  public showNote: boolean = false;
  public noteText: string = null;

  constructor(private domSanitizer: DomSanitizer, private scrivaniaSrvice: ScrivaniaService, private loginService: NtJwtLoginService) {
   }

  ngOnInit() {
    // imposto l'utente loggato nell'apposita variabile
    this.loginService.loggedUser.subscribe((u: Utente) => {
      this.loggedUser = u;
    })
    this.loadMenu();
    let that = this;
    this.slider.nativeElement.onmousedown = function(e){
      e.preventDefault();
      that.posX = e.clientX;
      document.onmouseup = function(){
        document.onmouseup = null;
      document.onmousemove = null;
      }
      document.onmousemove = function(e){
        e.preventDefault();

        that.leftSide.nativeElement.style.width = e.clientX + 'px';
        that.slider.nativeElement.style.marginLeft = e.clientX + 'px';
      }
    }
  }

  private shrinkFileName(fileName: string): string {
    const maxFileName: number = 50;

    if(fileName.length <= maxFileName) return fileName;

    const matchExtRegex = /(?:\.([^.]+))?$/;

    var ext: string = matchExtRegex.exec(fileName)[1];

    fileName = fileName.replace('.' + ext, '');

    fileName = fileName.substr(0, maxFileName) + '...' + fileName.substr(fileName.length - 5, 5);

    if(ext) fileName += ext;


    return fileName;
  }

  public attivitaClicked(attivitaCliccata: Attivita) {
    this.attivitaSelezionata = attivitaCliccata;
    this.oggetto = this.attivitaSelezionata.oggetto;
    const datiAggiuntiviAttivita: any = JSON.parse(this.attivitaSelezionata.datiAggiuntivi);
    this.mittente = datiAggiuntiviAttivita.custom_app_1; // ? datiAggiuntiviAttivita.custom_app_1 : "Nessun mittente";
    let destinatariA, destinatariCC: string;
    if (datiAggiuntiviAttivita.custom_app_2 && datiAggiuntiviAttivita.custom_app_2.trim() !== "") {
      const res = datiAggiuntiviAttivita.custom_app_2.split("<br />");
      res.forEach(e => {
        if (e.startsWith("A: ")) {
          destinatariA = e.replace("A: ", "<b>A: </b>");
        } else if (e.startsWith("CC: ")) {
          destinatariCC = e.replace("CC: ", "<b>CC: </b>");
        } else if (e.startsWith("Interni: ")) {
          destinatariA = e.replace("Interni: ", "<b>Interni: </b>");
        } else if (e.startsWith("Esterni: ")) {
          destinatariCC = e.replace("Esterni: ", "<b>Esterni: </b>");
        }
      });
    }
    this.destinatari = destinatariA ? destinatariA.replace(";", "; ") : destinatariA; // ? destinatariA : "Nessun destinatario";
    this.destinatariCC = destinatariCC ? destinatariCC.replace(";", "; ") : destinatariCC; // ? destinatariCC : "Nessun destinatario";

    this.allegati = [];
    this.allegatiDropDown.clear(null);
    let allegatiAttivita: any[] = JSON.parse(this.attivitaSelezionata.allegati);
    if (allegatiAttivita) {
      allegatiAttivita.sort((a: any, b: any) => { if (a.default) return -1; else if (a.default && b.default) return 0; else return 1});
      allegatiAttivita.forEach(element => {
        console.log(element);
        this.allegati.push({label: this.shrinkFileName(element.nome_file), value: element})
      });
      this.allegatoSelected({value: this.allegati[0].value})
    }
    else {
      this.noAnteprima = true;
    }


    if((this.allegatiDropDown.disabled = this.allegati.length == 0) === true)
    {
      this.allegati = [{label:'Documenti non presenti', value: null}];
      this.allegatiDropDown.disabled = true;
    }

    // this.allegatiDropDown.updateDimensions();
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
            this.anteprima.nativeElement.src = file;
          },
          err => {
            this.noAnteprima = true;
          });
    // return this.domSanitizer.bypassSecurityTrustResourceUrl(this.anteprimaUrl);
  }

  fullscreen(event: any) {
    let iframeElement: any = this.anteprima.nativeElement;
    let fullScreenFunction = iframeElement.requestFullscreen || iframeElement.webkitRequestFullscreen || iframeElement.mozRequestFullScreen || iframeElement.msRequestFullscreen;
    fullScreenFunction.call(iframeElement);
  }

  handleItemClick(event){
    window.open(event);
  }

  private loadMenu() {
    if(this.alberoMenu){
      return;
    }
    this.alberoMenu = [];
    let initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.rows = NO_LIMIT;
    let lazyLoadFiltersAndSorts = new FiltersAndSorts();
    this.scrivaniaSrvice.getData(PROJECTIONS.menu.standardProjections.menuWithIdApplicazioneAndIdAzienda, initialFiltersAndSorts, lazyLoadFiltersAndSorts)
      .then(
        data => {
          let arrayMenu = data._embedded.menu;
          arrayMenu.forEach( elementArray => {
            let found = false;
            for (let elementAlbero of this.alberoMenu) { // ciclo la lista tornata e controllo che sia presente l'aplicazione
              if(elementAlbero.label === elementArray.idApplicazione.nome){
                if(elementAlbero.items){ // nell'applicazione è presente almeno un comando
                  for (let item of elementAlbero.items) {
                    if(item.label === elementArray.descrizione){ // vedo se un comado simile è gia stato aggiunto
                      // comando presente quindi aggiungo solo l'azienda TODO
                      found = true;
                      item.items ? true : item.items = [];
                      item.items.push(new ThreeNode(
                        elementArray.idAzienda.nome,
                        null,
                        (onclick)=> {this.handleItemClick(elementArray.openCommand)}
                      ));
                      break;
                    }
                  }
                }
                if(!found){ // Il comando non è presente, lo aggiungo
                  found = true;
                  elementAlbero.items.push(new ThreeNode(
                    elementArray.descrizione,
                    [new ThreeNode(
                      elementArray.idAzienda.nome,
                      null,
                      (onclick)=> {this.handleItemClick(elementArray.openCommand)}
                      )],
                    null
                  ));
                  break
                }
              }
            }
            if(!found){ // l'app del comando non è stata trovata la aggiungo e aggiungo anche il comando
              this.alberoMenu.push(new ThreeNode(
                elementArray.idApplicazione.nome,
                [new ThreeNode(
                  elementArray.descrizione,
                  [new ThreeNode(
                    elementArray.idAzienda.nome,
                    null,
                    (onclick)=> {this.handleItemClick(elementArray.openCommand)}
                  )],
                  null
                )],
                null
              ));
            }
          });
        }
      );

  }

  public onNoteClick(attivita: any) {
    console.log("note clicked", attivita);
    this.showNote = ((this.noteText = attivita.note) !== null);
  }

}
class ThreeNode{
  private label: string;
  private items: ThreeNode[];
  private command: any;

  constructor(label: string, items: ThreeNode[], command: any){
    //this.key = key;
    this.label = label;
    this.items = items;
    this.command = command;
  }
}
