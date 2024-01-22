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

		staking_pool.unlock_epoch = BigInt.zero()
		staking_pool.last_unstake_epoch = BigInt.zero()
		// staking_pool.last_unstake_batch_id
		staking_pool.current_unstake_batch_id = BigInt.zero()
		staking_pool.batched_unstake_amount = BigInt.zero()
		staking_pool.submitted_unstake_batches_count = 0

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

	static updateByStakingPoolInfoJsonObj(staking_pool_info: JSON.Obj): StakingPool {
		let pool_id = staking_pool_info.getString("pool_id")!.valueOf()
		let staking_pool = StakingPool.load(pool_id)!
		staking_pool.total_share_balance = convertStringToBigInt(staking_pool_info.getString("total_share_balance")!.valueOf())
		staking_pool.total_staked_balance = convertStringToBigInt(staking_pool_info.getString("total_staked_balance")!.valueOf())

		if(staking_pool_info.get("unlock_epoch")) {
		 staking_pool.unlock_epoch = BigInt.fromString(staking_pool_info.getString("unlock_epoch")!.valueOf())
		}

		if(staking_pool_info.getString("last_unstake_epoch")) {
		 staking_pool.last_unstake_epoch = BigInt.fromString(staking_pool_info.getString("last_unstake_epoch")!.valueOf())
		}

		if(staking_pool_info.getString("last_unstake_batch_id")) {
		
		 staking_pool.last_unstake_batch_id = BigInt.fromString(staking_pool_info.getString("last_unstake_batch_id")!.valueOf())
		}

		if(staking_pool_info.get("current_unstake_batch_id")) {
			staking_pool.current_unstake_batch_id = BigInt.fromString(staking_pool_info.getString("current_unstake_batch_id")!.valueOf())
		}

		if(staking_pool_info.get("batched_unstake_amount")) {
			staking_pool.batched_unstake_amount = BigInt.fromString(staking_pool_info.getString("batched_unstake_amount")!.valueOf())
		}

		if(staking_pool_info.get("submitted_unstake_batches_count")) {
			staking_pool.submitted_unstake_batches_count = <i32>staking_pool_info.getInteger("submitted_unstake_batches_count")!.valueOf()
		}	

		staking_pool.save()
		return staking_pool
	}

}