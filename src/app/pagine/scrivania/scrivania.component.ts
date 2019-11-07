import { Component, OnInit, ViewChild, ViewChildren, ElementRef, QueryList, OnDestroy, HostListener } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Attivita, Menu, ImpostazioniApplicazioni, UrlsGenerationStrategy } from "@bds/ng-internauta-model";
import { Dropdown } from "primeng/dropdown";
import { ScrivaniaService } from "./scrivania.service";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { NO_LIMIT, SORT_MODES } from "@bds/nt-communicator";
import { FiltersAndSorts, SortDefinition, FilterDefinition, PagingConf } from "@nfa/next-sdr";
import { PROJECTIONS, MAX_CHARS_100, LOCALHOST_PDD_PORT, COMMANDS, ATTIVITA_STATICHE_DESCRIPTION } from "../../../environments/app-constants";
import { Subscription } from "rxjs";
import { ApplicationCustiomization } from "src/environments/application_customization";
import { ImpostazioniService } from "src/app/services/impostazioni.service";
import { ConfirmationService } from "primeng/components/common/confirmationservice";

@Component({
  selector: "app-scrivania",
  templateUrl: "./scrivania.component.html",
  styleUrls: ["./scrivania.component.css"]
})
export class ScrivaniaComponent implements OnInit, OnDestroy {

  public mostraStorico: boolean = false;

  @ViewChild("anteprima", null) private anteprima: ElementRef;
  @ViewChild("allegatiDropDown", null) private allegatiDropDown: Dropdown;

  @ViewChild("leftSide", null) private leftSide: ElementRef;
  @ViewChild("rightSide", null) private rightSide: ElementRef;
  @ViewChild("slider", null) private slider: ElementRef;

  private subscriptions: Subscription[] = [];

  public attivitaSelezionata: Attivita;
  public noAnteprimaImg: string = "assets/images/no_anteprima.png";
  public noAnteprima: boolean = true;
  allegati: any[];
  allegatoSelezionato: any;

  public oggetto: any = null;

  public mittente: string = null; // "Nessun mittente";
  public destinatari: string = null; // "Nessun destinatario";
  public destinatariCC: string = null; // "Li dobbiamo mettere?? sulla scrivania non ci sono mai stati";
  public datiDiFlusso: string = null;
  public datiFlussoTooltip: string = null;

  public finestreApribili: any[] = [{ label: "Elenco documenti", items: [{ label: "AOSPBO", command: (onclick) => { this.handleItemClick("ciao", ""); } }, { label: "AUSLBO" }] }, { label: "Elenco determine" }, { label: "Elenco delibere" }];
  public finestraScelta: any;

  public loggedUser: UtenteUtilities;
  public impostazioniVisualizzazione: any;
  public alberoMenu: any[];
  public alberoFirma: any[] = [];
  public alberoPrendi: any[] = [];
  // public aziendeMenu: any[];
  public urlFirmone: any = "#";
  public urlPrendone: any = "#";
  // private arrayScrivaniaCompiledUrls: any[];

  public showNote: boolean = false;
  public noteText: string = null;
  private LIMIT_X_LEFT_SIDE: number = 905;
  private MIN_X_LEFT_SIDE: number = 570;
  private MIN_X_RIGHT_SIDE: number = 225;

  public idAzienda: number = null;
  public changeColOrder: boolean = false;
  public hidePreview = false;
  public sliding = false;

  public tabellaDaRefreshare: any = { name: "" };

