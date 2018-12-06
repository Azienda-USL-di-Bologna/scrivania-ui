import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FiltersAndSorts, FilterDefinition, FILTER_TYPES } from '@bds/nt-communicator';
import {PROJECTIONS} from '../../../environments/app-constants';
import { CambioUtenteService } from './cambio-utente.service';
import { Persona } from '@bds/ng-internauta-model';

@Component({
  selector: 'app-cambio-utente',
  templateUrl: './cambio-utente.component.html',
  styleUrls: ['./cambio-utente.component.css']
})
export class CambioUtenteComponent implements OnInit {

  constructor(private cambioUtenteService: CambioUtenteService) { }

  text: string = '';
  personeSuggestions: Persona[] = [];
  selectedPersona: Persona = null;
  cambioUtenteConfirmVisible: boolean = false;

  @Output("onUtenteSelectedEmitter") public onUtenteSelectedEmitter: EventEmitter<Persona> = new EventEmitter<Persona>();

  ngOnInit() {
  }

  search(str: string) {
    let filter: FiltersAndSorts = new FiltersAndSorts();
    filter.addFilter(new FilterDefinition('descrizione', FILTER_TYPES.string.containsIgnoreCase, str));
    this.cambioUtenteService.getData(PROJECTIONS.persona.standardProjections.personaWithPlainFields, filter, new FiltersAndSorts()).then(k => {
      this.onClear();
      if(k && k._embedded && k._embedded.persona)
      {
        this.personeSuggestions = k._embedded.persona;
        this.personeSuggestions.forEach(k => k.descrizione += ' (' + k.codiceFiscale + ')');
      }

      switch(this.personeSuggestions.length)
      {
        case 0:
          let dummyPersona: Persona = new Persona();
          dummyPersona.descrizione = 'Nessun Risultato';
          dummyPersona.id = null;
          this.personeSuggestions.push(dummyPersona);
          break;

        case 1:
          this.onUtenteSelected(this.personeSuggestions.pop());
          break;
      }
    });
  }

  onClear() {
    this.personeSuggestions = [];
    this.selectedPersona = null;
  }

  onUtenteSelected(selected: Persona) {
    if(selected.id === null) return;

    this.selectedPersona = selected;
    this.cambioUtenteConfirmVisible = true;
  }

  onUtenteSelectionConfirmed() {
    this.cambioUtenteConfirmVisible = false;
    this.onUtenteSelectedEmitter.emit(this.selectedPersona);
  }

}
