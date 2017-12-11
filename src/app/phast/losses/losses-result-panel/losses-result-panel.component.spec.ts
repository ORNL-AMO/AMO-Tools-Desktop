import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LossesResultPanelComponent } from './losses-result-panel.component';

describe('LossesResultPanelComponent', () => {
  let component: LossesResultPanelComponent;
  let fixture: ComponentFixture<LossesResultPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LossesResultPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LossesResultPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
