import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LossesSummaryComponent } from './losses-summary.component';

describe('LossesSummaryComponent', () => {
  let component: LossesSummaryComponent;
  let fixture: ComponentFixture<LossesSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LossesSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LossesSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
