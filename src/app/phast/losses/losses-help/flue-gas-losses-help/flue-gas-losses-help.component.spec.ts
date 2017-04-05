import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasLossesHelpComponent } from './flue-gas-losses-help.component';

describe('FlueGasLossesHelpComponent', () => {
  let component: FlueGasLossesHelpComponent;
  let fixture: ComponentFixture<FlueGasLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
