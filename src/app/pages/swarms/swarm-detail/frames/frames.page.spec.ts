import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FramesPage } from './frames.page';

describe('FramesPage', () => {
  let component: FramesPage;
  let fixture: ComponentFixture<FramesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FramesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FramesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
