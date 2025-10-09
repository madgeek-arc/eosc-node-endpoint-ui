import { Component, OnInit } from '@angular/core';
import { CapabilitiesService, Capability, CapabilitiesObject } from './capabilities.service';

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

  newCap: Capability = { capability_type: '', endpoint: '', version: '' };
  selectedCap: Capability | null = null;  // for modal editing
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

  constructor(private capService: CapabilitiesService) {}

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
    if (!this.newCap.capability_type || !this.data) return;

    const updatedData: CapabilitiesObject = {
      ...this.data,
      capabilities: [...(this.data.capabilities ?? []), { ...this.newCap }]
    };

    this.capService.updateCapabilities(updatedData).subscribe({
      next: () => {
        this.loadCapabilities();
        this.newCap = { capability_type: '', endpoint: '', version: '' };
        this.showSuccess('Capability added successfully!');
      },
      error: (err) => {
        console.error('Update failed', err);
        this.showError('Failed to submit.');
      }
    });
  }

  /** Open delete confirmation modal */
  confirmDelete(cap: Capability) {
    this.selectedCap = { ...cap };
    const modal = document.getElementById('delete-modal');
    if (modal) {
      // @ts-ignore
      UIkit.modal(modal).show();
    }
  }

  /** Execute deletion */
  deleteCap() {
    if (!this.selectedCap || !this.data) return;

    const updatedData: CapabilitiesObject = {
      ...this.data,
      capabilities: (this.data.capabilities ?? []).filter(
        c => c.capability_type !== this.selectedCap!.capability_type
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
    this.selectedCap = null;
    const modal = document.getElementById('delete-modal');
    if (modal) {
      // @ts-ignore
      UIkit.modal(modal).hide();
    }
  }

  /** Open modal for editing */
  editCap(cap: Capability) {
    this.selectedCap = { ...cap }; // make a copy
    this.oldCapabilityType = cap.capability_type; // store original type
    const modal = document.getElementById('edit-modal');
    if (modal) {
      // @ts-ignore
      UIkit.modal(modal).show();
    }
  }

  /** Save changes from modal */
  saveEdit() {
    if (!this.selectedCap || !this.data || !this.oldCapabilityType) return;

    const updatedData: CapabilitiesObject = {
      ...this.data,
      capabilities: (this.data.capabilities ?? []).map(c =>
        c.capability_type === this.oldCapabilityType
          ? { ...this.selectedCap! }
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
  }

  closeEditModal() {
    this.selectedCap = null;
    this.oldCapabilityType = null; // reset old type
    const modal = document.getElementById('edit-modal');
    if (modal) {
      // @ts-ignore
      UIkit.modal(modal).hide();
    }
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
