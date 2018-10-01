import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabellaAttivitaComponent } from './tabella-attivita.component';

describe('TabellaAttivitaComponent', () => {
  let component: TabellaAttivitaComponent;
  let fixture: ComponentFixture<TabellaAttivitaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabellaAttivitaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabellaAttivitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
