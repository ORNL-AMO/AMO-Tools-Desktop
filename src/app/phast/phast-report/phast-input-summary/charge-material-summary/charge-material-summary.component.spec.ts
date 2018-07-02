import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeMaterialSummaryComponent } from './charge-material-summary.component';

describe('ChargeMaterialSummaryComponent', () => {
  let component: ChargeMaterialSummaryComponent;
  let fixture: ComponentFixture<ChargeMaterialSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargeMaterialSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeMaterialSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
