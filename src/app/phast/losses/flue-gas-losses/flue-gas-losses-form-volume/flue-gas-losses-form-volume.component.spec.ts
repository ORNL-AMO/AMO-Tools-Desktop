import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasLossesFormVolumeComponent } from './flue-gas-losses-form-volume.component';

describe('FlueGasLossesFormVolumeComponent', () => {
  let component: FlueGasLossesFormVolumeComponent;
  let fixture: ComponentFixture<FlueGasLossesFormVolumeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasLossesFormVolumeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasLossesFormVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
