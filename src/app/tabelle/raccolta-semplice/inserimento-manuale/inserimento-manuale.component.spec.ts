import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InserimentoManualeComponent } from './inserimento-manuale.component';

describe('InserimentoManualeComponent', () => {
  let component: InserimentoManualeComponent;
  let fixture: ComponentFixture<InserimentoManualeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InserimentoManualeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InserimentoManualeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
