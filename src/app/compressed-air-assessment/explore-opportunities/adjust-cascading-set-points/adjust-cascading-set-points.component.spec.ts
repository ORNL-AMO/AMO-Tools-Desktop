import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustCascadingSetPointsComponent } from './adjust-cascading-set-points.component';

describe('AdjustCascadingSetPointsComponent', () => {
  let component: AdjustCascadingSetPointsComponent;
  let fixture: ComponentFixture<AdjustCascadingSetPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustCascadingSetPointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustCascadingSetPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
