import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConfigService} from './app-config.service';

export interface Capability {
  capability_type: string;
  endpoint: string;
  version: string;
  api_spec: string;
  protocol: string;
  status: string;
}

export interface CapabilitiesObject {
  node_endpoint: string;
  capabilities: Capability[];
}

@Injectable({ providedIn: 'root' })
export class CapabilitiesService {

  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);

  getCapabilities() {
    return this.http.get<CapabilitiesObject>(`${this.appConfig.apiBaseUrl}/endpoint`);
  }

  updateCapabilities(capabilitiesObject: CapabilitiesObject): Observable<unknown> {
    const sanitized = {
      ...capabilitiesObject,
      capabilities: capabilitiesObject.capabilities.map(cap =>
        Object.fromEntries(
          Object.entries(cap).map(([key, value]) => [key, value === '' ? null : value])
        )
      )
    };
    return this.http.put(`${this.appConfig.apiBaseUrl}/endpoint`, sanitized);
  }

}
