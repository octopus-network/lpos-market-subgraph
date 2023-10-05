import { near, BigInt, log } from "@graphprotocol/graph-ts"
import { JSON } from "assemblyscript-json";
import { handleLposMarketEvent } from "./lpos_market";
import { handleRestakingBaseEvent } from "./restaking_base";

export function handleReceipt(
  receiptWithOutcome: near.ReceiptWithOutcome
): void {
  let outcome = receiptWithOutcome.outcome;

  for (let i = 0; i < outcome.logs.length; i++) {
    let outcomeLog = outcome.logs[i];
    log.info('receipt.outcome.log[{}]= {}',[i.toString(),outcomeLog.toString()])
    if (outcomeLog.startsWith("EVENT_JSON:")) {
      outcomeLog = outcomeLog.replace("EVENT_JSON:", "");
      let jsonObject = <JSON.Obj>(JSON.parse(outcomeLog));

      let standard = jsonObject.get("standard")!.toString();
      let version = jsonObject.get("version")!.toString();

      if (standard == "lpos-market") {
        handleLposMarketEvent(jsonObject, receiptWithOutcome, i, version)
      } else if (standard == "restaking-base") {
        handleRestakingBaseEvent(jsonObject, receiptWithOutcome, i, version)
      }
    }
  }
}
