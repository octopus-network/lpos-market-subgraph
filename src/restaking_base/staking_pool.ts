import { BigInt } from "@graphprotocol/graph-ts";
import { JSON } from "assemblyscript-json";
import { StakingPool } from "../../generated/schema";
import { convertStringToBigInt } from "../util";
import { SummaryHelper, SummaryId } from "../summary";

export class StakingPoolHelper {

	static newStakingPool(pool_id: string): void {
		let staking_pool = new StakingPool(pool_id)
		staking_pool.pool_id = pool_id
		staking_pool.total_share_balance = BigInt.zero()
		staking_pool.total_staked_balance = BigInt.zero()
		staking_pool.save()
		SummaryHelper.addStakingPool(pool_id)
	}

	static updateByPing(ping_obj: JSON.Obj): void {
		let pool_id = ping_obj.getString("pool_id")!.valueOf() 
		let new_total_staked_balance = ping_obj.getString("new_total_staked_balance")!.valueOf()
		let pool = StakingPool.load(pool_id)!
		pool.total_staked_balance = BigInt.fromString(new_total_staked_balance)
		pool.save()
	}

	static updateByStakingPoolInfoJsonObj(staking_pool_info: JSON.Obj): void {
		let pool_id = staking_pool_info.getString("pool_id")!.valueOf()
		let staking_pool = StakingPool.load(pool_id)!
		staking_pool.total_share_balance = convertStringToBigInt(staking_pool_info.getString("total_share_balance")!.valueOf())
		staking_pool.total_staked_balance = convertStringToBigInt(staking_pool_info.getString("total_staked_balance")!.valueOf())
		staking_pool.save()
	}

}