import {
  AccountService,
  InvoiceHookupsService,
  InvoicesService,
  TimesheetEntriesService,
  TimesheetsService,
} from "@kudoo/graphql";
import { get, uniq } from "lodash";

const extraData: {
  invoice_notify?: () => any;
} = {};

extraData.invoice_notify = async (
  data: {
    invoice_id?: string;
    includeTimesheet?: boolean;
    includeTimesheetAttachments?: boolean;
  } = {},
) => {
  const { invoice_id } = data;
  try {
    // get Invoice
    const invoice = await InvoicesService.get(invoice_id);
    // get invoice hookups
    const invoiceHookups = await InvoiceHookupsService.getAll({
      filters: {
        invoiceId: { eq: invoice_id },
      },
    });
    // get timesheetentries
    let timeSheetEntriesIds = get(invoiceHookups, "nodes", []).map(
      (item) => item.timeSheetEntryId,
    );
    timeSheetEntriesIds = uniq(timeSheetEntriesIds);
    const timesheetEntries = await TimesheetEntriesService.getAll({
      filters: {
        id: { anyOf: timeSheetEntriesIds },
      },
    });
    // get timesheets
    const timeSheetIds = get(timesheetEntries, "nodes", []).map(
      (item) => item.timeSheetId,
    );
    const timesheets = await TimesheetsService.getAll({
      filters: {
        id: { anyOf: uniq(timeSheetIds) },
      },
    });
    // get users
    const meRes = await AccountService.me();
    let members = [];
    if (get(meRes, "data.me.companyMembers")) {
      members = get(meRes, "data.me.companyMembers");
    }
    return {
      invoice,
      timeSheets: get(timesheets, "nodes", []),
      users: members.reduce((acc, { user }) => {
        acc[user.id] = user;
        return acc;
      }, {}),
      includeTimesheet: data.includeTimesheet || false,
      includeTimesheetAttachments: data.includeTimesheetAttachments || false,
    };
  } catch (error) {
    console.log(error); // tslint:disable-line
  }
};

export default extraData;
