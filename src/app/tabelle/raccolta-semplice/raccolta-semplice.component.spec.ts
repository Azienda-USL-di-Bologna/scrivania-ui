import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaccoltaSempliceComponent } from './raccolta-semplice.component';

describe('RaccoltaSempliceComponent', () => {
  let component: RaccoltaSempliceComponent;
  let fixture: ComponentFixture<RaccoltaSempliceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaccoltaSempliceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaccoltaSempliceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
