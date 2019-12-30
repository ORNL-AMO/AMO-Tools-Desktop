import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorySummaryComponent } from './directory-summary.component';

describe('DirectorySummaryComponent', () => {
  let component: DirectorySummaryComponent;
  let fixture: ComponentFixture<DirectorySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectorySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectorySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
