import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExhaustGasComponent } from './exhaust-gas.component';

describe('ExhaustGasComponent', () => {
  let component: ExhaustGasComponent;
  let fixture: ComponentFixture<ExhaustGasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExhaustGasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExhaustGasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
