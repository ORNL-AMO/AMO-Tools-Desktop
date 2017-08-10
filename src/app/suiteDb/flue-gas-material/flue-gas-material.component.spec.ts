import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasMaterialComponent } from './flue-gas-material.component';

describe('FlueGasMaterialComponent', () => {
  let component: FlueGasMaterialComponent;
  let fixture: ComponentFixture<FlueGasMaterialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasMaterialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
