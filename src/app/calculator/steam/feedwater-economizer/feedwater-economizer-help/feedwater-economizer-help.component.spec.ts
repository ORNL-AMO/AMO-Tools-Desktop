import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedwaterEconomizerHelpComponent } from './feedwater-economizer-help.component';

describe('FeedwaterEconomizerHelpComponent', () => {
  let component: FeedwaterEconomizerHelpComponent;
  let fixture: ComponentFixture<FeedwaterEconomizerHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedwaterEconomizerHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedwaterEconomizerHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
