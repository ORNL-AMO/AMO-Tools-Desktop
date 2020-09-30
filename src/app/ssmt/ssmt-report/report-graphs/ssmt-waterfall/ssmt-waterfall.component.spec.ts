import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtWaterfallComponent } from './ssmt-waterfall.component';

describe('SsmtWaterfallComponent', () => {
  let component: SsmtWaterfallComponent;
  let fixture: ComponentFixture<SsmtWaterfallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtWaterfallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtWaterfallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
