import { TestBed, inject } from '@angular/core/testing';

import { CambioUtenteService } from './cambio-utente.service';

describe('CambioUtenteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CambioUtenteService]
    });
  });

  it('should be created', inject([CambioUtenteService], (service: CambioUtenteService) => {
    expect(service).toBeTruthy();
  }));
});
