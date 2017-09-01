import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasLeakageLossesComponent } from './gas-leakage-losses.component';

describe('GasLeakageLossesComponent', () => {
  let component: GasLeakageLossesComponent;
  let fixture: ComponentFixture<GasLeakageLossesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasLeakageLossesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasLeakageLossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
