import { JSON } from "assemblyscript-json"
import { Delegator, Validator } from "../../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { staked_balance_from_shares } from "../util"


export class DelegatorHelper {
	static newOrUpdateByDelegatorInfo( 
		delegator_info: JSON.Obj
	): Delegator {

		let delegator_id = delegator_info.getString("delegator_id")!.valueOf()
		let delegator = Delegator.load(delegator_id)
		if(!delegator) {
			delegator = new Delegator(delegator_id)
			delegator.delegator_id = delegator_id
		}
		delegator.select_validator = delegator_info.getString("select_validator_id")?delegator_info.getString("select_validator_id")!.valueOf():null 
		delegator.share_balance = BigInt.fromString(delegator_info.getString("share_balance")!.valueOf())

		if(delegator.select_validator) {
			let validator = Validator.load(delegator.select_validator!)!
			delegator.staked_balance = staked_balance_from_shares(
				validator.total_staked_balance,
				validator.total_share_balance,
				delegator.share_balance
			)  
		} else {
			delegator.staked_balance = BigInt.zero()
		}

		delegator.save()
		return delegator
	}

}