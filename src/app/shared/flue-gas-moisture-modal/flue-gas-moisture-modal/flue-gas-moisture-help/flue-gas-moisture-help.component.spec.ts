import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FlueGasMoistureHelpComponent } from './flue-gas-moisture-help.component';

describe('FlueGasMoistureHelpComponent', () => {
  let component: FlueGasMoistureHelpComponent;
  let fixture: ComponentFixture<FlueGasMoistureHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasMoistureHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasMoistureHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});