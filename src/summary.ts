import { BigInt } from "@graphprotocol/graph-ts";
import { StakingPool, Summary } from "../generated/schema";

export const SummaryId = "summary"

export class SummaryHelper {

	private static default(): Summary {
		let summary = new Summary(SummaryId)
		summary.chain_count = 0
		summary.staker_count = 0
		summary.validator_count = 0
		summary.delegator_count = 0
		summary.staking_pool_list = ""
		summary.total_staked_near = BigInt.zero()
		return summary
	}

	public static getOrNew(): Summary {
		let summary = Summary.load(SummaryId)
		return summary ? summary : this.default()
	}

	public static addStakingPool(pool_id: string): Summary {
		let summary = this.getOrNew()
		summary.staking_pool_list = summary.staking_pool_list + "," + pool_id  
		summary.save()
		return summary
	}

	public static updateTotalStake(): Summary {
		let summary = this.getOrNew()
		let staking_pools = summary.staking_pool_list.split(",").filter(e=>e!="")
		let total_staked_near = BigInt.zero()
		if (staking_pools) {
			for (let i = 0; i < staking_pools.length; i++) {
				let staking_pool = StakingPool.load(staking_pools[i])!
				total_staked_near = total_staked_near.plus(staking_pool.total_staked_balance)
			}
		}
		summary.total_staked_near = total_staked_near
		summary.save()
		return summary
	}
} 