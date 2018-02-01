import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasMaterialHelpComponent } from './flue-gas-material-help.component';

describe('FlueGasMaterialHelpComponent', () => {
  let component: FlueGasMaterialHelpComponent;
  let fixture: ComponentFixture<FlueGasMaterialHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasMaterialHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasMaterialHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
