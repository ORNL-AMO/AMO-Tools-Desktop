import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasLeakageTabComponent } from './gas-leakage-tab.component';

describe('GasLeakageTabComponent', () => {
  let component: GasLeakageTabComponent;
  let fixture: ComponentFixture<GasLeakageTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasLeakageTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasLeakageTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
