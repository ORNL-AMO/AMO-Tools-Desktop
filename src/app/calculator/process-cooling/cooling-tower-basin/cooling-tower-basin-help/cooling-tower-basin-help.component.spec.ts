import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerBasinHelpComponent } from './cooling-tower-basin-help.component';

describe('CoolingTowerBasinHelpComponent', () => {
  let component: CoolingTowerBasinHelpComponent;
  let fixture: ComponentFixture<CoolingTowerBasinHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingTowerBasinHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerBasinHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
