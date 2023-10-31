import { JSON } from "assemblyscript-json";
import { StakeAction, Staker } from "../../generated/schema";
import { convertStringToBigInt } from "../util";

export class StakerHelper {
	static newOrUpdateByStakerInfo(staker_info: JSON.Obj): Staker {
		let staker_id = staker_info.getString("staker_id")!.valueOf()
		let staker = Staker.load(staker_id)
		if(!staker) {
			staker = new Staker(staker_id)
			staker.bonding_consumer_chain_count = 0
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

	static bond(staker_id: string): Staker {
		let staker = Staker.load(staker_id)!
		staker.bonding_consumer_chain_count += 1
		staker.save()
		return staker
	}

	static unbond(staker_id: string): Staker {
		let staker = Staker.load(staker_id)!
		staker.bonding_consumer_chain_count -= 1
		staker.save()
		return staker
	}
}