import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatLossFormComponent } from './heat-loss-form.component';

describe('HeatLossFormComponent', () => {
  let component: HeatLossFormComponent;
  let fixture: ComponentFixture<HeatLossFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatLossFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatLossFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
