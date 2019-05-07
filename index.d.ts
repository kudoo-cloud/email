interface IWelcomeEmailData {
  first_name: string;
  last_name: string;
}

interface IConfirmEmailData {
  first_name: string;
  last_name: string;
  token_url: string;
}

interface IInviteEmailData {
  first_name: string;
  last_name: string;
  token_url: string;
  company_name: string;
  type: string;
}

interface IInvoiceNotifyEmailData {
  invoice_id: string;
  includeTimesheet?: boolean;
  includeTimesheetAttachments?: boolean;
}

interface IPurchaseOrderData {
  poNumber: number;
  name: string;
  companyName: string;
  preview: object;
  isSendViaEDI: boolean;
  isMJML: boolean;
  type: string;
}

interface IRememberEmailData {
  token_url: string;
}

interface ITimesheetApproveEmailData {
  url: string;
  first_name: string;
  last_name: string;
}

interface ITimesheetNotifyEmailData {
  first_name: string;
  last_name: string;
  url?: string;
}

interface ISubscriptionEmailData {
  company_owner: string;
  company_name: string;
  company_currency: string;
  invoice_total: number;
  isMJML: boolean;
  subscription_url: string;
  type: string;
}

type EmailData = { company_token?: string; user_token?: string } & (
  | IWelcomeEmailData
  | IConfirmEmailData
  | ISubscriptionEmailData
  | IInviteEmailData
  | IInvoiceNotifyEmailData
  | IRememberEmailData
  | ITimesheetApproveEmailData
  | ITimesheetNotifyEmailData
  | IPurchaseOrderData);

interface IRenderArguments {
  name: string;
  type: string;
  data: EmailData;
}

interface IAttachment {
  content: string | Buffer;
  type?: string;
  filename: string;
  disposition?: string;
  content_id?: string;
}

interface ISendArguments {
  templateName?: string;
  templateData?: EmailData;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  text?: string;
  html?: string;
  isMultiple?: boolean;
  attachments?: IAttachment[];
}

interface ISendResponse {
  subject: string;
  text: string;
  html: string;
}

declare module "@kudoo/email" {
  class KudooMail {
    public TEMPLATES: {
      confirm: string;
      invite: string;
      invoice_notify: string;
      remember: string;
      time_sheet_approve: string;
      time_sheet_notify: string;
      welcome: string;
      subscription: string;
      purchase_order: string;
    };
    public SUBJECTS: {
      confirm: string;
      invite: string;
      invoice_notify: string;
      remember: string;
      time_sheet_approve: string;
      time_sheet_notify: string;
      welcome: string;
      subscription: string;
      purchase_order: string;
    };
    public render(params: IRenderArguments): string;
    public send(params: ISendArguments): ISendResponse;
  }

  export const Mail: KudooMail;
}
