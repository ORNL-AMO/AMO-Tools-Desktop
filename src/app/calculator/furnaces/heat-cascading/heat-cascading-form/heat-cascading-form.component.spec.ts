import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatCascadingFormComponent } from './heat-cascading-form.component';

describe('HeatCascadingFormComponent', () => {
  let component: HeatCascadingFormComponent;
  let fixture: ComponentFixture<HeatCascadingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatCascadingFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatCascadingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
