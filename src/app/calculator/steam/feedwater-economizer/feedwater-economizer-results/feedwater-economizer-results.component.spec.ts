import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedwaterEconomizerResultsComponent } from './feedwater-economizer-results.component';

describe('FeedwaterEconomizerResultsComponent', () => {
  let component: FeedwaterEconomizerResultsComponent;
  let fixture: ComponentFixture<FeedwaterEconomizerResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedwaterEconomizerResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedwaterEconomizerResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
