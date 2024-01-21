import { JSON } from "assemblyscript-json";
import { SubmittedUnstakeBatch } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";


export class SubmittedUnstakeBatchHelper {

	static unstake_batch_id(pool_id: string, unstake_batch_id: string): string {
		return pool_id+"#"+unstake_batch_id
	}

	public static newFromJsonData(obj: JSON.Obj, staking_pool_id: string): SubmittedUnstakeBatch{
		let unstake_batch_id = obj.getString("unstake_batch_id")!.valueOf()
		let submit_unstake_epoch = BigInt.fromString(obj.getString("submit_unstake_epoch")!.valueOf())
		let total_unstake_amount = BigInt.fromString(obj.getString("total_unstake_amount")!.valueOf())
		let claimed_amount = BigInt.fromString(obj.getString("claimed_amount")!.valueOf())
		let is_withdrawn = obj.getString("is_withdrawn")!.valueOf() =="true"?true: false

		let submit_unstake_batch = new SubmittedUnstakeBatch(this.unstake_batch_id(staking_pool_id, unstake_batch_id));
		submit_unstake_batch.submit_unstake_epoch = submit_unstake_epoch
		submit_unstake_batch.total_unstake_amount = total_unstake_amount
		submit_unstake_batch.claimed_amount = claimed_amount
		submit_unstake_batch.is_withdrawn = is_withdrawn

		submit_unstake_batch.staking_pool = staking_pool_id
		submit_unstake_batch.save()
		return submit_unstake_batch

	}

}