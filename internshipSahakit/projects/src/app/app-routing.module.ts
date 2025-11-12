import { BakeryComponent } from './pages/bakery/bakery.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LearnSkillComponent } from './pages/learn-skill/learn-skill.component';
import { ProductsComponent } from './pages/products/products.component';
import { BurgerComponent } from './pages/burger/burger.component';
import { OrderTableComponent } from './pages/order-table/order-table.component';
import { TaskBoardComponent } from './pages/task-board/task-board.component';


const routes: Routes = [
  { path: 'bakery', component: BakeryComponent },
  { path: '', redirectTo: 'bakery', pathMatch: 'full' },
  {path:'learn-skill', component: LearnSkillComponent},
  {path:'products',component:ProductsComponent},
  {
    path: 'setting',
    loadComponent: () =>
      import('./pages/setings/setings.component').then(m => m.SetingsComponent)
  },
  {
    path: 'burger',
    loadComponent: () =>
      import('./pages/burger/burger.component').then(m => m.BurgerComponent)
  },
  {path:'order',component:OrderTableComponent},
  {
    path: 'task-board',
    loadComponent: () =>
      import('./pages/task-board/task-board.component').then(m => m.TaskBoardComponent)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
}
