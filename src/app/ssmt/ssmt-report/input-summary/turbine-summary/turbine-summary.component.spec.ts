import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurbineSummaryComponent } from './turbine-summary.component';

describe('TurbineSummaryComponent', () => {
  let component: TurbineSummaryComponent;
  let fixture: ComponentFixture<TurbineSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurbineSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurbineSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
