import { TestBed } from '@angular/core/testing';

import { IntimusClientService } from './intimus-client.service';

describe('IntimusClientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IntimusClientService = TestBed.get(IntimusClientService);
    expect(service).toBeTruthy();
  });
});
