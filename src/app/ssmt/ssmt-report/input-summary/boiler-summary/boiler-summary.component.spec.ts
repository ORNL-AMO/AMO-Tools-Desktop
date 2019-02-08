import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerSummaryComponent } from './boiler-summary.component';

describe('BoilerSummaryComponent', () => {
  let component: BoilerSummaryComponent;
  let fixture: ComponentFixture<BoilerSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoilerSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
