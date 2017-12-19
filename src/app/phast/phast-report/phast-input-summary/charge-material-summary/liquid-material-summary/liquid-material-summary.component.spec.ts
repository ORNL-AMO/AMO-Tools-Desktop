import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidMaterialSummaryComponent } from './liquid-material-summary.component';

describe('LiquidMaterialSummaryComponent', () => {
  let component: LiquidMaterialSummaryComponent;
  let fixture: ComponentFixture<LiquidMaterialSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidMaterialSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidMaterialSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
