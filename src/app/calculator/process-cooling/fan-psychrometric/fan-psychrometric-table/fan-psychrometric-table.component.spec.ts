import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychrometricTableComponent } from './fan-psychrometric-table.component';

describe('FanPsychrometricTableComponent', () => {
  let component: FanPsychrometricTableComponent;
  let fixture: ComponentFixture<FanPsychrometricTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychrometricTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychrometricTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
