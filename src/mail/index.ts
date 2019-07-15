import { GraphQLRequest } from "@kudoo/graphql";
import sgMail from "@sendgrid/mail";
import ejs from "ejs";
import fs from "fs";
import isEqual from "lodash/isEqual";
import isNull from "lodash/isNull";
import path from "path";
import {PurchaseOrderMJMLToHTMLConverter, SubscriptionMJMLToHTMLConverter} from "../views/emails/mjml";
import extraData from "./extraData";

const EMAIL_TEMPLATE_BASE = path.resolve(__dirname + "/../views/emails");

class Mail {
  public TEMPLATES = {
    company_delete: "company_delete",
    confirm: "confirm",
    invite: "invite",
    invoice_notify: "invoice_notify",
    remember: "remember",
    time_sheet_approve: "time_sheet_approve",
    time_sheet_notify: "time_sheet_notify",
    welcome: "welcome",
    subscription: "subscription",
    purchase_order: "purchase_order",
    test_ping: "test_ping",
  };

  public SUBJECTS = {
    company_delete: "Kudoo company scheduled for deletion",
    confirm: "Confirm email address",
    invite: "You have been invited to Kudoo",
    invoice_notify: "Invoice Notification",
    remember: "Reset password",
    time_sheet_approve: "Timesheet Approve",
    time_sheet_notify: "TimeSheet notification",
    welcome: "Welcome to Kudoo",
    subscription: "Kudoo Subscription",
    test_ping: "Smoke Test Ping",
    purchase_order: "Purchase Order",
  };

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  /**
   * The function to render the emails. It returns an EJS object.
   *
   * @param {IRenderArguments}
   * interface IRenderArguments {
   *  name: string;
   *  type: string;
   * 	data: EmailData;
   * }
   * @return {Promise<string>}
   * - It returns HTML/Text string as a promise
   *
   * @example
   *      const args = {"confirm","html",{}};
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
   *      send(args);
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
      let MJMLToHTML = null;
      if (templateData && (templateData as any).isMJML) {
        if (isEqual((templateData as any).type, "subscription")) {
          MJMLToHTML = SubscriptionMJMLToHTMLConverter(templateData as any);
        }
        if (isEqual((templateData as any).type, "purchase_order")) {
          MJMLToHTML = PurchaseOrderMJMLToHTMLConverter(templateData as any);
        }
      }
      finalHTML = await this.render({
        name: templateName,
        type: "html",
        data: isNull(MJMLToHTML)
          ? templateData
          : ({ html_code: MJMLToHTML.html.trim() } as any),
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
    await sgMail.send(msg as any);

    return {
      subject: finalSubject,
      text: finalText,
      html: finalHTML,
    };
  }
}

export default new Mail();
