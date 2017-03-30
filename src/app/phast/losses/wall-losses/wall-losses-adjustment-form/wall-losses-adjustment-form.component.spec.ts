import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WallLossesAdjustmentFormComponent } from './wall-losses-adjustment-form.component';

describe('WallLossesAdjustmentFormComponent', () => {
  let component: WallLossesAdjustmentFormComponent;
  let fixture: ComponentFixture<WallLossesAdjustmentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallLossesAdjustmentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallLossesAdjustmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
