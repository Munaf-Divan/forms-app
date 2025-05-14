import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateFormComponent } from './pages/create-form/create-form.component';
import { ViewResponsesComponent } from './pages/view-responses/view-responses.component';
import { PublicFormComponent } from './pages/public-form/public-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'create-form', component: CreateFormComponent },
  { path: 'view-responses/:id', component: ViewResponsesComponent },
  { path: 'form/:id', component: PublicFormComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
