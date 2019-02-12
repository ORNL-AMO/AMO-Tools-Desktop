import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtResultsPanelComponent } from './ssmt-results-panel.component';

describe('SsmtResultsPanelComponent', () => {
  let component: SsmtResultsPanelComponent;
  let fixture: ComponentFixture<SsmtResultsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtResultsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtResultsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
