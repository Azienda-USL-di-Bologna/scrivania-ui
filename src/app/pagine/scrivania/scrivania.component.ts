import { Component, OnInit, ViewChild, ViewChildren, ElementRef, QueryList, OnDestroy, HostListener } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Attivita, Menu } from "@bds/ng-internauta-model";
import { Dropdown } from "primeng/dropdown";
import { ScrivaniaService } from "./scrivania.service";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { FiltersAndSorts, NO_LIMIT, SortDefinition, SORT_MODES } from "@bds/nt-communicator";
import { PROJECTIONS, MAX_CHARS_100, LOCALHOST_PDD_PORT } from "../../../environments/app-constants";
import { Subscription } from "rxjs";
import { Accordion } from "primeng/accordion";

@Component({
  selector: "app-scrivania",
  templateUrl: "./scrivania.component.html",
  styleUrls: ["./scrivania.component.css"]
})
export class ScrivaniaComponent implements OnInit, OnDestroy {

  public mostraStorico: boolean = false;

  @ViewChild("anteprima") private anteprima: ElementRef;
  @ViewChild("allegatiDropDown") private allegatiDropDown: Dropdown;

  @ViewChild("leftSide") private leftSide: ElementRef;
  @ViewChild("rightSide") private rightSide: ElementRef;
  @ViewChild("slider") private slider: ElementRef;

  private subscriptions: Subscription[] = [];

  public attivitaSelezionata: Attivita;
  public noAnteprimaImg: string = "assets/images/no_anteprima.png";
  public noAnteprima: boolean = true;
  allegati: any[] = [];
  allegatoSelezionato: any;

  public oggetto: any = "Nessuna attivita selezionata.";

  public mittente: string = null; // "Nessun mittente";
  public destinatari: string = null; // "Nessun destinatario";
  public destinatariCC: string = null; // "Li dobbiamo mettere?? sulla scrivania non ci sono mai stati";
  public datiDiFlusso: string = null;
  public datiFlussoTooltip: string = null;

  public finestreApribili: any[] = [{label: "Elenco documenti", items: [{label: "AOSPBO", command: (onclick) => {this.handleItemClick("ciao"); }}, {label: "AUSLBO"}]}, {label: "Elenco determine"}, {label: "Elenco delibere"}];
  public finestraScelta: any;

  public loggedUser: UtenteUtilities;
  public alberoMenu: any[];
  public alberoFirma: any[];
  public aziendeMenu: any[];
  private arrayScrivaniaCompiledUrls: any[];

  public showNote: boolean = false;
  public noteText: string = null;
  private MIN_X_LEFT_SIDE: number = 420;
  private MIN_X_RIGHT_SIDE: number = 225;

  public idAzienda: number = -1;

  constructor(private domSanitizer: DomSanitizer, private scrivaniaService: ScrivaniaService, private loginService: NtJwtLoginService) {
   }

