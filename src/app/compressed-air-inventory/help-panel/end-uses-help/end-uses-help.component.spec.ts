import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUsesHelpComponent } from './end-uses-help.component';

describe('EndUsesHelpComponent', () => {
  let component: EndUsesHelpComponent;
  let fixture: ComponentFixture<EndUsesHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndUsesHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndUsesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
