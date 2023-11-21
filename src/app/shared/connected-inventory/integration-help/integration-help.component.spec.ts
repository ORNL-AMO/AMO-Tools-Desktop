import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationHelpComponent } from './integration-help.component';

describe('IntegrationHelpComponent', () => {
  let component: IntegrationHelpComponent;
  let fixture: ComponentFixture<IntegrationHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntegrationHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntegrationHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