  ngOnInit() {
    console.log("scivania ngOnInit()");
    // imposto l'utente loggato nell'apposita variabile
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      if (u) {
        this.loggedUser = u;
        this.loadMenu();
        this.loadMenuFirma();
        this.setLook();
        //this.loadAziendeMenu();
        
      }
    }));
  }

  private setLook(): void {
    this.setResponsiveSlider();
  }

  private setResponsiveSlider(): void {
    const that = this;
    this.slider.nativeElement.onmousedown = function(event: MouseEvent) {
      event.preventDefault();
      const totalX = that.rightSide.nativeElement.offsetWidth + that.leftSide.nativeElement.offsetWidth;
      document.onmouseup = function() {
        document.onmousemove = null;
      };
      document.onmousemove = function(e: MouseEvent) {
        e.preventDefault();
        const rx = totalX - e.clientX + 32; // e.clientX non comincia dall'estremo della pagina ma lascia 32px che sfasano il conteggio
        if (!(e.clientX <= that.MIN_X_LEFT_SIDE) && !(totalX - e.clientX <= that.MIN_X_RIGHT_SIDE)) {
          const rxPercent = rx * 100 / totalX;
          that.rightSide.nativeElement.style.width = rxPercent + "%";
          that.slider.nativeElement.style.marginLeft = 100 - rxPercent + "%";
        }
      };
    };
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    const lx = this.leftSide.nativeElement.offsetWidth;
    const rx = this.rightSide.nativeElement.offsetWidth;
    const screenX = event.currentTarget.innerWidth;
    if ((screenX - lx) < this.MIN_X_RIGHT_SIDE || (screenX - rx) < this.MIN_X_LEFT_SIDE) { // Se rightside è minore di 385 o leftside è minore di 225  setto rightside a 225 e leftside il resto
      const rxPercent = this.MIN_X_RIGHT_SIDE * 100 / screenX;
      this.rightSide.nativeElement.style.width = rxPercent + "%";
      this.slider.nativeElement.style.marginLeft = 100 - rxPercent + "%";
    }
  }

  private shrinkFileName(fileName: string): string {
    const maxFileName: number = 50;

    if (fileName.length <= maxFileName) { return fileName; }

    const matchExtRegex = /(?:\.([^.]+))?$/;

    const ext: string = matchExtRegex.exec(fileName)[1];

    fileName = fileName.replace("." + ext, "");

    fileName = fileName.substr(0, maxFileName) + "..." + fileName.substr(fileName.length - 5, 5);

    if (ext) { fileName += ext; }


    return fileName;
  }

  private clearAccordionDetailFields() {
    this.mittente = null;
    this.destinatari = null;
    this.destinatariCC = null;
    this.datiDiFlusso = null;
    this.datiFlussoTooltip = null;
  }

  public attivitaClicked(attivitaCliccata: Attivita) {
    this.clearAccordionDetailFields();
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
    if (datiAggiuntiviAttivita.custom_app_4) {
      this.datiDiFlusso = datiAggiuntiviAttivita.custom_app_4;
      if (this.datiDiFlusso.length > MAX_CHARS_100) {
        this.datiFlussoTooltip = this.datiDiFlusso;
        this.datiDiFlusso = this.datiDiFlusso.substring(0, MAX_CHARS_100 - 3).concat("...");
      }
      this.datiDiFlusso = this.datiDiFlusso.replace("R:", "<b>R:</b>").replace("A:", "<b>A: </b>");
      // this.accordionDetail.tabs[0].selected = true;  // Espande l'accordion
    }
    this.destinatari = destinatariA ? destinatariA.replace(";", "; ") : destinatariA; // ? destinatariA : "Nessun destinatario";
    this.destinatariCC = destinatariCC ? destinatariCC.replace(";", "; ") : destinatariCC; // ? destinatariCC : "Nessun destinatario";

    this.allegati = [];
    this.allegatiDropDown.clear(null);
    const allegatiAttivita: any[] = JSON.parse(this.attivitaSelezionata.allegati);
    if (allegatiAttivita) {
      allegatiAttivita.sort((a: any, b: any) => { if (a.default) { return -1; } else if (a.default && b.default) { return 0; } else { return 1; }});
      allegatiAttivita.forEach(element => {
        this.allegati.push({label: this.shrinkFileName(element.nome_file), value: element});
      });
      this.allegatoSelected({value: this.allegati[0].value});
    } else {
      this.noAnteprima = true;
    }


    if ((this.allegatiDropDown.disabled = this.allegati.length === 0) === true) {
      this.allegati = [{label: "Documenti non presenti", value: null}];
      this.allegatiDropDown.disabled = true;
    }

    // this.allegatiDropDown.updateDimensions();
    // this.allegatiDropDown.show();

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
    this.scrivaniaService.getAnteprima(this.attivitaSelezionata, this.allegatoSelezionato).subscribe(
          file => {
            this.anteprima.nativeElement.src = file;
          },
          err => {
            this.noAnteprima = true;
          });
    // return this.domSanitizer.bypassSecurityTrustResourceUrl(this.anteprimaUrl);
  }

  fullscreen(event: any) {
    const iframeElement: any = this.anteprima.nativeElement;
    const fullScreenFunction = iframeElement.requestFullscreen || iframeElement.webkitRequestFullscreen || iframeElement.mozRequestFullScreen || iframeElement.msRequestFullscreen;
    fullScreenFunction.call(iframeElement);
  }

  handleItemClick(event) {
    console.log("**** EVENT *****", event);
    
    window.open(event);
  }

  private loadMenu() {
    if (this.alberoMenu) {
      return;
    }
    this.alberoMenu = [];
    const initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.rows = NO_LIMIT;
    initialFiltersAndSorts.addSort(new SortDefinition("idAzienda.nome", SORT_MODES.asc));
    initialFiltersAndSorts.addSort(new SortDefinition("idApplicazione.nome", SORT_MODES.asc));
    const lazyLoadFiltersAndSorts = new FiltersAndSorts();
    this.arrayScrivaniaCompiledUrls = [];
    this.aziendeMenu  = [];
    this.scrivaniaService.getData(PROJECTIONS.menu.customProjections.menuWithIdApplicazioneAndIdAziendaAndTransientFields, initialFiltersAndSorts, lazyLoadFiltersAndSorts)
      .then(
        data => {
          const arrayMenu: Menu[] = data._embedded.menu;
          arrayMenu.forEach( elementArray => {            
            if(elementArray.descrizione==="Scrivania"){
              console.log("elementArray",elementArray)
              let command = elementArray.compiledUrl
              command = command.replace("scrivania_local","open_prendone_local")
              this.aziendeMenu.push(new TreeNode(
                elementArray.idAzienda.nome,
                null,
                (onclick) => {this.handleItemClick(command)}
              ))             
            }
            let found = false;
            for (const elementAlbero of this.alberoMenu) { // ciclo la lista tornata e controllo che sia presente l'applicazione
              if (elementAlbero.label === elementArray.idApplicazione.nome) {
                if (elementAlbero.items) { // nell'applicazione è presente almeno un comando
                  for (const item of elementAlbero.items) {
                    if (item.label === elementArray.descrizione) { // vedo se un comado simile è gia stato aggiunto
                      // comando presente quindi aggiungo solo l'azienda TODO
                      found = true;
                      // item.items ? true : item.items = [];
                      item.items.push(new TreeNode(
                        elementArray.idAzienda.nome,
                        null,
                        (onclick) => {this.handleItemClick(elementArray.compiledUrl); }
                      ));
                      break;
                    }
                  }
                }
                if (!found) { // Il comando non è presente, lo aggiungo
                  found = true;
                  if (this.loggedUser.getUtente().aziende && this.loggedUser.getUtente().aziende.length > 1) {
                    elementAlbero.items.push(new TreeNode(
                      elementArray.descrizione,
                      [new TreeNode(
                        elementArray.idAzienda.nome,
                        null,
                        (onclick) => {this.handleItemClick(elementArray.compiledUrl); }
                        )],
                      null
                    ));
                    break;
                  } else {
                    elementAlbero.items.push(new TreeNode(
                      elementArray.descrizione,
                      null,
                      (onclick) => {this.handleItemClick(elementArray.compiledUrl); }
                    ));
                    break;
                  }
                }
              }
            }
            if (!found) { // l'app del comando non è stata trovata la aggiungo e aggiungo anche il comando
              if (this.loggedUser.getUtente().aziende && this.loggedUser.getUtente().aziende.length > 1) {
                this.alberoMenu.push(new TreeNode(
                  elementArray.idApplicazione.nome,
                  [new TreeNode(
                    elementArray.descrizione,
                    [new TreeNode(
                      elementArray.idAzienda.nome,
                      null,
                      (onclick) => {this.handleItemClick(elementArray.compiledUrl); }
                    )],
                    null
                  )],
                  null
                ));
              } else {
                this.alberoMenu.push(new TreeNode(
                  elementArray.idApplicazione.nome,
                  [new TreeNode(
                    elementArray.descrizione,
                    null,
                    (onclick) => {this.handleItemClick(elementArray.compiledUrl); }
                  )],
                  null
                ));
              }
            }
          });
          //this.loadAziendeMenu();
        }
      );

  }

  public loadAziendeMenu(){
    console.log("***LOADAZIENDEMENU****");
    if(this.aziendeMenu)
      return;
    
    this.aziendeMenu = [];
    if (this.loggedUser.getUtente().aziende) {
      console.log("sì ho aziende...");
      this.loggedUser.getUtente().aziende.forEach(element => {
        let command = this.getBabelCommandByAzienda(element.nome);
        this.aziendeMenu.push(new TreeNode(
          element.nome,
          null,
          (onclick) => {this.handleItemClick(command)}
        ))
        
      });
      console.log("THIS.AZIENDEMENU", this.aziendeMenu);
      console.log("***YOO***");
      
    }
  }

  private getBabelCommandByAzienda(aziendaLabel: string){
    let urlCommand;
    console.log("**getBabelCompiledUrlByAzienda()", aziendaLabel);
    console.log("** this.arrayScrivaniaCompiledUrls", this.arrayScrivaniaCompiledUrls)
    this.arrayScrivaniaCompiledUrls.forEach(map => {
      if(map.get(aziendaLabel)){
        console.log("ritorno questo command", map.get(aziendaLabel));
        return map.get(aziendaLabel);
      }
      
    });
    
  }

  public loadMenuFirma() {
    this.alberoFirma = [];
    const wl = window.location;
    const out: string = wl.protocol + "//" + wl.hostname + (wl.hostname === "localhost" ? ":" + LOCALHOST_PDD_PORT : ":" + wl.port) + "/Babel/Babel.htm" ;
    this.loggedUser.getUtente().aziende.forEach(element => {
      this.alberoFirma.push(new TreeNode(
        element.nome,
        null,
        (onClick) => {this.handleItemClick(out); }));
    });
  }

  public aziendaChanged(event) {
    this.idAzienda = event;
  }

  public  onNoteClick(attivita: any) {
    this.showNote = ((this.noteText = attivita.note) !== null);
  }

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }
}

class TreeNode {
  private label: string;
  private items: TreeNode[];
  private command: any;

  constructor(label: string, items: TreeNode[], command: any) {
    // this.key = key;
    this.label = label;
    this.items = items;
    this.command = command;
  }
}
