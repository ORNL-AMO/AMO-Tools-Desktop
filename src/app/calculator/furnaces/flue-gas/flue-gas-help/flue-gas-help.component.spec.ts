import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasHelpComponent } from './flue-gas-help.component';

describe('FlueGasHelpComponent', () => {
  let component: FlueGasHelpComponent;
  let fixture: ComponentFixture<FlueGasHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlueGasHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
