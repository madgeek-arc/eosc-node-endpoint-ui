import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CapabilitiesComponent } from './capabilities.component';

const routes: Routes = [
  { path: '', component: CapabilitiesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
