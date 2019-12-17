import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolsMenuComponent } from './tools-menu.component';

describe('ToolsMenuComponent', () => {
  let component: ToolsMenuComponent;
  let fixture: ComponentFixture<ToolsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolsMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
