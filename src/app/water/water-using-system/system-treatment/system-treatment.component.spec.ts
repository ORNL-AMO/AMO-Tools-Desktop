import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemTreatmentComponent } from './system-treatment.component';

describe('SystemTreatmentComponent', () => {
  let component: SystemTreatmentComponent;
  let fixture: ComponentFixture<SystemTreatmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemTreatmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
