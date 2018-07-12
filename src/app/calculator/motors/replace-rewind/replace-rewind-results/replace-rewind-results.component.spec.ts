import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceRewindResultsComponent } from './replace-rewind-results.component';

describe('ReplaceRewindResultsComponent', () => {
  let component: ReplaceRewindResultsComponent;
  let fixture: ComponentFixture<ReplaceRewindResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceRewindResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceRewindResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
