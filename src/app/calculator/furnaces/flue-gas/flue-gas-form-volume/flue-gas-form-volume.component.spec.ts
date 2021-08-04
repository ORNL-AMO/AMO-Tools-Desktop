import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasFormVolumeComponent } from './flue-gas-form-volume.component';

describe('FlueGasFormVolumeComponent', () => {
  let component: FlueGasFormVolumeComponent;
  let fixture: ComponentFixture<FlueGasFormVolumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlueGasFormVolumeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasFormVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
