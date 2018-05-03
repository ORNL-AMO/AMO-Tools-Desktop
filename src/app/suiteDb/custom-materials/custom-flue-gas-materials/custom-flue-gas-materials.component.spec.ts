import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFlueGasMaterialsComponent } from './custom-flue-gas-materials.component';

describe('CustomFlueGasMaterialsComponent', () => {
  let component: CustomFlueGasMaterialsComponent;
  let fixture: ComponentFixture<CustomFlueGasMaterialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomFlueGasMaterialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomFlueGasMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
