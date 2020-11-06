import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasResultsComponent } from './flue-gas-results.component';

describe('FlueGasResultsComponent', () => {
  let component: FlueGasResultsComponent;
  let fixture: ComponentFixture<FlueGasResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlueGasResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
