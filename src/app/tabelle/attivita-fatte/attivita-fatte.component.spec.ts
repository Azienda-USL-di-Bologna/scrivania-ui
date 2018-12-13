import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttivitaFatteComponent } from './attivita-fatte.component';

describe('AttivitaFatteComponent', () => {
  let component: AttivitaFatteComponent;
  let fixture: ComponentFixture<AttivitaFatteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttivitaFatteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttivitaFatteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
