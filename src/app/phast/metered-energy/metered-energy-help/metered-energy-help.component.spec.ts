import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredEnergyHelpComponent } from './metered-energy-help.component';

describe('MeteredEnergyHelpComponent', () => {
  let component: MeteredEnergyHelpComponent;
  let fixture: ComponentFixture<MeteredEnergyHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredEnergyHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredEnergyHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
