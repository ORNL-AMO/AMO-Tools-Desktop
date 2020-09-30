import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirLeakResultsTableComponent } from './air-leak-results-table.component';

describe('AirLeakResultsTableComponent', () => {
  let component: AirLeakResultsTableComponent;
  let fixture: ComponentFixture<AirLeakResultsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirLeakResultsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirLeakResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
