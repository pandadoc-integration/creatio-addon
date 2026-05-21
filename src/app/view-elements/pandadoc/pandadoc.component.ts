import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {
  CrtInput,
  CrtInterfaceDesignerItem,
  CrtViewElement,
  LicenseService,
} from '@creatio-devkit/common';

import './sdk.js';
import { initializeEventHandler } from './event-handler';

declare global {
  interface Window {
    PandaDoc: any;
    EventHandler: any;
  }
}

@Component({
  selector: 'pdc-pandadoc',
  templateUrl: './pandadoc.component.html',
  styleUrls: ['./pandadoc.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
@CrtViewElement({
  selector: 'pdc-pandadoc',
  type: 'pdc.PandaDoc',
})
@CrtInterfaceDesignerItem({
  toolbarConfig: {
    caption: 'PandaDoc Viewer',
    name: 'PandaDoc',
    icon: require('!!raw-loader?{esModule:false}!./icon.svg'),
    defaultPropertyValues: {
      width: '100%',
      height: '100%',
      entityType: '',
      entityId: '$Id',
      providerName: 'creatio',
      externalEditor: true,
      isExternalRunner: true,
    },
  },
})
export class PandaDocComponent implements OnInit, OnDestroy {
  @ViewChild('pandadocContainer', { static: true })
  pandadocContainer!: ElementRef<HTMLDivElement>;

  @Input()
  @CrtInput()
  public width: string = '100%';

  @Input()
  @CrtInput()
  public height: string = '100%';

  @Input()
  @CrtInput()
  public entityType: string = '';

  @Input()
  @CrtInput()
  public entityId: string = '$Id';

  @Input()
  @CrtInput()
  public providerName: string = 'creatio';

  @Input()
  @CrtInput()
  public externalEditor: boolean = true;

  @Input()
  @CrtInput()
  public isExternalRunner: boolean = true;

  @Input()
  public hasError = false;
  public errorMessage = '';

  private containerId = 'pandadoc-container';
  public showModal = false;
  // retry control
  private retryTimer?: number;
  private retryCount = 0;
  private readonly maxRetries = 50; // 50 * 100ms = 5s total
  private documentsUI: any;

  private _licenseService = new LicenseService();
  private isLicenseChecked = false;
  private hasLicense = false;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    initializeEventHandler(window);

    this.hasLicense = await this.checkLicenses();
    this.isLicenseChecked = true;

    if (!this.hasLicense) {
      this.hasError = true;
      this.errorMessage =
        'You do not have a license to use this component. Please contact your system administrator.';
      this.cdr.detectChanges();
      return;
    }

    if (this.entityType && this.entityType.trim() !== '') {
      this.initializePandaDoc();
    }
  }

  private async checkLicenses(): Promise<boolean> {
    const operations = ['PandaDoc.Business', 'PandaDoc.Enterprise'];
    console.log(
      '[PandaDoc component]: Checking licenses for operations',
      operations
    );
    try {
      const statuses = await this._licenseService.getLicenseOperationStatuses(
        operations
      );
      console.log('[PandaDoc component]: License statuses received', statuses);
      const hasLicense = Object.values(statuses).some((status) => status);
      console.log('[PandaDoc component]: Has valid license?', hasLicense);
      return hasLicense;
    } catch (error) {
      console.error('[PandaDoc component]: License check failed', error);
      return false;
    }
  }

  ngOnDestroy(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
    if (this.documentsUI) {
      this.documentsUI.reload();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['entityId'] ||
      changes['entityType'] ||
      changes['providerName'] ||
      changes['externalEditor'] ||
      changes['isExternalRunner']
    ) {
      console.log('[PandaDoc component]: ngOnChanges - props', {
        width: this.width,
        height: this.height,
        entityType: this.entityType,
        entityId: this.entityId,
        providerName: this.providerName,
        externalEditor: this.externalEditor,
        isExternalRunner: this.isExternalRunner,
        changes,
      });
      if (this.entityType && this.entityType.trim() !== '') {
        this.initializePandaDoc();
      }
    }
  }
  private initializePandaDoc(): void {
    if (!this.isLicenseChecked || !this.hasLicense) {
      return;
    }

    console.log('[PandaDoc component]: initializePandaDoc - props', {
      width: this.width,
      height: this.height,
      entityType: this.entityType,
      entityId: this.entityId,
      providerName: this.providerName,
      externalEditor: this.externalEditor,
      isExternalRunner: this.isExternalRunner,
    });

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
    }

    if (!this.entityId || !this.entityType || !this.providerName) {
      console.warn(
        '[PandaDoc component]: Cannot initialize - required properties missing',
        {
          entityType: this.entityType,
          entityId: this.entityId,
          providerName: this.providerName,
        }
      );
      return;
    }

    if (!window.PandaDoc) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(
          `[PandaDoc component]: Script not loaded yet, retrying (${this.retryCount}/${this.maxRetries})...`
        );
        this.retryTimer = window.setTimeout(
          () => this.initializePandaDoc(),
          100
        );
      } else {
        this.hasError = true;
        this.errorMessage = 'PandaDoc SDK failed to load';
        console.error(
          '[PandaDoc component]: SDK failed to load after max retries'
        );
        this.cdr.detectChanges();
      }
      return;
    }
    this.retryCount = 0;
    this.hasError = false;
    this.errorMessage = '';
    this.cdr.detectChanges();

    // @ts-ignore -- window.PandaDoc is provided by the imported SDK
    this.documentsUI = new window.PandaDoc.DefaultView();

    this.documentsUI.init({
      el: `#${this.containerId}`,
      initOptions: {
        externalEditor: true,
        isExternalRunner: true,
        provider: {
          name: this.providerName,
        },
      },
      data: {
        sourceEntity: {
          type: this.entityType,
          id: this.entityId,
        },
      },
      events: {
        onInit: (payload?: any) =>
          console.log('[PandaDoc component event]: onInit', payload),
        onInitDataError: (payload?: any) =>
          console.log('[PandaDoc component event]: onInitDataError', payload),
        onInitDataPassed: (payload?: any) =>
          console.log('[PandaDoc component event]: onInitDataPassed', payload),
        onDataError: (payload?: any) =>
          console.log('[PandaDoc component event]: onDataError', payload),
        onDataPassed: (payload?: any) =>
          console.log('[PandaDoc component event]: onDataPassed', payload),
        onDocumentCreate: (payload?: any) => {
          console.log('[PandaDoc component event]: onDocumentCreate', payload);
          this.openDocEditor();
        },
        onDocumentCreated: (payload?: any) =>
          console.log('[PandaDoc component event]: onDocumentCreated', payload),
        onDocumentOpen: (payload?: any) => {
          console.log('[PandaDoc component event]: onDocumentOpen', payload);
          if (payload && payload.documentUrl) {
            window.open(payload.documentUrl, '_blank');
          }
        },
        onTokensOpen: (payload?: any) =>
          console.log('[PandaDoc component event]: onTokensOpen', payload),
        onDraftDocumentUpdate: (payload?: any) =>
          console.log(
            '[PandaDoc component event]: onDraftDocumentUpdate',
            payload
          ),
        onCloseNewDocumentDialog: (payload?: any) => {
          console.log(
            '[PandaDoc component event]: onCloseNewDocumentDialog',
            payload
          );
          if (this.documentsUI) {
            this.documentsUI.reload();
          }
        },
        onClose: (payload?: any) => {
          console.log('[PandaDoc component event]: onClose', payload);
          if (this.documentsUI) {
            this.documentsUI.reload();
          }
        },
        onDocumentSent: (payload?: any) =>
          console.log('[PandaDoc component event]: onDocumentSent', payload),
        onDocumentCompleted: (payload?: any) =>
          console.log(
            '[PandaDoc component event]: onDocumentCompleted',
            payload
          ),
        onDocumentNameChanged: (payload?: any) =>
          console.log(
            '[PandaDoc component event]: onDocumentNameChanged',
            payload
          ),
        onWorkflowStart: (payload?: any) => {
          console.log('[PandaDoc component event]: onWorkflowStart', payload);
          this.openWorkflowModal();
        },
        onWorkflowOpen: (payload?: any) => {
          console.log('[PandaDoc component event]: onWorkflowOpen', payload);
          this.openWorkflowModal(payload.process.id);
        },
        onDocumentDownload: (payload?: any) =>
          console.log(
            '[PandaDoc component event]: onDocumentDownload',
            payload
          ),
      },
    });
  }

  private openDocEditor(): void {
    console.log(
      '[PandaDoc component openDocEditor] : PandaDoc opening DocEditor modal'
    );
    this.showModal = true;
    this.cdr.detectChanges();
    const wizardUI = new window.PandaDoc.DocEditor();
    console.log('[PandaDoc component openDocEditor] wizardUI:', wizardUI);
    console.log(
      '[PandaDoc component openDocEditor] provider',
      this.providerName
    );
    console.log('[PandaDoc component openDocEditor] type: ', this.entityType);
    console.log('[PandaDoc component openDocEditor] id: ', this.entityId);

    wizardUI.show({
      el: '#pandadoc-modal-container',
      initOptions: {
        hideCloseButton: true,
        provider: {
          name: this.providerName,
        },
      },
      data: {
        sourceEntity: {
          type: this.entityType,
          id: this.entityId,
        },
      },
    });
  }

  private openWorkflowModal(processId?: string): void {
    console.log(
      '[PandaDoc component openWorkflowModal] : PandaDoc opening Workflow modal'
    );
    this.showModal = true;
    this.cdr.detectChanges();
    const workflowRunner = new window.PandaDoc.WorkflowRunner();
    console.log(
      '[PandaDoc component openWorkflowModal] workflowRunner:',
      workflowRunner
    );
    console.log(
      '[PandaDoc component openWorkflowModal] provider',
      this.providerName
    );
    console.log(
      '[PandaDoc component openWorkflowModal] type: ',
      this.entityType
    );
    console.log('[PandaDoc component openWorkflowModal] id: ', this.entityId);

    // Using the approach from your example
    workflowRunner.init({
      el: '#pandadoc-modal-container',
      initOptions: {
        provider: {
          name: this.providerName,
        },
      },
      data: {
        process: {
          id: processId,
        },
        sourceEntity: {
          type: this.entityType,
          id: this.entityId,
        },
      },
      events: {
        onInit: () => {
          console.log('[PandaDoc WorkflowRunner]: Initialized');
        },
        onClose: () => {
          console.log('[PandaDoc WorkflowRunner]: Closed');
          this.closeModal();
        },
      },
    });
  }
}
