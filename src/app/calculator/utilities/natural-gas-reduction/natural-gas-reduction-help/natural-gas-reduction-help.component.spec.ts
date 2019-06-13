import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NaturalGasReductionHelpComponent } from './natural-gas-reduction-help.component';

describe('NaturalGasReductionHelpComponent', () => {
  let component: NaturalGasReductionHelpComponent;
  let fixture: ComponentFixture<NaturalGasReductionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NaturalGasReductionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NaturalGasReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
