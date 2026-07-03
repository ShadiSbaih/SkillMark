import { Component } from '@angular/core';
import { auditLogs } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  templateUrl: './audit-logs.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AuditLogsComponent {
  readonly auditLogs = auditLogs;
  readonly actions = ['All actions', 'CERTIFICATE_ISSUED', 'QUIZ_PUBLISHED', 'MEMBER_ADDED'];
}
