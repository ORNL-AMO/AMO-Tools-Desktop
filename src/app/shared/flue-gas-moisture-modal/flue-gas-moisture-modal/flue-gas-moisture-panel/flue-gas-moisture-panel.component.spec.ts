import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FlueGasMoisturePanelComponent } from './flue-gas-moisture-panel.component';

describe('FlueGasMoisturePanelComponent', () => {
  let component: FlueGasMoisturePanelComponent;
  let fixture: ComponentFixture<FlueGasMoisturePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasMoisturePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasMoisturePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});