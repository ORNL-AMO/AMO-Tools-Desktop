import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurbineResultsComponent } from './turbine-results.component';

describe('TurbineResultsComponent', () => {
  let component: TurbineResultsComponent;
  let fixture: ComponentFixture<TurbineResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurbineResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurbineResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
