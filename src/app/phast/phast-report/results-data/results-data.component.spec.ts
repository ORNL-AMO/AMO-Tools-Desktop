import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsDataComponent } from './results-data.component';

describe('ResultsDataComponent', () => {
  let component: ResultsDataComponent;
  let fixture: ComponentFixture<ResultsDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultsDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
