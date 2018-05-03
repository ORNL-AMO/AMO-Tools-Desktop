import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredElectricityResultsComponent } from './metered-electricity-results.component';

describe('MeteredElectricityResultsComponent', () => {
  let component: MeteredElectricityResultsComponent;
  let fixture: ComponentFixture<MeteredElectricityResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredElectricityResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredElectricityResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
