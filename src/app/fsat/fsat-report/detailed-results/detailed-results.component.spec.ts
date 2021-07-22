import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedResultsComponent } from './detailed-results.component';

describe('DetailedResultsComponent', () => {
  let component: DetailedResultsComponent;
  let fixture: ComponentFixture<DetailedResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailedResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
