import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasCoolingLossesFormComponent } from './gas-cooling-losses-form.component';

describe('GasCoolingLossesFormComponent', () => {
  let component: GasCoolingLossesFormComponent;
  let fixture: ComponentFixture<GasCoolingLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasCoolingLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasCoolingLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
