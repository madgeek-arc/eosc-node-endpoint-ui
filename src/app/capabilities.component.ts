import { Component, OnInit } from '@angular/core';
import { CapabilitiesService, Capability, CapabilitiesObject } from './capabilities.service';
import {AuthService} from './authentication.service.component';

@Component({
  selector: 'app-capabilities',
  standalone: false,
  templateUrl: './capabilities.component.html'
})
export class CapabilitiesComponent implements OnInit {
  data: CapabilitiesObject | null = null;
  editingNodeEndpoint = false; // toggle state
  loading = false;
  success: string | null = null;
  error: string | null = null;

  newCapability: Capability = { capability_type: '', endpoint: '', version: '', api_spec: '', protocol: '', status: '' };
  selectedCapability: Capability | null = null;  // for modal editing
  oldCapabilityType: string | null = null;

  capabilityTypes: string[] = [
    'AAI',
    'Accounting',
    'Monitoring',
    'Execution Framework',
    'Helpdesk',
    'Integration Suite',
    'Messaging',
    'PID',
    'Resource Catalogue',
    'Front Office',
    'Order Management'
  ];

  protocols: string[] = [
    'REST',
    'SOAP',
    'gRPC',
    'SSE',
    'WebSocket',
    'RSocket'
  ];

  statuses: string[] = [
    'OPERATIONAL',
    'MAINTENANCE',
    'UNAVAILABLE'
  ];

  selectedProtocol = '';
  isCustomProtocol = false;

  selectedStatus = '';
  isCustomStatus = false;

  onProtocolChange(value: string) {
    if (value === '__other__') {
      this.isCustomProtocol = true;
      this.newCapability.protocol = '';
      if (this.selectedCapability) this.selectedCapability.protocol = '';
    } else {
      this.isCustomProtocol = false;
      this.newCapability.protocol = value;
      if (this.selectedCapability) this.selectedCapability.protocol = value;
    }
  }

  onStatusChange(value: string) {
    if (value === '__other__') {
      this.isCustomStatus = true;
      this.newCapability.status = '';
      if (this.selectedCapability) this.selectedCapability.status = '';
    } else {
      this.isCustomStatus = false;
      this.newCapability.status = value;
      if (this.selectedCapability) this.selectedCapability.status = value;
    }
  }

  constructor(protected authService: AuthService, private capService: CapabilitiesService) {}

  ngOnInit() {
    this.loadCapabilities();
  }

  isUrl(value: string): boolean {
    return /^https?:\/\//.test(value);
  }

  loadCapabilities() {
    this.loading = true;
    this.error = null;
    this.capService.getCapabilities().subscribe({
      next: (res) => {
        // always normalize to avoid null errors
        this.data = {
          ...res,
          capabilities: res.capabilities ?? []
        };
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load.';
        this.loading = false;
      }
    });
  }

  /** Add new capability */
  addCap() {
    if (!this.newCapability.capability_type || !this.data) return;

    const updatedData: CapabilitiesObject = {
      ...this.data,
      capabilities: [...(this.data.capabilities ?? []), { ...this.newCapability }]
    };

    // reset dropdown state
    this.selectedProtocol = '';
    this.selectedStatus = '';
    this.isCustomProtocol = false;
    this.isCustomStatus = false;

    this.capService.updateCapabilities(updatedData).subscribe({
      next: () => {
        this.loadCapabilities();
        this.newCapability = { capability_type: '', endpoint: '', version: '', api_spec: '', protocol: '', status: '' };
        this.showSuccess('Capability added successfully!');
      },
      error: (err) => {
        console.error('Update failed', err);
        this.showError('Failed to submit.');
      }
    });

    this.resetProtocolStatusState();
  }

  /** Open delete confirmation modal */
  confirmDelete(cap: Capability) {
    this.selectedCapability = { ...cap };
    const modal = document.getElementById('delete-modal');
    if (modal) {
      // @ts-ignore
      UIkit.modal(modal).show();
    }
  }

  /** Execute deletion */
  deleteCap() {
    if (!this.selectedCapability || !this.data) return;

    const updatedData: CapabilitiesObject = {
      ...this.data,
      capabilities: (this.data.capabilities ?? []).filter(
        c => c.capability_type !== this.selectedCapability!.capability_type
      )
    };

    this.capService.updateCapabilities(updatedData).subscribe({
      next: () => {
        this.loadCapabilities();
        this.showSuccess('Deleted successfully!');
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.showError('Failed to delete.');
        this.closeDeleteModal();
      }
    });
  }

