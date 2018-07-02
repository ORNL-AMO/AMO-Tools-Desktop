import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingSummaryComponent } from './cooling-summary.component';

describe('CoolingSummaryComponent', () => {
  let component: CoolingSummaryComponent;
  let fixture: ComponentFixture<CoolingSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoolingSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
