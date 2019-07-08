import { TestBed } from "@angular/core/testing";

import { DropdownAziendeService } from "./dropdown-aziende.service";

describe("DropdownAziendeServiceService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: DropdownAziendeService = TestBed.get(DropdownAziendeService);
    expect(service).toBeTruthy();
  });
});
