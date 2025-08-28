import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CapabilitiesComponent } from "./capabilities.component";
import { CapabilitiesService } from "./capabilities.service";

@NgModule({
  declarations: [
    AppComponent,
    CapabilitiesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    CapabilitiesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
