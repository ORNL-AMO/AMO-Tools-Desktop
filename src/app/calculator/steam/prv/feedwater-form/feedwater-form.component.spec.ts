import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedwaterFormComponent } from './feedwater-form.component';

describe('FeedwaterFormComponent', () => {
  let component: FeedwaterFormComponent;
  let fixture: ComponentFixture<FeedwaterFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedwaterFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedwaterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
