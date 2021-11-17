import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedwaterEconomizerComponent } from './feedwater-economizer.component';

describe('FeedwaterEconomizerComponent', () => {
  let component: FeedwaterEconomizerComponent;
  let fixture: ComponentFixture<FeedwaterEconomizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedwaterEconomizerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedwaterEconomizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
