import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphereSummaryComponent } from './atmosphere-summary.component';

describe('AtmosphereSummaryComponent', () => {
  let component: AtmosphereSummaryComponent;
  let fixture: ComponentFixture<AtmosphereSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtmosphereSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmosphereSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
