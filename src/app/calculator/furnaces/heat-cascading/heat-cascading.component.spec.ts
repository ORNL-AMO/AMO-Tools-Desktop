import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatCascadingComponent } from './heat-cascading.component';

describe('HeatCascadingComponent', () => {
  let component: HeatCascadingComponent;
  let fixture: ComponentFixture<HeatCascadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatCascadingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatCascadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
