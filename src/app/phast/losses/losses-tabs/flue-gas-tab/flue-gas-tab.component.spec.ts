import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasTabComponent } from './flue-gas-tab.component';

describe('FlueGasTabComponent', () => {
  let component: FlueGasTabComponent;
  let fixture: ComponentFixture<FlueGasTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
