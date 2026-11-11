import { PumpInventoryBannerComponent } from './pump-inventory-banner.component';
import { PumpInventoryService } from '../pump-inventory.service';
import { PumpInventoryData } from '../pump-inventory';

describe('PumpInventoryBannerComponent main tab gating', () => {
  let component: PumpInventoryBannerComponent;
  let pumpInventoryServiceSpy: jasmine.SpyObj<PumpInventoryService>;

  beforeEach(() => {
    pumpInventoryServiceSpy = jasmine.createSpyObj('PumpInventoryService', ['goToMainTab']);
    // Only the service is used here. Constructed directly so ngOnInit subscriptions never run.
    const unused = {} as never;
    component = new PumpInventoryBannerComponent(pumpInventoryServiceSpy, unused, unused, unused, unused, unused);
    spyOn(component, 'collapseBanner');
  });

  function setValid(isValid: boolean) {
    component.pumpInventoryData = { isValid } as PumpInventoryData;
  }

  it('opens setup regardless of inventory validity', () => {
    setValid(false);
    component.setMainTab('setup');
    expect(pumpInventoryServiceSpy.goToMainTab).toHaveBeenCalledWith('setup');
  });

  it('opens summary when the inventory is valid', () => {
    setValid(true);
    component.setMainTab('summary');
    expect(pumpInventoryServiceSpy.goToMainTab).toHaveBeenCalledWith('summary');
  });

  it('does not open summary when the inventory is invalid, but still collapses the banner', () => {
    setValid(false);
    component.setMainTab('summary');
    expect(pumpInventoryServiceSpy.goToMainTab).not.toHaveBeenCalled();
    expect(component.collapseBanner).toHaveBeenCalled();
  });

  it('reports summary as unavailable only while the inventory is invalid', () => {
    setValid(false);
    expect(component.canOpenMainTab('summary')).toBeFalse();
    setValid(true);
    expect(component.canOpenMainTab('summary')).toBeTrue();
  });
});
