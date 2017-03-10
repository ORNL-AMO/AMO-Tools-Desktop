import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterCoolingLossesFormComponent } from './water-cooling-losses-form.component';

describe('WaterCoolingLossesFormComponent', () => {
  let component: WaterCoolingLossesFormComponent;
  let fixture: ComponentFixture<WaterCoolingLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterCoolingLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterCoolingLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
