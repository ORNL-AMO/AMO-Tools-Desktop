import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Fsat203ResultsComponent } from './fsat-203-results.component';

describe('Fsat203ResultsComponent', () => {
  let component: Fsat203ResultsComponent;
  let fixture: ComponentFixture<Fsat203ResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Fsat203ResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Fsat203ResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
