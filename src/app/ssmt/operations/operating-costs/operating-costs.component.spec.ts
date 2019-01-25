import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingCostsComponent } from './operating-costs.component';

describe('OperatingCostsComponent', () => {
  let component: OperatingCostsComponent;
  let fixture: ComponentFixture<OperatingCostsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatingCostsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
