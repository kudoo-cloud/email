import { GraphQLRequest } from "@kudoo/graphql";
import sgMail from "@sendgrid/mail";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import extraData from "./extraData";

const EMAIL_TEMPLATE_BASE = path.resolve(__dirname + "/../views/emails");

class Mail {
  public TEMPLATES = {
    confirm: "confirm",
    invite: "invite",
    invoice_notify: "invoice_notify",
    remember: "remember",
    time_sheet_approve: "time_sheet_approve",
    time_sheet_notify: "time_sheet_notify",
    welcome: "welcome",
  };

  public SUBJECTS = {
    confirm: "Confirm email address",
    invite: "You have been invited to Kudoo",
    invoice_notify: "Invoice Notification",
    remember: "Reset password",
    time_sheet_approve: "Timesheet Approve",
    time_sheet_notify: "TimeSheet notification",
    welcome: "Welcome to Kudoo",
  };

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
/**
 * The function to render the emails. It returns an EJS object.
 *
 * @param {IRenderArguments} - interface IRenderArguments {
 *                                name: string;
 *                                type: string;
 *                                data: EmailData;
 * }
 * @return {EJS} Think it's an EJS Object. I've installed EJS Types
 * for Typescript, so once I play around a bit more I'll update this
 * Documentation
 *
 * @example
 *
 *      const args = {"confirm","html","{}"};
 *      render(args);
 */
  public render = async ({ name, type, data }: IRenderArguments) => {
    if (data && data.user_token && data.company_token) {
      GraphQLRequest.userToken = data.user_token;
      GraphQLRequest.companyToken = data.company_token;
    }

    const func = extraData[name];
    if (typeof func === "function") {
      // if there is function to fetch extra data , then
      // calls custom functions for fetching extra data
      const moreData = await func(data);
      data = { ...data, ...moreData };
    }

    const filename = `${EMAIL_TEMPLATE_BASE}/${type}/${name}.ejs`;
    const template = fs.readFileSync(filename, "utf-8");
    return ejs.render(template, data, { filename });
  }

/**
 * The function to render the emails. It returns an EJS object.
 *
 * @param {ISendArguments} - interface ISendArguments {
 *                                templateName?: string;
 *                                templateData?: EmailData;
 *                                to: string[];
 *                                cc?: string[];
 *                                bcc?: string[];
 *                                subject?: string;
 *                                text?: string;
 *                                html?: string;
 *                                isMultiple?: boolean;  name: string;
 *                                type: string;
 *                                data: EmailData;
 * }
 * @return {Object} {
 *      subject: finalSubject,
 *      text: finalText,
 *      html: finalHTML,
 *   };
 *
 * @example
 *
 *      render(args);
 */
  public send = async (params: ISendArguments) => {
    const {
      templateName,
      templateData,
      to = [],
      cc = [],
      bcc = [],
      subject = "",
      text = "",
      html = "",
      isMultiple = false,
      attachments = [],
    } = params;
    let finalHTML = html;
    let finalText = text;
    let finalSubject = subject;

    if (!templateName && !html && !text) {
      throw new Error("html or text or templateName required");
    }

    if (templateName) {
      finalHTML = await this.render({
        name: templateName,
        type: "html",
        data: templateData,
      });
      finalText = await this.render({
        name: templateName,
        type: "text",
        data: templateData,
      });
      finalSubject = this.SUBJECTS[templateName];
    }

    const msg = {
      to,
      cc,
      bcc,
      from: process.env.FROM_EMAIL,
      subject: finalSubject,
      text: finalText,
      html: finalHTML,
      isMultiple,
      attachments,
    };
    await sgMail.send(msg);

    return {
      subject: finalSubject,
      text: finalText,
      html: finalHTML,
    };
  }
}

export default new Mail();
