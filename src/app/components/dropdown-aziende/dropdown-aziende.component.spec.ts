import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownAziendeComponent } from './dropdown-aziende.component';

describe('DropdownAziendeComponent', () => {
  let component: DropdownAziendeComponent;
  let fixture: ComponentFixture<DropdownAziendeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownAziendeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownAziendeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
