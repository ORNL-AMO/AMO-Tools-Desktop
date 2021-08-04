import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraverseResultsComponent } from './traverse-results.component';

describe('TraverseResultsComponent', () => {
  let component: TraverseResultsComponent;
  let fixture: ComponentFixture<TraverseResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TraverseResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TraverseResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
