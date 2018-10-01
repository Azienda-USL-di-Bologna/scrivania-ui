import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrivaniaComponent } from './scrivania.component';

describe('ScrivaniaComponent', () => {
  let component: ScrivaniaComponent;
  let fixture: ComponentFixture<ScrivaniaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrivaniaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrivaniaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
