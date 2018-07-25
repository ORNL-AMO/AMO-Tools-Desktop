import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerResultsComponent } from './boiler-results.component';

describe('BoilerResultsComponent', () => {
  let component: BoilerResultsComponent;
  let fixture: ComponentFixture<BoilerResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoilerResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
