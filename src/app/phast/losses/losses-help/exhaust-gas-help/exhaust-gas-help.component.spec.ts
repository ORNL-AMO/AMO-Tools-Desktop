import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExhaustGasHelpComponent } from './exhaust-gas-help.component';

describe('ExhaustGasHelpComponent', () => {
  let component: ExhaustGasHelpComponent;
  let fixture: ComponentFixture<ExhaustGasHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExhaustGasHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExhaustGasHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
