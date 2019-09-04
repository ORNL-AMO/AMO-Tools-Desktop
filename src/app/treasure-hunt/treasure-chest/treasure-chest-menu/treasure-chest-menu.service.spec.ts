import { TestBed } from '@angular/core/testing';

import { TreasureChestMenuService } from './treasure-chest-menu.service';

describe('TreasureChestMenuService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TreasureChestMenuService = TestBed.get(TreasureChestMenuService);
    expect(service).toBeTruthy();
  });
});
