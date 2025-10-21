import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpPanelComponent } from './help-panel.component';

describe('HelpPanelComponent', () => {
  let component: HelpPanelComponent;
  let fixture: ComponentFixture<HelpPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HelpPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
