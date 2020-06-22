import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychrometricComponent } from './fan-psychrometric.component';

describe('FanPsychrometricComponent', () => {
  let component: FanPsychrometricComponent;
  let fixture: ComponentFixture<FanPsychrometricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychrometricComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychrometricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
