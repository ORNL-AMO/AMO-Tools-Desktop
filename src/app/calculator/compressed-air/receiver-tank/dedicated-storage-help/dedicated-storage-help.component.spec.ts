import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DedicatedStorageHelpComponent } from './dedicated-storage-help.component';

describe('DedicatedStorageHelpComponent', () => {
  let component: DedicatedStorageHelpComponent;
  let fixture: ComponentFixture<DedicatedStorageHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DedicatedStorageHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DedicatedStorageHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
