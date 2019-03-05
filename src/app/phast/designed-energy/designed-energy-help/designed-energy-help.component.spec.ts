import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergyHelpComponent } from './designed-energy-help.component';

describe('DesignedEnergyHelpComponent', () => {
  let component: DesignedEnergyHelpComponent;
  let fixture: ComponentFixture<DesignedEnergyHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergyHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergyHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
