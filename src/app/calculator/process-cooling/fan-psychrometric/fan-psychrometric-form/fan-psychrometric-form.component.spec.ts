import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychrometricFormComponent } from './fan-psychrometric-form.component';

describe('FanPsychrometricFormComponent', () => {
  let component: FanPsychrometricFormComponent;
  let fixture: ComponentFixture<FanPsychrometricFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychrometricFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychrometricFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
