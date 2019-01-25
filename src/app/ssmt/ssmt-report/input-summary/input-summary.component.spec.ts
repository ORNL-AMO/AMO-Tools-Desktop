import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSummaryComponent } from './input-summary.component';

describe('InputSummaryComponent', () => {
  let component: InputSummaryComponent;
  let fixture: ComponentFixture<InputSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
