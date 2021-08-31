import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FlueGasMoistureResultsComponent } from './flue-gas-moisture-results.component';

describe('FlueGasMoistureResultsComponent', () => {
  let component: FlueGasMoistureResultsComponent;
  let fixture: ComponentFixture<FlueGasMoistureResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasMoistureResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasMoistureResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});