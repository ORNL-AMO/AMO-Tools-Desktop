import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolidLiquidFlueGasMaterialHelpComponent } from './solid-liquid-flue-gas-material-help.component';

describe('SolidLiquidFlueGasMaterialHelpComponent', () => {
  let component: SolidLiquidFlueGasMaterialHelpComponent;
  let fixture: ComponentFixture<SolidLiquidFlueGasMaterialHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolidLiquidFlueGasMaterialHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolidLiquidFlueGasMaterialHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
