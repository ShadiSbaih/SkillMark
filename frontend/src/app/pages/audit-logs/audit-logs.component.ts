import { Component } from '@angular/core';
import { auditLogs } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss',
})
export class AuditLogsComponent {
  readonly auditLogs = auditLogs;
}
