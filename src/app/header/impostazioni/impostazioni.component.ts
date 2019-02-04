import { Component, OnInit } from "@angular/core";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/api";

@Component({
  selector: "app-impostazioni",
  templateUrl: "./impostazioni.component.html",
  styleUrls: ["./impostazioni.component.css"]
})
export class ImpostazioniComponent implements OnInit {

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) { }

  ngOnInit() {
  }

}
