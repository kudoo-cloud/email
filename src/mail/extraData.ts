import Account from "kudoo-graphql/services/Account";
import InvoiceHookups from "kudoo-graphql/services/InvoiceHookups";
import Invoice from "kudoo-graphql/services/Invoices";
import TimesheetEntries from "kudoo-graphql/services/TimesheetEntries";
import Timesheets from "kudoo-graphql/services/Timesheets";
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
    const invoice = await Invoice.get(invoice_id);
    // get invoice hookups
    const invoiceHookups = await InvoiceHookups.getAll({
      filters: {
        invoiceId: { eq: invoice_id },
      },
    });
    // get timesheetentries
    let timeSheetEntriesIds = get(invoiceHookups, "nodes", []).map(
      (item) => item.timeSheetEntryId,
    );
    timeSheetEntriesIds = uniq(timeSheetEntriesIds);
    const timesheetEntries = await TimesheetEntries.getAll({
      filters: {
        id: { anyOf: timeSheetEntriesIds },
      },
    });
    // get timesheets
    const timeSheetIds = get(timesheetEntries, "nodes", []).map(
      (item) => item.timeSheetId,
    );
    const timesheets = await Timesheets.getAll({
      filters: {
        id: { anyOf: uniq(timeSheetIds) },
      },
    });
    // get users
    const meRes = await Account.me();
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
