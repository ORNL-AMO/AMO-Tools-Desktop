import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUseSummaryComponent } from './end-use-summary.component';

describe('EndUseSummaryComponent', () => {
  let component: EndUseSummaryComponent;
  let fixture: ComponentFixture<EndUseSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndUseSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndUseSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
