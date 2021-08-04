import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningResultsComponent } from './opening-results.component';

describe('OpeningResultsComponent', () => {
  let component: OpeningResultsComponent;
  let fixture: ComponentFixture<OpeningResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpeningResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpeningResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
