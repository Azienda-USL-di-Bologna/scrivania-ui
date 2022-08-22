import { Component, OnInit, OnDestroy, Output, EventEmitter } from "@angular/core";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { Subscription } from "rxjs";
import { Azienda } from "@bds/internauta-model";

@Component({
  selector: "app-dropdown-aziende",
  templateUrl: "./dropdown-aziende.component.html",
  styleUrls: ["./dropdown-aziende.component.css"]
})
export class DropdownAziendeComponent implements OnInit, OnDestroy {

  public filtriApribili: DropdownRecord[] = []; // [{label: "label0", value: "Tutte"}, {label: "label1", value: "105"}, {label: "label2", value: "102"}, {label: "label3", value: "909"}];
  public filtroScelto: any;
  public loggedUser: UtenteUtilities;
  private subscriptions: Subscription[] = [];
  @Output("aziendaEmitter") private aziendaEmitter: EventEmitter<number> = new EventEmitter();

  constructor(private loginService: JwtLoginService) {
  }

  ngOnInit() {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      if (u) {
        this.loggedUser = u;
        this.filtriApribili = [];
        const aziende: Azienda[] = this.loggedUser.getUtente().aziende;
        if (aziende.length > 1) { // Il -1 equivale a mostra per tutte le aziende
          this.filtriApribili.push(new DropdownRecord(-1, "Tutti"));
        }
        aziende.forEach(azienda => {
          this.filtriApribili.push(new DropdownRecord(azienda.id, azienda.nome));
        });
      }
    }));
  }

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }

  onValueChange(event: any) {
    const idAzienda: number = event.value.label;
    this.aziendaEmitter.emit(idAzienda);
  }
}

class DropdownRecord {
  private label: number;
  private value: string;

  constructor(label: number, value: string) {
    this.label = label;
    this.value = value;
  }
}
