import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BakeryComponent } from './pages/bakery/bakery.component';
import { LearnSkillComponent } from './pages/learn-skill/learn-skill.component';
import { ProductsComponent } from './pages/products/products.component';
import { SetingsComponent } from './pages/setings/setings.component';
import { FormsModule } from '@angular/forms';
import { BurgerComponent } from './pages/burger/burger.component';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { OrderTableComponent } from './pages/order-table/order-table.component';
import { TaskBoardComponent } from './pages/task-board/task-board.component';
@NgModule({
  declarations: [
    AppComponent,
    LearnSkillComponent,
    ProductsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    BakeryComponent,
    SetingsComponent,
    BurgerComponent,
    OrderTableComponent,
    TaskBoardComponent
  ],
 
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
