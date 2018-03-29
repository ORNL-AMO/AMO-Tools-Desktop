import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExhaustGasTabComponent } from './exhaust-gas-tab.component';

describe('ExhaustGasTabComponent', () => {
  let component: ExhaustGasTabComponent;
  let fixture: ComponentFixture<ExhaustGasTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExhaustGasTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExhaustGasTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
