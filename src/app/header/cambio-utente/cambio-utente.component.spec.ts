import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioUtenteComponent } from './cambio-utente.component';

describe('CambioUtenteComponent', () => {
  let component: CambioUtenteComponent;
  let fixture: ComponentFixture<CambioUtenteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CambioUtenteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CambioUtenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
