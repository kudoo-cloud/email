import { InvoicesService, TimesheetsService } from "@kudoo/graphql";
import { compact, get, uniq } from "lodash";

const extraData: {
  invoice_notify?: () => any;
} = {};

extraData.invoice_notify = async (
  data: {
    invoiceId?: string;
    includeTimesheet?: boolean;
    includeTimesheetAttachments?: boolean;
  } = {},
) => {
  const { invoiceId } = data;
  let includeTimesheet = data.includeTimesheet;
  let includeTimesheetAttachments = data.includeTimesheetAttachments;
  if (typeof data.includeTimesheet === "string") {
    includeTimesheet = data.includeTimesheet === "true";
  }
  if (typeof data.includeTimesheetAttachments === "string") {
    includeTimesheetAttachments = data.includeTimesheetAttachments === "true";
  }
  try {
    // get Invoice
    const invoice = await InvoicesService.get(invoiceId);
    const items = get(invoice, "items") || [];
    const entries = compact(items.map(({ timeSheetEntry }) => timeSheetEntry));
    const timeSheets = compact(items.map(({ timeSheet }) => timeSheet));
    let timeSheetIds = [];
    if (entries.length > 0) {
      timeSheetIds = entries.map(({ timeSheet }) => timeSheet.id);
    } else if (timeSheets.length > 0) {
      timeSheetIds = timeSheets.map(({ id }) => id);
    }
    const timesheets = await TimesheetsService.getAll({
      where: {
        id_in: uniq(timeSheetIds),
      },
    });
    return {
      invoice,
      timeSheets: get(timesheets, "nodes", []),
      includeTimesheet,
      includeTimesheetAttachments,
    };
  } catch (error) {
    console.log(error); // tslint:disable-line
  }
};

export default extraData;
