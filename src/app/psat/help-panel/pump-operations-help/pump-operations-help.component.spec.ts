import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpOperationsHelpComponent } from './pump-operations-help.component';

describe('PumpOperationsHelpComponent', () => {
  let component: PumpOperationsHelpComponent;
  let fixture: ComponentFixture<PumpOperationsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpOperationsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpOperationsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
