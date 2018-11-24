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
}

type EmailData = { company_token?: string; user_token?: string } & (
  | IWelcomeEmailData
  | IConfirmEmailData
  | IInviteEmailData
  | IInvoiceNotifyEmailData
  | IRememberEmailData
  | ITimesheetApproveEmailData
  | ITimesheetNotifyEmailData);

interface IRenderArguments {
  name: string;
  type: string;
  data: EmailData;
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
    };
    public SUBJECTS: {
      confirm: string;
      invite: string;
      invoice_notify: string;
      remember: string;
      time_sheet_approve: string;
      time_sheet_notify: string;
      welcome: string;
    };
    public render(params: IRenderArguments): string;
    public send(params: ISendArguments): ISendResponse;
  }

  export const Mail: KudooMail;
}
