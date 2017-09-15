import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatSystemEfficiencyComponent } from './heat-system-efficiency.component';

describe('HeatSystemEfficiencyComponent', () => {
  let component: HeatSystemEfficiencyComponent;
  let fixture: ComponentFixture<HeatSystemEfficiencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatSystemEfficiencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatSystemEfficiencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
