import { TestBed } from '@angular/core/testing';

import { AppSettingsService } from './impostazioni.service';

describe('AppSettingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppSettingsService = TestBed.get(AppSettingsService);
    expect(service).toBeTruthy();
  });
});
