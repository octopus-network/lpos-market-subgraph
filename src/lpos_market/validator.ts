import { BigInt, log } from "@graphprotocol/graph-ts";
import { JSON } from "assemblyscript-json";
import { Delegator, Validator } from "../../generated/schema";
import { staked_balance_from_shares } from "../util";


export class ValidatorHelper {
	static newOrUpdateByValidatorInfo(validator_info: JSON.Obj): Validator {
		let validator_id = validator_info.getString("validator_id")!.valueOf()
		let validator = Validator.load(validator_id)

		if (!validator) {
			validator = new Validator(validator_id)
			validator.delegator_count = 0
			validator.delegator_list_string = [].join(',')
			validator.validator_id = validator_id
		}
		validator.escrow_id = validator_info.getString("escrow_id")!.valueOf()
		validator.total_staked_balance = BigInt.fromString(validator_info.getString("total_staked_balance")!.valueOf())
		validator.total_share_balance = BigInt.fromString(validator_info.getString("total_share_balance")!.valueOf())
		validator.share_balance = BigInt.fromString(validator_info.getString("share_balance")!.valueOf())
		validator.staked_balance = staked_balance_from_shares(
			validator.total_staked_balance,
			validator.total_share_balance,
			validator.share_balance
		)
		validator.status = validator_info.getString("status")!.valueOf();
		if (validator_info.getString("unstake_withdraw_certificate")) {

			validator.unstake_withdraw_certificate = validator_info.getString("unstake_withdraw_certificate")!.valueOf()
		}

		validator.staker = validator.escrow_id

		validator.save()
		return validator
	}

	static delegate(validator_id: string, delegator_id: string): void {
		let validator = Validator.load(validator_id)!
		let delegator_list = validator.delegator_list_string.split(',')// (<JSON.Arr>(JSON.parse(validator.delegator_json))).valueOf();
		delegator_list.push(delegator_id)

		validator.delegator_count += 1
		validator.delegator_list_string = delegator_list.join(',')

		validator.save()
	}

	static undelegate(validator_id: string, delegator_id: string): void {
		let validator = Validator.load(validator_id)!
		// let delegator_list_json: JSON.Arr = (<JSON.Arr>(JSON.parse(validator.delegator_json)));
		let delegator_list = validator.delegator_list_string.split(',')

		let after_undelegate_delegator_list: Array<string> = []

		for (let i = 0; i < delegator_list.length; i++) {
			let e = delegator_list[i]
			if (e.length > 0 && e != delegator_id) {
				after_undelegate_delegator_list.push(e)
			}
		}

		validator.delegator_count -= 1
		validator.delegator_list_string = after_undelegate_delegator_list.join(',')

		validator.save()
	}

	static destroy(validator_id: string): void {
		let validator = Validator.load(validator_id)!;
		validator.share_balance = BigInt.zero()
		validator.total_share_balance = BigInt.zero()
		validator.staked_balance = BigInt.zero()
		validator.total_staked_balance = BigInt.zero()
		validator.status = "Destroyed" 
		validator.save()
	}

	static updateStakedByPing(validator_id: string, new_total_staked_balance: BigInt): void {
		let validator = Validator.load(validator_id)!
		validator.total_staked_balance = new_total_staked_balance
		validator.staked_balance = staked_balance_from_shares(
			validator.total_staked_balance,
			validator.total_share_balance,
			validator.share_balance
		)

		let delegator_list = validator.delegator_list_string.split(',');

		for (let i = 0; i < delegator_list.length; i++) {
			let delegator_id = delegator_list[i]
			if (delegator_id.length == 0) {
				continue
			}

			let delegator = Delegator.load(delegator_id)!
			delegator.staked_balance = staked_balance_from_shares(
				validator.total_staked_balance,
				validator.total_share_balance,
				delegator.share_balance
			)
			delegator.save()
		}
		validator.save()
	}
}