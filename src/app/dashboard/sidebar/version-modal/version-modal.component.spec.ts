import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionModalComponent } from './version-modal.component';

describe('VersionModalComponent', () => {
  let component: VersionModalComponent;
  let fixture: ComponentFixture<VersionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
