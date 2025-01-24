import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseNotesModalComponent } from './release-notes-modal.component';

describe('ReleaseNotesModalComponent', () => {
  let component: ReleaseNotesModalComponent;
  let fixture: ComponentFixture<ReleaseNotesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleaseNotesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleaseNotesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
