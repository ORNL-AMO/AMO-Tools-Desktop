import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlagSummaryComponent } from './slag-summary.component';

describe('SlagSummaryComponent', () => {
  let component: SlagSummaryComponent;
  let fixture: ComponentFixture<SlagSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlagSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlagSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
