import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasComponent } from './flue-gas.component';

describe('FlueGasComponent', () => {
  let component: FlueGasComponent;
  let fixture: ComponentFixture<FlueGasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlueGasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
