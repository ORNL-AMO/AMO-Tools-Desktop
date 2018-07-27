import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeaeratorResultsComponent } from './deaerator-results.component';

describe('DeaeratorResultsComponent', () => {
  let component: DeaeratorResultsComponent;
  let fixture: ComponentFixture<DeaeratorResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeaeratorResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeaeratorResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
