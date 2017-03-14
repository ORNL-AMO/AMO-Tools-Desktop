import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadToolResultsComponent } from './head-tool-results.component';

describe('HeadToolResultsComponent', () => {
  let component: HeadToolResultsComponent;
  let fixture: ComponentFixture<HeadToolResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadToolResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadToolResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
