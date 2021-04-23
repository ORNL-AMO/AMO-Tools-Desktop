import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypesComponent } from './day-types.component';

describe('DayTypesComponent', () => {
  let component: DayTypesComponent;
  let fixture: ComponentFixture<DayTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DayTypesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
