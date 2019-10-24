import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpAndResultsPanelComponent } from './help-and-results-panel.component';

describe('HelpAndResultsPanelComponent', () => {
  let component: HelpAndResultsPanelComponent;
  let fixture: ComponentFixture<HelpAndResultsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpAndResultsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpAndResultsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
