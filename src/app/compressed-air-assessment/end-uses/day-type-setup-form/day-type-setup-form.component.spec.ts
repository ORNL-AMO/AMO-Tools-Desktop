import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypeSetupFormComponent } from './day-type-setup-form.component';

describe('DayTypeSetupFormComponent', () => {
  let component: DayTypeSetupFormComponent;
  let fixture: ComponentFixture<DayTypeSetupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DayTypeSetupFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypeSetupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
