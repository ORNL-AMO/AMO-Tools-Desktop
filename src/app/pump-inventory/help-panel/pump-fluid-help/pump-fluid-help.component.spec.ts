import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpFluidHelpComponent } from './pump-fluid-help.component';

describe('PumpFluidHelpComponent', () => {
  let component: PumpFluidHelpComponent;
  let fixture: ComponentFixture<PumpFluidHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpFluidHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpFluidHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
