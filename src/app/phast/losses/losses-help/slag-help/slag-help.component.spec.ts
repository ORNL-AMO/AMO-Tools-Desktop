import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlagHelpComponent } from './slag-help.component';

describe('SlagHelpComponent', () => {
  let component: SlagHelpComponent;
  let fixture: ComponentFixture<SlagHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlagHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlagHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
