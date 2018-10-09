import { TestBed, inject } from '@angular/core/testing';

import { ScrivaniaService } from './scrivania/scrivania.service';

describe('ScrivaniaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScrivaniaService]
    });
  });

  it('should be created', inject([ScrivaniaService], (service: ScrivaniaService) => {
    expect(service).toBeTruthy();
  }));
});
