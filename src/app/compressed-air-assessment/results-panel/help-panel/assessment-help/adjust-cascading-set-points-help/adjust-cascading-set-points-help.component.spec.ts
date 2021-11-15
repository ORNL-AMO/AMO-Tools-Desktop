import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustCascadingSetPointsHelpComponent } from './adjust-cascading-set-points-help.component';

describe('AdjustCascadingSetPointsHelpComponent', () => {
  let component: AdjustCascadingSetPointsHelpComponent;
  let fixture: ComponentFixture<AdjustCascadingSetPointsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustCascadingSetPointsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustCascadingSetPointsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
