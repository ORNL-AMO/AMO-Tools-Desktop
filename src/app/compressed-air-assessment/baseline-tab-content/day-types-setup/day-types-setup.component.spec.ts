import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypesSetupComponent } from './day-types-setup.component';

describe('DayTypesSetupComponent', () => {
  let component: DayTypesSetupComponent;
  let fixture: ComponentFixture<DayTypesSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DayTypesSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayTypesSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
