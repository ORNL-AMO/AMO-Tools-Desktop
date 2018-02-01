import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WallLossesSurfaceHelpComponent } from './wall-losses-surface-help.component';

describe('WallLossesSurfaceHelpComponent', () => {
  let component: WallLossesSurfaceHelpComponent;
  let fixture: ComponentFixture<WallLossesSurfaceHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallLossesSurfaceHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallLossesSurfaceHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
