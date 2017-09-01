import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasLeakageLossesFormComponent } from './gas-leakage-losses-form.component';

describe('GasLeakageLossesFormComponent', () => {
  let component: GasLeakageLossesFormComponent;
  let fixture: ComponentFixture<GasLeakageLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasLeakageLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasLeakageLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
