import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cambio-utente',
  templateUrl: './cambio-utente.component.html',
  styleUrls: ['./cambio-utente.component.css']
})
export class CambioUtenteComponent implements OnInit {

  constructor() { }

  text: string = '';
  usersSuggestions: string[] = [];

  ngOnInit() {
  }

  search(str: string) {
    this.usersSuggestions = str.split(' ');
  }

}
