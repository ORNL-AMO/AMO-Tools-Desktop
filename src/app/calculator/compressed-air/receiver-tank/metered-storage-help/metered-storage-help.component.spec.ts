import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredStorageHelpComponent } from './metered-storage-help.component';

describe('MeteredStorageHelpComponent', () => {
  let component: MeteredStorageHelpComponent;
  let fixture: ComponentFixture<MeteredStorageHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredStorageHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredStorageHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
