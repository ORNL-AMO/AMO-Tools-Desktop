import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceExistingResultsComponent } from './replace-existing-results.component';

describe('ReplaceExistingResultsComponent', () => {
  let component: ReplaceExistingResultsComponent;
  let fixture: ComponentFixture<ReplaceExistingResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceExistingResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceExistingResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
