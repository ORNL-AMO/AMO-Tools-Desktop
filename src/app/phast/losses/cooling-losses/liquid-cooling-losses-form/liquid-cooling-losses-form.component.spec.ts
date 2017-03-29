import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidCoolingLossesFormComponent } from './liquid-cooling-losses-form.component';

describe('LiquidCoolingLossesFormComponent', () => {
  let component: LiquidCoolingLossesFormComponent;
  let fixture: ComponentFixture<LiquidCoolingLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidCoolingLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidCoolingLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
