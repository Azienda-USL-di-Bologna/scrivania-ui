import { Component, OnInit, EventEmitter, Output, ViewChild } from "@angular/core";
import { FiltersAndSorts, FilterDefinition, FILTER_TYPES, SortDefinition, SORT_MODES } from "@bds/nt-communicator";
import {PROJECTIONS, AFFERENZA_STRUTTURA} from "../../../environments/app-constants";
import { CambioUtenteService } from "./cambio-utente.service";
import { Persona, Utente } from "@bds/ng-internauta-model";
import { AutoComplete } from "primeng/autocomplete";

@Component({
  selector: "app-cambio-utente",
  templateUrl: "./cambio-utente.component.html",
  styleUrls: ["./cambio-utente.component.css"]
})
export class CambioUtenteComponent implements OnInit {

  constructor(private cambioUtenteService: CambioUtenteService) { }

  text: string = "";
  personeSuggestions: Utente[] = [];
  selectedPersona: Utente = null;
  changeUserVisible: boolean = true;
  // cambioUtenteConfirmVisible: boolean = false;
  initialFilter: FiltersAndSorts;

  @ViewChild("autoComplete") private autoComplete: AutoComplete;
  @Output("onUtenteSelectedEmitter") public onUtenteSelectedEmitter: EventEmitter<Utente> = new EventEmitter<Utente>();

  ngOnInit() {
    this.initialFilter = new FiltersAndSorts();
    this.initialFilter.addFilter(
      new FilterDefinition(
        "utenteStrutturaList.idAfferenzaStruttura.id", FILTER_TYPES.not_string.equals, AFFERENZA_STRUTTURA.DIRETTA));
    this.initialFilter.addSort(new SortDefinition("idPersona.descrizione", SORT_MODES.asc));
  }

  search(str: string) {
    const filter: FiltersAndSorts = new FiltersAndSorts();
    filter.addFilter(new FilterDefinition("idPersona.descrizione", FILTER_TYPES.string.startsWithIgnoreCase, str));
    this.cambioUtenteService
      .getData(PROJECTIONS.utente.standardProjections.utenteWithIdAziendaAndIdPersona, this.initialFilter, filter)
      .then(k => {
        this.onClear();
        if (k && k._embedded && k._embedded.utente) {
        this.personeSuggestions = k._embedded.utente;
          this.personeSuggestions.forEach(
            el => el.idPersona.descrizione += " (" + el.idPersona.codiceFiscale + ") " + "- " + el.idAzienda.nome);
      }

      switch (this.personeSuggestions.length) {
        case 0:
          const dummyUtente: Utente = new Utente();
          dummyUtente.idPersona.descrizione = "Nessun Risultato";
          dummyUtente.id = null;
          this.personeSuggestions.push(dummyUtente);
          break;

        // case 1:
        //   //this.onUtenteSelected(this.personeSuggestions.pop());
        //   break;
      }
    });
  }

  onClear() {
    this.personeSuggestions = [];
    this.selectedPersona = null;
  }

  onClose() {
    this.changeUserVisible = false;
    this.onUtenteSelectedEmitter.emit(null);
  }

  onUtenteSelected(selected: Utente) {
    if (selected.id === null) { return; }
     this.selectedPersona = selected;
    // this.cambioUtenteConfirmVisible = true;
  }

  onUtenteSelectionConfirmed() {
    // console.log("onUtenteSelectionConfirmed()");
    // this.cambioUtenteConfirmVisible = false;
    if ( this.autoComplete.value !== "" && this.autoComplete.value !== null ) {
      this.onUtenteSelectedEmitter.emit(this.selectedPersona);
    }
  }
  onKeyTabPressed(event: any) {
    event.preventDefault();
  }
}
