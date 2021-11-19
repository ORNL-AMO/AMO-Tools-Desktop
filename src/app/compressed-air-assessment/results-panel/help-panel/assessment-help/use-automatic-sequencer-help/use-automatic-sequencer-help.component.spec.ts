import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UseAutomaticSequencerHelpComponent } from './use-automatic-sequencer-help.component';

describe('UseAutomaticSequencerHelpComponent', () => {
  let component: UseAutomaticSequencerHelpComponent;
  let fixture: ComponentFixture<UseAutomaticSequencerHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UseAutomaticSequencerHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UseAutomaticSequencerHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
