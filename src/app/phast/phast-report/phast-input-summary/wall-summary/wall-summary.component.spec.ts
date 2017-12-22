import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WallSummaryComponent } from './wall-summary.component';

describe('WallSummaryComponent', () => {
  let component: WallSummaryComponent;
  let fixture: ComponentFixture<WallSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
