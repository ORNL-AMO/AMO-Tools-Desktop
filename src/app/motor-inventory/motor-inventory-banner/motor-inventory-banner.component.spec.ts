import { MotorInventoryBannerComponent } from './motor-inventory-banner.component';
import { MotorInventoryService } from '../motor-inventory.service';

describe('MotorInventoryBannerComponent main tab navigation', () => {
  let component: MotorInventoryBannerComponent;
  let serviceSpy: jasmine.SpyObj<MotorInventoryService>;

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj<MotorInventoryService>('MotorInventoryService', ['goToMainTab', 'continueMainTab', 'backMainTab']);
    component = new MotorInventoryBannerComponent(serviceSpy, undefined, undefined, undefined, undefined);
  });

  it('routes a tab click through the service and toggles the banner', () => {
    const collapsed: boolean = component.bannerCollapsed;
    component.setMainTab('summary');
    expect(serviceSpy.goToMainTab).toHaveBeenCalledWith('summary');
    expect(component.bannerCollapsed).toBe(!collapsed);
  });

  it('routes the chevrons through the service', () => {
    component.continue();
    expect(serviceSpy.continueMainTab).toHaveBeenCalled();
    component.back();
    expect(serviceSpy.backMainTab).toHaveBeenCalled();
  });
});