  constructor(private impostazioniService: ImpostazioniService, private scrivaniaService: ScrivaniaService, private loginService: NtJwtLoginService,
    private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    console.log("scivania ngOnInit()");
    // imposto l'utente loggato nell'apposita variabile
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      if (u) {
        if (!this.loggedUser || u.getUtente().id !== this.loggedUser.getUtente().id) {
          this.loggedUser = u;
          this.loadMenu();
          this.setLook();
        } else {
          this.loggedUser = u;
        }
        // this.loadAziendeMenu();
      }
    }));
    this.subscriptions.push(this.scrivaniaService.getUrlsFirmone().subscribe(data => {
      if (data.size > 0) {
        if (data.size === 1) {
          this.urlFirmone = data.aziende[0];
        }
        this.buildGenericMenu(data.aziende, this.alberoFirma);
      }
    }));
    this.subscriptions.push(this.scrivaniaService.getUrlsPrendone().subscribe(data => {
      if (data.size > 0) {
        if (data.size === 1) {
          this.urlPrendone = data.aziende[0];
        }
        this.buildGenericMenu(data.aziende, this.alberoPrendi);
      }
    }));
    this.subscriptions.push(this.impostazioniService.settingsChangedNotifier$.subscribe(newSettings => {
      this.hidePreview = newSettings[ApplicationCustiomization.scrivania.hidePreview] === "true";
    }));
    this.allegatiDropDown.disabled = true;
    this.allegati = [{ label: "Documenti non presenti", value: null }];
  }

  private setLook(): void {
    this.setResponsiveSlider();
    if (this.impostazioniService.getImpostazioniVisualizzazione()) {
      this.rightSide.nativeElement.style.width = this.impostazioniService.getRightSideOffsetWidth() + "%";
      this.slider.nativeElement.style.marginLeft = 100 - this.impostazioniService.getRightSideOffsetWidth() + "%";
      if (window.screen.width <= 1280) {
        this.hidePreview = true;
      } else {
        this.hidePreview = this.impostazioniService.getHidePreview() === "true";
      }
    }
  }

  private setResponsiveSlider(): void {
    const that = this;
    this.slider.nativeElement.onmousedown = function (event: MouseEvent) {
      that.sliding = true;
      event.preventDefault();
      const totalX = that.rightSide.nativeElement.offsetWidth + that.leftSide.nativeElement.offsetWidth;
      document.onmouseup = function () {
        document.onmousemove = null;
        console.log("that.slider.nativeElement.onmouseup");
        that.impostazioniService.setRightSideOffsetWidth(parseInt(that.rightSide.nativeElement.style.width, 10));
        that.loggedUser.setImpostazioniApplicazione(that.loginService, that.impostazioniService.getImpostazioniVisualizzazione());
        document.onmouseup = null;
        that.sliding = false;
      };
      // that.slider.nativeElement.onmouseup = function() {
      //   console.log("that.slider.nativeElement.onmouseup");
      //   that.impostazioniVisualizzazione[applicationCustiomization.scrivania.rigthside.offsetWidth] = parseInt(that.rightSide.nativeElement.style.width, 10);
      //   // const impostazioni: ImpostazioniApplicazioni = that.loggedUser.getImpostazioniApplicazione();
      //   // impostazioni.impostazioniVisualizzazione = JSON.stringify(that.impostazioniVisualizzazione);
      //   that.loggedUser.setImpostazioniApplicazione(that.loginService, that.impostazioniVisualizzazione);
      // };
      document.onmousemove = function (e: MouseEvent) {
        e.preventDefault();
        const rx = totalX - e.clientX + 32; // e.clientX non comincia dall'estremo della pagina ma lascia 32px che sfasano il conteggio
        if (!(e.clientX <= that.LIMIT_X_LEFT_SIDE)) {
          that.changeColOrder = false;
        } else {
          that.changeColOrder = true;
        }
        if (!(e.clientX <= that.MIN_X_LEFT_SIDE)) {
          if (!(totalX - e.clientX <= that.MIN_X_RIGHT_SIDE)) {
            const rxPercent = rx * 100 / totalX;
            that.rightSide.nativeElement.style.width = rxPercent + "%";
            that.slider.nativeElement.style.marginLeft = 100 - rxPercent + "%";
          }
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
    this.oggetto = null;
  }

  public attivitaClicked(attivitaCliccata: Attivita) {
    console.log("attivitaClicked", attivitaCliccata);
    this.clearAccordionDetailFields();
    this.attivitaSelezionata = attivitaCliccata;
    if (this.attivitaSelezionata) {
      this.oggetto = this.attivitaSelezionata.oggetto;
      const datiAggiuntiviAttivita: any = this.attivitaSelezionata.datiAggiuntivi;
      this.mittente = datiAggiuntiviAttivita.custom_app_1; // ? datiAggiuntiviAttivita.custom_app_1 : "Nessun mittente";
      let destinatariA, destinatariCC: string;
      if (datiAggiuntiviAttivita.custom_app_2 && datiAggiuntiviAttivita.custom_app_2.trim() !== "") {
        const res = datiAggiuntiviAttivita.custom_app_2.split("<br />");
        res.forEach(e => {
          if (e.startsWith("A: ")) {
            destinatariA = e.replace("A: ", "<strong>A: </strong>");
          } else if (e.startsWith("CC: ")) {
            destinatariCC = e.replace("CC: ", "<strong>CC: </strong>");
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
        allegatiAttivita.sort((a: any, b: any) => { if (a.default) { return -1; } else if (a.default && b.default) { return 0; } else { return 1; } });
        allegatiAttivita.forEach(element => {
          this.allegati.push({ label: this.shrinkFileName(element.nome_file), value: element });
        });
        this.allegatoSelected({ value: this.allegati[0].value });
      } else {
        this.noAnteprima = true;
      }


      if ((this.allegatiDropDown.disabled = this.allegati.length === 0) === true) {
        this.allegati = [{ label: "Documenti non presenti", value: null }];
        this.allegatiDropDown.disabled = true;
      }

      // this.allegatiDropDown.updateDimensions();
      // this.allegatiDropDown.show();
    }
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
    if ( this.attivitaSelezionata.idApplicazione.id === "dete" && this.attivitaSelezionata.descrizione === "Bozza" ) {
      this.noAnteprima = true;
    } else {
      this.noAnteprima = false;
      this.scrivaniaService
        .getAnteprima(this.attivitaSelezionata, this.allegatoSelezionato)
        .subscribe(
          file => {
            this.anteprima.nativeElement.src = file;
          },
          err => {
            this.noAnteprima = true;
          }
        );
    }
    // return this.domSanitizer.bypassSecurityTrustResourceUrl(this.anteprimaUrl);
  }

  fullscreen(event: any) {
    const iframeElement: any = this.anteprima.nativeElement;
    const fullScreenFunction = iframeElement.requestFullscreen || iframeElement.webkitRequestFullscreen || iframeElement.mozRequestFullScreen || iframeElement.msRequestFullscreen;
    fullScreenFunction.call(iframeElement);
  }

  handleItemClick(event, urlGenerationStrategy: string) {
    console.log("Link: ", event);
    const encodeParams = urlGenerationStrategy === UrlsGenerationStrategy.TRUSTED_URL_WITH_CONTEXT_INFORMATION ||
                          urlGenerationStrategy === UrlsGenerationStrategy.TRUSTED_URL_WITHOUT_CONTEXT_INFORMATION;
    const addRichiestaParam = true;
    const addPassToken = true;
    this.loginService.buildInterAppUrl(event, encodeParams, addRichiestaParam, addPassToken, true).subscribe((url: string) => {
      console.log("urlAperto:", url);
     });
  }

  private loadMenu() {
    if (this.alberoMenu) {
      return;
    }
    this.alberoMenu = [];
    const initialFiltersAndSorts = new FiltersAndSorts();
    // initialFiltersAndSorts.rows = NO_LIMIT;
    initialFiltersAndSorts.addSort(new SortDefinition("ordinale", SORT_MODES.asc));
    initialFiltersAndSorts.addSort(new SortDefinition("idAzienda.nome", SORT_MODES.asc));
    initialFiltersAndSorts.addSort(new SortDefinition("idApplicazione.nome", SORT_MODES.asc));
    const lazyLoadFiltersAndSorts = new FiltersAndSorts();
    const pageConfNoLimit: PagingConf = {
      conf: {
        page: 0,
        size: 999999
      },
      mode: "PAGE"
    };
    // this.arrayScrivaniaCompiledUrls = [];
    // this.aziendeMenu  = [];
    this.scrivaniaService.getData(PROJECTIONS.menu.customProjections.menuWithIdApplicazioneAndIdAziendaAndTransientFields, initialFiltersAndSorts, lazyLoadFiltersAndSorts, pageConfNoLimit)
      .subscribe(
        data => {
          const arrayMenu: Menu[] = data.results;
          arrayMenu.forEach(elementArray => {
            // qui se intercetto l'attività statica di scrivania mi calcolo il comando per aprire il prendone
            // tanto tutto il resto (azienda, idp, ecc...) è identico
            // VA RIFATTO!!!!!
            // if (elementArray.idApplicazione.id === "gedi") {
            //   let command = elementArray.compiledUrl;
            //   command = command.replace(COMMANDS.gedi_local, COMMANDS.open_prendone_local);
            //   this.aziendeMenu.push(new TreeNode(
            //     elementArray.idAzienda.nome,
            //     null,
            //     (onclick) => {this.handleItemClick(command); }
            //   ));
            // }
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
                        (onclick) => { this.handleItemClick(elementArray.compiledUrl, elementArray.idApplicazione.urlGenerationStrategy); }
                      ));
                      break;
                    }
                  }
                }
                if (!found) { // Il comando non è presente, lo aggiungo
                  found = true;
                  if (this.loggedUser.getUtente().aziende && this.loggedUser.getUtente().aziende.length > 1 && elementArray.idAzienda) {
                    elementAlbero.items.push(new TreeNode(
                      elementArray.descrizione,
                      [new TreeNode(
                        elementArray.idAzienda.nome,
                        null,
                        (onclick) => { this.handleItemClick(elementArray.compiledUrl, elementArray.idApplicazione.urlGenerationStrategy); }
                      )],
                      (onclick) => { this.doNothingNodeClick(onclick); }
                    ));
                    break;
                  } else {
                    elementAlbero.items.push(new TreeNode(
                      elementArray.descrizione,
                      null,
                      (onclick) => { this.handleItemClick(elementArray.compiledUrl, elementArray.idApplicazione.urlGenerationStrategy); }
                    ));
                    break;
                  }
                }
              }
            }
            if (!found) { // l'app del comando non è stata trovata la aggiungo e aggiungo anche il comando
              if (this.loggedUser.getUtente().aziende && this.loggedUser.getUtente().aziende.length > 1 && elementArray.idAzienda) {
                this.alberoMenu.push(new TreeNode(
                  elementArray.idApplicazione.nome,
                  [new TreeNode(
                    elementArray.descrizione,
                    [new TreeNode(
                      elementArray.idAzienda.nome,
                      null,
                      (onclick) => { this.handleItemClick(elementArray.compiledUrl, elementArray.idApplicazione.urlGenerationStrategy); }
                    )],
                    (onclick) => { this.doNothingNodeClick(onclick); }
                  )],
                  (onclick) => { this.doNothingNodeClick(onclick); }
                ));
              } else {
                this.alberoMenu.push(new TreeNode(
                  elementArray.idApplicazione.nome,
                  [new TreeNode(
                    elementArray.descrizione,
                    null,
                    (onclick) => { this.handleItemClick(elementArray.compiledUrl, elementArray.idApplicazione.urlGenerationStrategy); }
                  )],
                  (onclick) => { this.doNothingNodeClick(onclick); }
                ));
              }
            }
          });
          // this.loadAziendeMenu();
        }
      );

  }

  // public loadAziendeMenu() {
  //   if (this.aziendeMenu) {
  //     return;
  //   }
  //   this.aziendeMenu = [];
  //   if (this.loggedUser.getUtente().aziende) {
  //     this.loggedUser.getUtente().aziende.forEach(element => {
  //       const command = this.getBabelCommandByAzienda(element.nome);
  //       this.aziendeMenu.push(new TreeNode(
  //         element.nome,
  //         null,
  //         (onclick) => {this.handleItemClick(command); }
  //       ));
  //     });
  //   }
  // }

  // private getBabelCommandByAzienda(aziendaLabel: string) {
  //   this.arrayScrivaniaCompiledUrls.forEach(map => {
  //     if (map.get(aziendaLabel)) {
  //       console.log("ritorno questo command", map.get(aziendaLabel));
  //       return map.get(aziendaLabel);
  //     }

  //   });

  // }

  public buildGenericMenu(aziende, albero) {
    aziende.forEach(element => {
      albero.push(new TreeNode(
        element.nome,
        null,
        (onClick) => {
          this.handleItemClick(element.url, element.urlGenerationStrategy);
        }));
    });
  }

  public aziendaChanged(event) {
    this.idAzienda = event;
  }

  public onNoteClick(attivita: any) {
    this.showNote = ((this.noteText = attivita.note) !== null);
  }

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }
  /* Metodo agganciato ad ogni nodo del menu (non alle foglie) per evitare che si chiuda al click */
  doNothingNodeClick(event: any) {
    if (event && event.originalEvent) {
      event.originalEvent.stopPropagation();
    }
  }

  ricarica() {

    if (this.mostraStorico === true) {
      this.tabellaDaRefreshare = Object.assign({}, { name: "attivita-fatte" });
    } else {
      this.tabellaDaRefreshare = Object.assign({}, { name: "attivita" });
    }
  }

  delNotifiche() {
    this.confirmationService.confirm({
      message: "Tutte le notifiche verranno spostate nella cronologia, l'operazione non può essere annullata. Vuoi continuare?",
      header: "Cancellazione notifiche",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => {
        // this.msgs = [{severity:'info', summary:'Confirmed', detail:'You have accepted'}];
        this.subscriptions.push(this.scrivaniaService.cancellaNotifiche().subscribe(data => {
          this.ricarica();
        }));
      },
      reject: () => {
        console.log("Errore nel salvataggio");
      }
    });
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
