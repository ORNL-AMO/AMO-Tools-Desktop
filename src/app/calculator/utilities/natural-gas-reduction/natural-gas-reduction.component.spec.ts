import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NaturalGasReductionComponent } from './natural-gas-reduction.component';

describe('NaturalGasReductionComponent', () => {
  let component: NaturalGasReductionComponent;
  let fixture: ComponentFixture<NaturalGasReductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NaturalGasReductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NaturalGasReductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
