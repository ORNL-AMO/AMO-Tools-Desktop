import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSolidLiquidFlueGasMaterialsComponent } from './custom-solid-liquid-flue-gas-materials.component';

describe('CustomSolidLiquidFlueGasMaterialsComponent', () => {
  let component: CustomSolidLiquidFlueGasMaterialsComponent;
  let fixture: ComponentFixture<CustomSolidLiquidFlueGasMaterialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomSolidLiquidFlueGasMaterialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSolidLiquidFlueGasMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
