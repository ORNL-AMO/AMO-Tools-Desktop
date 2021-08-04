import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasModalComponent } from './flue-gas-modal.component';

describe('FlueGasModalComponent', () => {
  let component: FlueGasModalComponent;
  let fixture: ComponentFixture<FlueGasModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlueGasModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
