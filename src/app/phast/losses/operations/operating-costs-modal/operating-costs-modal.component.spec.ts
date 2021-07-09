import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingCostsModalComponent } from './operating-costs-modal.component';

describe('OperatingCostsModalComponent', () => {
  let component: OperatingCostsModalComponent;
  let fixture: ComponentFixture<OperatingCostsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatingCostsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingCostsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
