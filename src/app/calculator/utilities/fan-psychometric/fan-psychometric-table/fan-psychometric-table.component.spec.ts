import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychometricTableComponent } from './fan-psychometric-table.component';

describe('FanPsychometricTableComponent', () => {
  let component: FanPsychometricTableComponent;
  let fixture: ComponentFixture<FanPsychometricTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychometricTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychometricTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
