import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NaturalGasReductionFormComponent } from './natural-gas-reduction-form.component';

describe('NaturalGasReductionFormComponent', () => {
  let component: NaturalGasReductionFormComponent;
  let fixture: ComponentFixture<NaturalGasReductionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NaturalGasReductionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NaturalGasReductionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