  /** Close the delete modal */
  closeDeleteModal() {
    this.selectedCapability = null;
    const modal = document.getElementById('delete-modal');
    if (modal) {
      // @ts-ignore
      UIkit.modal(modal).hide();
    }
  }

  /** Open modal for editing */
  editCap(cap: Capability) {
    this.selectedCapability = { ...cap }; // make a copy
    this.oldCapabilityType = cap.capability_type; // store original type

    // Pre-populate protocol dropdown
    if (this.protocols.includes(cap.protocol)) {
      this.selectedProtocol = cap.protocol;
      this.isCustomProtocol = false;
    } else {
      this.selectedProtocol = '__other__';
      this.isCustomProtocol = true;
    }

    // Pre-populate status dropdown
    if (this.statuses.includes(cap.status)) {
      this.selectedStatus = cap.status;
      this.isCustomStatus = false;
    } else {
      this.selectedStatus = '__other__';
      this.isCustomStatus = true;
    }

    const modal = document.getElementById('edit-modal');
    if (modal) {
      // @ts-ignore
      UIkit.modal(modal).show();
    }
  }

  /** Save changes from modal */
  saveEdit() {
    if (!this.selectedCapability || !this.data || !this.oldCapabilityType) return;

    const updatedData: CapabilitiesObject = {
      ...this.data,
      capabilities: (this.data.capabilities ?? []).map(c =>
        c.capability_type === this.oldCapabilityType
          ? { ...this.selectedCapability! }
          : c
      )
    };

    this.capService.updateCapabilities(updatedData).subscribe({
      next: () => {
        this.loadCapabilities();
        this.showSuccess('Saved successfully!');
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Update failed', err);
        this.showError('Failed to save.');
        this.closeEditModal();
      }
    });

    this.resetProtocolStatusState();
  }

  closeEditModal() {
    // reset dropdown state
    this.selectedProtocol = '';
    this.selectedStatus = '';
    this.isCustomProtocol = false;
    this.isCustomStatus = false;
    this.selectedCapability = null;
    this.oldCapabilityType = null;
    const modal = document.getElementById('edit-modal');
    if (modal) {
      // @ts-ignore
      UIkit.modal(modal).hide();
    }
    this.resetProtocolStatusState();
  }

  /** node_endpoint */
  toggleNodeEndpointEdit() {
    if (!this.editingNodeEndpoint) {
      this.editingNodeEndpoint = true; // Enter edit mode
    } else {
      this.saveNodeEndpoint(); // Save and exit edit mode
    }
  }

  saveNodeEndpoint() {
    if (!this.data) return;

    const updatedData: CapabilitiesObject = {
      ...this.data,
      node_endpoint: this.data.node_endpoint
    };

    this.capService.updateCapabilities(updatedData).subscribe({
      next: () => {
        this.showSuccess('Node endpoint updated successfully!');
        this.editingNodeEndpoint = false; // disable input again
        this.loadCapabilities();
      },
      error: (err) => {
        console.error('Update failed', err);
        this.showError('Failed to update node endpoint.');
      }
    });
  }

  /** helper methods to check if a capability type is used */
  isCapabilityTypeUsed(option: string): boolean {
    return <boolean>this.data?.capabilities.some(cap => cap.capability_type === option);
  }

  isCapabilityTypeUsedInEdit(option: string): boolean {
    // Allow the current capability type being edited
    if (this.selectedCapability?.capability_type === option) return false;
    // Disable others that are already used
    return this.data?.capabilities?.some(cap => cap.capability_type === option) || false;
  }

  /** resets protocol and status fields */
  resetProtocolStatusState() {
    this.selectedProtocol = '';
    this.selectedStatus = '';
    this.isCustomProtocol = false;
    this.isCustomStatus = false;
    this.newCapability.protocol = '';
    this.newCapability.status = '';
  }

  /** success and error message helpers */
  private showSuccess(msg: string) {
    this.success = msg;
    setTimeout(() => (this.success = null), 5000);
  }

  private showError(msg: string) {
    this.error = msg;
    setTimeout(() => (this.error = null), 5000);
  }
}
