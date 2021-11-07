import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpOperationsComponent } from './pump-operations.component';

describe('PumpOperationsComponent', () => {
  let component: PumpOperationsComponent;
  let fixture: ComponentFixture<PumpOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpOperationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
