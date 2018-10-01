import { TestBed, inject } from '@angular/core/testing';

import { AttivitaService } from './attivita.service';

describe('AttivitaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AttivitaService]
    });
  });

  it('should be created', inject([AttivitaService], (service: AttivitaService) => {
    expect(service).toBeTruthy();
  }));
});
