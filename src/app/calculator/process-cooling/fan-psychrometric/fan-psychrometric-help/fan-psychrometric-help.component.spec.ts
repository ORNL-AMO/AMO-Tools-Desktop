import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychrometricHelpComponent } from './fan-psychrometric-help.component';

describe('FanPsychrometricHelpComponent', () => {
  let component: FanPsychrometricHelpComponent;
  let fixture: ComponentFixture<FanPsychrometricHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychrometricHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychrometricHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
