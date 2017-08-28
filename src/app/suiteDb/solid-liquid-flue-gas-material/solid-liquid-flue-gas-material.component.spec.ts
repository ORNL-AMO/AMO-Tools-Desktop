import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolidLiquidFlueGasMaterialComponent } from './solid-liquid-flue-gas-material.component';

describe('SolidLiquidFlueGasMaterialComponent', () => {
  let component: SolidLiquidFlueGasMaterialComponent;
  let fixture: ComponentFixture<SolidLiquidFlueGasMaterialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolidLiquidFlueGasMaterialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolidLiquidFlueGasMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
