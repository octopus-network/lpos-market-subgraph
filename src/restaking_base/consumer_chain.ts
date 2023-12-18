import { JSON } from "assemblyscript-json";
import { ConsumerChain, Staker } from "../../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";

export class ConsumerChainHelper {

	private static updateAllStakersUnbondingPeriod(
		staker_list_string: string,
		consumer_chain_id: string,
		new_unbonding_period: BigInt
	): void {
		let cache_cc_period = new Map<string, BigInt>()
		cache_cc_period.set(consumer_chain_id, new_unbonding_period)
		let staker_ids = staker_list_string.split(",")
		for (let i = 0; i < staker_ids.length; i++) {
			let staker_id = staker_ids[i]
			if (!staker_id) continue
			let staker = Staker.load(staker_id)!
			if (!staker) continue
			let max_bonding_unlock_period = BigInt.zero()
			let cc_ids = staker.bonding_consumer_chain_list_string.split(",")
			for (let j = 0; j < cc_ids.length; j++) {
				let cc_id = cc_ids[j]
				if (!cc_id) continue
				let cc_ub_pd: BigInt;
				if (cache_cc_period.has(cc_id)) {
					cc_ub_pd = cache_cc_period.get(cc_id)
				} else {
					cc_ub_pd = ConsumerChain.load(cc_id)!.unbonding_period
					cache_cc_period.set(cc_id, cc_ub_pd)
				}
				if (max_bonding_unlock_period.lt(cc_ub_pd)) {
					max_bonding_unlock_period = cc_ub_pd
				}
			}
			staker.max_bonding_unlock_period = max_bonding_unlock_period
			staker.save()
		}
	}

	static newOrUpdateByConsumerChainInfo(consumer_chain_info: JSON.Obj, is_update_unbonding_period: bool): ConsumerChain {

		let consumer_chain_id = consumer_chain_info.getString("consumer_chain_id")!.valueOf()
		let consumer_chain = ConsumerChain.load(consumer_chain_id)

		if (!consumer_chain) {
			consumer_chain = new ConsumerChain(consumer_chain_id)
			consumer_chain.staker_count = 0
			consumer_chain.staker_list_string = [].join(",")
		}

		consumer_chain.consumer_chain_id = consumer_chain_id
		let unbonding_period: BigInt;
		if (consumer_chain_info.getInteger("unbond_period")) {
			unbonding_period = BigInt.fromI64(consumer_chain_info.getInteger("unbond_period")!.valueOf())
		} else {
			unbonding_period = BigInt.fromI64(consumer_chain_info.getInteger("unbonding_period")!.valueOf())
		}
		if (is_update_unbonding_period) {
			this.updateAllStakersUnbondingPeriod(
				consumer_chain.staker_list_string,
				consumer_chain.consumer_chain_id,
				unbonding_period
			)
		}
		consumer_chain.unbonding_period = unbonding_period
		consumer_chain.website = consumer_chain_info.getString("website")!.valueOf()
		consumer_chain.governance = consumer_chain_info.getString("governance")!.valueOf()
		consumer_chain.treasury = consumer_chain_info.getString("treasury")!.valueOf()
		consumer_chain.status = consumer_chain_info.getString("status")!.valueOf()
		consumer_chain.pos_account_id = consumer_chain_info.getString("pos_account_id")!.valueOf()
		consumer_chain.register_fee = BigInt.fromString(consumer_chain_info.getString("register_fee")!.valueOf())
		consumer_chain.save()
		return consumer_chain
	}

}