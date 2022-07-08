import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypeUseFormComponent } from './day-type-use-form.component';

describe('DayTypeUseFormComponent', () => {
  let component: DayTypeUseFormComponent;
  let fixture: ComponentFixture<DayTypeUseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DayTypeUseFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypeUseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
