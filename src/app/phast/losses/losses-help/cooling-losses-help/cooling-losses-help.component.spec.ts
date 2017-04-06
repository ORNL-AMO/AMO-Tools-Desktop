import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingLossesHelpComponent } from './cooling-losses-help.component';

describe('CoolingLossesHelpComponent', () => {
  let component: CoolingLossesHelpComponent;
  let fixture: ComponentFixture<CoolingLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoolingLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
