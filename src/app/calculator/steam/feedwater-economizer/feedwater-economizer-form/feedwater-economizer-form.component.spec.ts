import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedwaterEconomizerFormComponent } from './feedwater-economizer-form.component';

describe('FeedwaterEconomizerFormComponent', () => {
  let component: FeedwaterEconomizerFormComponent;
  let fixture: ComponentFixture<FeedwaterEconomizerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedwaterEconomizerFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedwaterEconomizerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
