import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasLeakageLossesHelpComponent } from './gas-leakage-losses-help.component';

describe('GasLeakageLossesHelpComponent', () => {
  let component: GasLeakageLossesHelpComponent;
  let fixture: ComponentFixture<GasLeakageLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasLeakageLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasLeakageLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
