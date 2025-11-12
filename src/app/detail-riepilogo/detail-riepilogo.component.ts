import { Component, input, signal, effect, inject, output } from "@angular/core";
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { TipoDettaglioAllegato } from "@bds/internauta-model";
import { AttachmentsBoxService } from "../attachments-box/attachments.service";
import { Attachment } from "../attachments-box/attachment";

@Component({
  selector: "detail-riepilogo",
  standalone: true,
  imports: [],
  providers: [],
  template: `
    <h2>Riepilogo</h2>
    <p-table>

    </p-table>
  `,
  styles: `
    :host ::ng-deep detail-riepilogo {
    } 
  `,
})
export class DetailRiepilogoComponent {
  private attachmentsBoxService = inject(AttachmentsBoxService);

  // Input che riceve l'allegato dal contenitore
  public selectedAttachmentData = input<{ attachment: Attachment; detailType: TipoDettaglioAllegato } | null>(null);
  public idAttachmentVersionChanged = output<number>();

  // Stato interno per il blob del PDF
  pdfSource = signal<any>(null);
  loading = signal(false);

  constructor() {
    effect(() => {
      
    });
  }
}
