import { Routes, RouterModule } from '@angular/router'
import { HomeComponent } from './home'
import { LandingComponent } from './landing'
// import { AboutComponent } from './about'
import { NoContentComponent } from './no-content'
import { LoginComponent } from './login'

import { AuthGuard } from './shared/auth'

import { DataResolver } from './app.resolver'


export const ROUTES: Routes = [
  { path: '',      component: LandingComponent },
  { path: 'home',  component: HomeComponent, canActivate: [ AuthGuard ] },
  { path: 'login', component: LoginComponent, canActivate: [ AuthGuard ] },
  // { path: 'about', component: AboutComponent },
  /*{
    path: 'detail', loadChildren: () => System.import('./+detail').then((comp: any) => {
      return comp.default
    })
    ,
  },*/
  { path: '**',    component: NoContentComponent },
]
