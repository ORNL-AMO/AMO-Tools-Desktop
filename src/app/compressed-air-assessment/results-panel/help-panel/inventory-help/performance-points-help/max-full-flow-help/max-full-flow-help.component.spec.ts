import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaxFullFlowHelpComponent } from './max-full-flow-help.component';

describe('MaxFullFlowHelpComponent', () => {
  let component: MaxFullFlowHelpComponent;
  let fixture: ComponentFixture<MaxFullFlowHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaxFullFlowHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaxFullFlowHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
