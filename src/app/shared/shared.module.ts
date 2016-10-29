import { NgModule, ModuleWithProviders } from '@angular/core'
import { HttpModule } from '@angular/http'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { provideAuth, AuthService, AuthGuard } from './auth'
import { Spinner } from './spinner.component'

@NgModule({
  declarations: [
    Spinner,
  ],
  imports: [
    HttpModule,
    CommonModule,
    FormsModule,
  ],
  exports: [
    Spinner,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        AuthService,
        provideAuth(),
        AuthGuard,
      ],
    }
  }
}
