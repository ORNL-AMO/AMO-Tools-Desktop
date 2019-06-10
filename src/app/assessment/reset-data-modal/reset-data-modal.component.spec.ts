import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetDataModalComponent } from './reset-data-modal.component';

describe('ResetDataModalComponent', () => {
  let component: ResetDataModalComponent;
  let fixture: ComponentFixture<ResetDataModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetDataModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
