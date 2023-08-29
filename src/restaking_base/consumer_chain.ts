import { JSON } from "assemblyscript-json";
import { ConsumerChain } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export class ConsumerChainHelper {
	static newOrUpdateByConsumerChainInfo(consumer_chain_info: JSON.Obj): ConsumerChain {

		let consumer_chain_id = consumer_chain_info.getString("consumer_chain_id")!.valueOf()
		let consumer_chain = ConsumerChain.load(consumer_chain_id)

		if(!consumer_chain) {
			consumer_chain = new ConsumerChain(consumer_chain_id)
		}

		consumer_chain.consumer_chain_id = consumer_chain_id
		consumer_chain.unbond_period = BigInt.fromI64(consumer_chain_info.getInteger("unbond_period")!.valueOf())
		consumer_chain.website = consumer_chain_info.getString("website")!.valueOf()
		consumer_chain.governance = consumer_chain_info.getString("governance")!.valueOf()
		consumer_chain.treasury = consumer_chain_info.getString("treasury")!.valueOf()
		consumer_chain.status = consumer_chain_info.getString("status")!.valueOf()
		consumer_chain.pos_account_id = consumer_chain_info.getString("pos_account_id")!.valueOf()
		consumer_chain.register_fee = BigInt.fromString(consumer_chain_info.getString("register_fee")!.valueOf())
		consumer_chain.is_registered_in_lposmarket = false
		consumer_chain.save()
		return consumer_chain
	}

	static register_in_lpos_market(consumer_chain_id: string): void {
		let consumer_chain = ConsumerChain.load(consumer_chain_id)!
		consumer_chain.is_registered_in_lposmarket = true
		consumer_chain.save()
	}
}