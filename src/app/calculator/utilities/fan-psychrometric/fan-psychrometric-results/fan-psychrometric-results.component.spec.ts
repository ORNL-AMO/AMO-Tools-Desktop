import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychrometricResultsComponent } from './fan-psychrometric-results.component';

describe('FanPsychrometricResultsComponent', () => {
  let component: FanPsychrometricResultsComponent;
  let fixture: ComponentFixture<FanPsychrometricResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychrometricResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychrometricResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
