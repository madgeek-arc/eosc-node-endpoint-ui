import { Component, OnInit } from '@angular/core';
import { CapabilitiesService, Capability, CapabilitiesObject } from './capabilities.service';

@Component({
  selector: 'app-capabilities',
  standalone: false,
  templateUrl: './capabilities.component.html'
})
export class CapabilitiesComponent implements OnInit {
  data: CapabilitiesObject | null = null;
  loading = false;
  success: string | null = null;
  error: string | null = null;

  newCap: Capability = { capability_type: '', endpoint: '', version: '' };
  selectedCap: Capability | null = null;  // for modal editing
  oldCapabilityType: string | null = null;

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
        this.data = res;
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

    // Build a copy of the current object with the new cap
    const updatedData: CapabilitiesObject = {
      ...this.data,
      capabilities: [...this.data.capabilities, { ...this.newCap }]
    };

    this.capService.updateCapabilities(updatedData).subscribe({
      next: () => {
        this.loadCapabilities(); // reload from backend
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

    // Build a new CapabilitiesObject without the selected capability
    const updatedData: CapabilitiesObject = {
      ...this.data,
      capabilities: this.data.capabilities.filter(c => c.capability_type !== this.selectedCap!.capability_type)
    };

    this.capService.updateCapabilities(updatedData).subscribe({
      next: () => {
        this.loadCapabilities(); // refresh UI from backend
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
      capabilities: this.data.capabilities.map(c =>
        c.capability_type === this.oldCapabilityType
          ? { ...this.selectedCap! }
          : c
      )
    };

    this.capService.updateCapabilities(updatedData).subscribe({
      next: () => {
        this.loadCapabilities(); // refresh UI from backend
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

  /** success and error message helpers */
  private showSuccess(msg: string) {
    this.success = msg;
    setTimeout(() => this.success = null, 5000);
  }

  private showError(msg: string) {
    this.error = msg;
    setTimeout(() => this.error = null, 5000);
  }

}
