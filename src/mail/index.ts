import sgMail from "@sendgrid/mail";
import ejs from "ejs";
import fs from "fs";
import graphQLRequest from "kudoo-graphql/services";
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

  public render = async ({ name, type, data }) => {
    const { user_token, company_token } = data;
    if (user_token && company_token) {
      graphQLRequest.userToken = user_token;
      graphQLRequest.companyToken = company_token;
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

  public send = async ({
    templateName,
    templateData,
    to = [],
    cc = [],
    bcc = [],
    subject = "",
    text = "",
    html = "",
    isMultiple = false,
  }) => {
    if (!templateName && !html && !text) {
      throw new Error("html or text or templateName required");
    }

    if (templateName) {
      html = await this.render({
        name: templateName,
        type: "html",
        data: templateData,
      });
      text = await this.render({
        name: templateName,
        type: "text",
        data: templateData,
      });
      subject = this.SUBJECTS[templateName];
    }

    const msg = {
      to,
      cc,
      bcc,
      from: process.env.FROM_EMAIL,
      subject,
      text,
      html,
      isMultiple,
    };
    await sgMail.send(msg);

    return {
      html,
      text,
      subject,
    };
  }
}

export default new Mail();
