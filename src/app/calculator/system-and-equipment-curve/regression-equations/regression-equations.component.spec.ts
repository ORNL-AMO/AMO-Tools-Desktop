import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegressionEquationsComponent } from './regression-equations.component';

describe('RegressionEquationsComponent', () => {
  let component: RegressionEquationsComponent;
  let fixture: ComponentFixture<RegressionEquationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegressionEquationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegressionEquationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
