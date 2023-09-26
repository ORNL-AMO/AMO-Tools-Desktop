import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizeSidebarComponent } from './visualize-sidebar.component';

describe('VisualizeSidebarComponent', () => {
  let component: VisualizeSidebarComponent;
  let fixture: ComponentFixture<VisualizeSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizeSidebarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizeSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
