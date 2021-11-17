import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FlueGasLossesMoistureComponent } from './flue-gas-losses-moisture.component';

describe('FlueGasLossesMoistureComponent', () => {
  let component: FlueGasLossesMoistureComponent;
  let fixture: ComponentFixture<FlueGasLossesMoistureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasLossesMoistureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasLossesMoistureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});