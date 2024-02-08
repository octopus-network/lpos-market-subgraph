import { BigInt } from "@graphprotocol/graph-ts";
import { StakingPool, Summary, Validator } from "../generated/schema";

export const SummaryId = "summary"

export class SummaryHelper {

	private static default(): Summary {
		let summary = new Summary(SummaryId)
		summary.chain_count = 0
		summary.staker_count = 0
		summary.validator_count = 0
		summary.all_validator_count = 0
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
	
	public static stake(validator_id: string): void {
		let summary = this.getOrNew()
		summary.staking_validator_list = summary.staking_validator_list + "," + validator_id
		summary.validator_count+=1
		summary.save()
	}

	public static unstake(validator_id: string): void {
		let summary = this.getOrNew()
		let staking_validators = summary.staking_validator_list.split(",").filter(e=>e!="")
		let new_staking_validators: Array<string> = []
		for(let i =0 ;i<staking_validators.length;i++) {
			if(staking_validators[i] != validator_id) {
			new_staking_validators.push(staking_validators[i])
			}
		}
		summary.staking_validator_list = new_staking_validators.join(",")
		summary.validator_count -= 1
		summary.save()

	}

	public static updateTotalStake(): Summary {
		let summary = this.getOrNew()
		let staking_validators = summary.staking_validator_list.split(",").filter(e=>e!="")
		let total_staked_near = BigInt.zero()
		if (staking_validators) {
			for (let i = 0; i < staking_validators.length; i++) {
				let validator = Validator.load(staking_validators[i])!
				total_staked_near = total_staked_near.plus(validator.total_staked_balance)
			}
		}
		summary.total_staked_near = total_staked_near
		summary.save()
		return summary
	}
} 