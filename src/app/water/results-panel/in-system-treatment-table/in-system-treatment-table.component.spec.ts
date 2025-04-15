import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InSystemTreatmentTableComponent } from './in-system-treatment-table.component';

describe('InSystemTreatmentTableComponent', () => {
  let component: InSystemTreatmentTableComponent;
  let fixture: ComponentFixture<InSystemTreatmentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InSystemTreatmentTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InSystemTreatmentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
