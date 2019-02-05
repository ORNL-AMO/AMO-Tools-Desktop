import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSummaryComponent } from './header-summary.component';

describe('HeaderSummaryComponent', () => {
  let component: HeaderSummaryComponent;
  let fixture: ComponentFixture<HeaderSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
