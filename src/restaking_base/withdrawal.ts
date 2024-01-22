import { JSON } from "assemblyscript-json";
import { DecreaseDelegationAction, DecreaseStakeAction, SubmittedUnstakeBatch, UndelegateAction, UserAction, Withdrawal } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { action_types } from "../user_action";
import { SubmittedUnstakeBatchHelper } from "./unstake_batch";

export class WithdrawalHelper {
	public static new(
		withdraw_certificate: string,
		staker_id: string,
		pool_id: string,
		amount: BigInt,
		unlock_epoch: BigInt,
		unlock_time: BigInt,
		beneficiary: string,
		create_action: string,
		unstake_batch_id: string | null,
	): Withdrawal {


		let withdrawal = new Withdrawal(withdraw_certificate)
		withdrawal.withdrawal_certificate = withdraw_certificate
		withdrawal.staker = staker_id
		withdrawal.pool_id = pool_id
		withdrawal.amount = amount
		withdrawal.unlock_epoch = unlock_epoch.plus(BigInt.fromI32(4))
		withdrawal.create_epoch = unlock_epoch.minus(BigInt.fromI32(4))
		withdrawal.unlock_time = unlock_time
		withdrawal.beneficiary = beneficiary
		withdrawal.create_action = create_action
		withdrawal.is_withdrawn = false
		withdrawal.unstake_batch_id = unstake_batch_id

		withdrawal.save()
		return withdrawal
	}

	public static newByPendingWithdrawalData(data: JSON.Obj, staker_id: string, create_action: string): Withdrawal {
		return this.new(
			data.getString("withdrawal_certificate")!.valueOf(),
			staker_id,
			data.getString("pool_id")!.valueOf(),
			BigInt.fromString(data.getString("amount")!.valueOf()),
			BigInt.fromString(data.getString("unlock_epoch")!.valueOf()),
			BigInt.fromString(data.getString("unlock_time")!.valueOf()),
			data.getString("beneficiary")!.valueOf(),
			create_action,
			data.getString("unstake_batch_id") ? data.getString("unstake_batch_id")!.valueOf() : null
		)
	}

	public static withdraw(
		withdraw_certificate: string,
		withdraw_action: string
	): void {
		let withdrawal = Withdrawal.load(withdraw_certificate)!
		withdrawal.is_withdrawn = true
		withdrawal.withdraw_action = withdraw_action
		withdrawal.save()

		if (withdrawal.unstake_batch_id) {
			let submitted_unstake_batch_id = SubmittedUnstakeBatchHelper.unstake_batch_id(withdrawal.pool_id, withdrawal.unstake_batch_id!)

			let submitted_unstake_batch = SubmittedUnstakeBatch.load(submitted_unstake_batch_id)
			if (submitted_unstake_batch) {
				submitted_unstake_batch.claimed_amount = submitted_unstake_batch.claimed_amount.plus(withdrawal.amount)
				submitted_unstake_batch.save()
			}
		}
	}
}