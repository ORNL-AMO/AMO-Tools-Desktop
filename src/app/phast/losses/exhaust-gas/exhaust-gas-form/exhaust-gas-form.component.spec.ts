import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExhaustGasFormComponent } from './exhaust-gas-form.component';

describe('ExhaustGasFormComponent', () => {
  let component: ExhaustGasFormComponent;
  let fixture: ComponentFixture<ExhaustGasFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExhaustGasFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExhaustGasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
