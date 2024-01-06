import { JSON } from "assemblyscript-json";
import { ConsumerChain, StakeAction, Staker, Validator, ValidatorAndConsumerChain } from "../../generated/schema";
import { convertStringToBigInt, remove_s_at_array } from "../util";
import { StakerAndConsumerChainHelper } from "./staker_and_consumer_chain";
import { ValidatorHelper } from "../lpos_market/validator";

export class StakerHelper {
	static newOrUpdateByStakerInfo(staker_info: JSON.Obj): Staker {
		let staker_id = staker_info.getString("staker_id")!.valueOf()
		let staker = Staker.load(staker_id)
		if(!staker) {
			staker = new Staker(staker_id)
			staker.bonding_consumer_chain_count = 0
			staker.bonding_consumer_chain_list_string = [].join(',')
		}
		staker.staker_id = staker_id
		staker.select_staking_pool_id = staker_info.getString("select_staking_pool")!.valueOf()
		staker.select_staking_pool = staker_info.getString("select_staking_pool")!.valueOf(),
		staker.shares = convertStringToBigInt(staker_info.getString("shares")!.valueOf()),
	  
		staker.max_bonding_unlock_period = convertStringToBigInt(staker_info.getString("max_bonding_unlock_period")!.valueOf()) 
		staker.unbonding_unlock_time = convertStringToBigInt(staker_info.getString("unbonding_unlock_time")!.valueOf())

		staker.save()
		return staker
	}

	static bond(staker_id: string, consumer_chain_id: string): Staker {
		let staker = Staker.load(staker_id)!
		staker.bonding_consumer_chain_count += 1
		let cc_list = staker.bonding_consumer_chain_list_string.split(',')// (<JSON.Arr>(JSON.parse(validator.delegator_json))).valueOf();
		cc_list.push(consumer_chain_id)

		staker.bonding_consumer_chain_list_string = cc_list.join(',')
		staker.save()


		if(staker.validator) {
			let validator = Validator.load(staker.validator!)!
			validator.bonding_consumer_chain_count += 1
			validator.save()
		}

		let consumer_chain = ConsumerChain.load(consumer_chain_id)!
		consumer_chain.staker_count +=1
		let staker_list = consumer_chain.staker_list_string.split(",")
		staker_list.push(staker_id)
		consumer_chain.staker_list_string = staker_list.join(",")
		consumer_chain.save()

		return staker
	}

	static unbond(staker_id: string, consumer_chain_id: string): Staker {
		let staker = Staker.load(staker_id)!
		let cc_list = staker.bonding_consumer_chain_list_string.split(',')// (<JSON.Arr>(JSON.parse(validator.delegator_json))).valueOf();

		let after_unbond_cc_list = remove_s_at_array(cc_list, consumer_chain_id)

		staker.bonding_consumer_chain_count -= 1
		staker.bonding_consumer_chain_list_string = after_unbond_cc_list.join(',')
		staker.save()

		if(staker.validator) {
			let validator = Validator.load(staker.validator!)!
			validator.bonding_consumer_chain_count -= 1
			validator.save()
		}

		let consumer_chain = ConsumerChain.load(consumer_chain_id)!
		consumer_chain.staker_count -=1
		let staker_list = consumer_chain.staker_list_string.split(",")
		staker_list = remove_s_at_array(staker_list, staker_id)
		consumer_chain.staker_list_string = staker_list.join(",")
		consumer_chain.save()

		return staker
	}

	 static unstake(staker_id: string): void {
		let staker = Staker.load(staker_id)!
		let cc_list = staker.bonding_consumer_chain_list_string.split(',')// (<JSON.Arr>(JSON.parse(validator.delegator_json))).valueOf();
		for(let i = 0 ; i< cc_list.length;i++) {
			let consumer_chain_id = cc_list[i]
			StakerAndConsumerChainHelper.unbond(staker_id, consumer_chain_id)
		}
		staker.bonding_consumer_chain_count = 0
		staker.bonding_consumer_chain_list_string = [].join(',')
		staker.select_staking_pool = null
		staker.select_staking_pool_id = null
		staker.save()

		if(staker.validator) {
			let validator = Validator.load(staker.validator!)!
			validator.bonding_consumer_chain_count = 0
			validator.save()
		}
	 }
}