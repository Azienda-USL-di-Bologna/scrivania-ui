import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { Azienda } from '@bds/ng-internauta-model';
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';
import { Table } from 'primeng-lts/table';
import { Subscription } from 'rxjs';
import { ModalService } from './modal-service';
import { Storico } from './storico';
import { DialogModule } from 'primeng-lts/dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  @ViewChild("tableStorico") private tableStorico: Table;

  _azienda: Azienda;
  @Input() set azienda(aziendaValue: Azienda) {
    if (aziendaValue) {
      this._azienda = aziendaValue;
    }
  }  

  public storici: Storico[] = [];  
  private element: any;
  private id: string;
  
  private loginService: NtJwtLoginService;
  public loggedUser: UtenteUtilities;
  public subscriptions: Subscription[]=[];


  constructor(@Inject(ModalService) private modalService: ModalService, private el: ElementRef, private i: string) {
      this.element = el.nativeElement;
      this.id = i;
  }

  display: boolean = false;

  showDialog() {
      this.display = true;
  }

  ngOnInit(): void {

    console.log("Dentro init");
      if (!this.id) {
          console.error('Deve presentare un id');
          return;
      }
      document.body.appendChild(this.element);
      this.modalService.add(this);
      this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
        this.loggedUser = u;
        this.azienda = u.getUtente().aziendaLogin;
        console.log("Azienda: ",u.getUtente());
      }));
  }

  // remove self from modal service when component is destroyed
  ngOnDestroy(): void {
      this.modalService.remove(this.id);
  }

  // open modal
  open(): void {
    console.log("Dentro l'open del component");
    // this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
    //     this.loggedUser = u;
    //     this.azienda = u.getUtente().aziendaLogin;
    //     console.log("Azienda: ",u.getUtente());
    //   }));
    //   this.subscriptions.push(
    //      this.modalService.getStorico(this.id, this.azienda.codice).subscribe(
    //         (res: HttpResponse<Storico[]>) => {
    //             this.storici = res.body.map(storico => { return ({ ...storico } as Storico) });
    //         }, error => {
    //             console.log("error modalService.getStorico", error);
    //         }
    //      ) 
    //   );
      this.element.style.display = 'block';
      document.body.classList.add('modal-open');
  }

  // close modal
  close(): void {
      document.body.classList.remove('modal-close');
  }

}
