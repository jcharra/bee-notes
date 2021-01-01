import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExcoloniesPage } from './excolonies.page';

describe('ExcoloniesPage', () => {
  let component: ExcoloniesPage;
  let fixture: ComponentFixture<ExcoloniesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExcoloniesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExcoloniesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
