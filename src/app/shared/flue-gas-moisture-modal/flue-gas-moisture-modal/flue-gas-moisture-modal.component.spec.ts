import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FlueGasMoistureModalComponent } from './flue-gas-moisture-modal.component';

describe('FlueGasMoistureModalComponent', () => {
  let component: FlueGasMoistureModalComponent;
  let fixture: ComponentFixture<FlueGasMoistureModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasMoistureModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasMoistureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});