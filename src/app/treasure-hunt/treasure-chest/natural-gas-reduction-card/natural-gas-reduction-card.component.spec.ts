import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NaturalGasReductionCardComponent } from './natural-gas-reduction-card.component';

describe('NaturalGasReductionCardComponent', () => {
  let component: NaturalGasReductionCardComponent;
  let fixture: ComponentFixture<NaturalGasReductionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NaturalGasReductionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NaturalGasReductionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
